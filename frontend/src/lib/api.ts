import axios from 'axios';
import { DecisionType, Signal } from '../types';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export interface CreateReviewPayload {
  message_id: string;
  conversation_id: string;
  decision: DecisionType;
  prompt: string;
  output: string;
  signals: string[];
  note?: string;
}

export async function postReview(payload: CreateReviewPayload) {
  const res = await axios.post(`${API}/reviews`, payload);
  return res.data;
}

export async function listReviews(conversationId?: string) {
  const params = conversationId ? { conversation_id: conversationId } : {};
  const res = await axios.get(`${API}/reviews`, { params });
  return res.data;
}

export function signalsToStrings(signals: Signal[]): string[] {
  return signals.map((s) => s.label);
}
