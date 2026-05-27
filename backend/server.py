import os
from datetime import datetime, timezone
from typing import Annotated, List, Optional, Literal
from contextlib import asynccontextmanager

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

load_dotenv()

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")


def _validate_object_id(v):
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str):
        return v
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[str, BeforeValidator(_validate_object_id)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude_none=True)
        if "_id" in data and data["_id"] is None:
            data.pop("_id")
        return data

    @classmethod
    def from_mongo(cls, doc: dict):
        if doc is None:
            return None
        return cls(**doc)


DecisionType = Literal["approved", "rejected", "challenged"]


class ReviewDecision(BaseDocument):
    message_id: str
    conversation_id: str
    decision: DecisionType
    prompt: str
    output: str
    signals: List[str] = []
    note: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ReviewDecisionCreate(BaseModel):
    message_id: str
    conversation_id: str
    decision: DecisionType
    prompt: str
    output: str
    signals: List[str] = []
    note: Optional[str] = None


client: Optional[AsyncIOMotorClient] = None
db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    yield
    client.close()


app = FastAPI(title="Claude Checkpoint API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "claude-checkpoint"}


def _serialize(decision: ReviewDecision) -> dict:
    # Serialize with `id` (not `_id`) so the public API contract uses `id`.
    return decision.model_dump(by_alias=False)


@app.post("/api/reviews")
async def create_review(payload: ReviewDecisionCreate):
    decision = ReviewDecision(**payload.model_dump())
    result = await db.reviews.insert_one(decision.to_mongo())
    decision.id = str(result.inserted_id)
    return _serialize(decision)


@app.get("/api/reviews")
async def list_reviews(conversation_id: Optional[str] = None, limit: int = 100):
    limit = max(1, min(limit, 500))
    query = {}
    if conversation_id:
        query["conversation_id"] = conversation_id
    cursor = db.reviews.find(query).sort("created_at", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [_serialize(ReviewDecision.from_mongo(d)) for d in docs]


@app.get("/api/reviews/{review_id}")
async def get_review(review_id: str):
    try:
        doc = await db.reviews.find_one({"_id": ObjectId(review_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid review id")
    if not doc:
        raise HTTPException(status_code=404, detail="Review not found")
    return _serialize(ReviewDecision.from_mongo(doc))
