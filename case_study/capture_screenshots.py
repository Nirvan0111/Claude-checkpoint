"""
Case-study screenshot capture for Claude Checkpoint.

Produces 12 high-resolution PNG screenshots in /app/case_study/screenshots/.
Runs against the live preview URL.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

URL = "https://eval-signals.preview.emergentagent.com"
OUT = Path("/app/case_study/screenshots")
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1920, 1200


async def shot(page, name: str):
    path = OUT / name
    await page.screenshot(path=str(path), type="png", full_page=False)
    print(f"  ✓ {name} ({path.stat().st_size // 1024} KB)")


async def open_panel(page):
    """Send the Postgres suggestion and open Checkpoint. Returns the assistant msg locator."""
    await page.goto(URL, wait_until="networkidle", timeout=30_000)
    await page.wait_for_timeout(600)
    await page.locator('[data-testid="welcome-suggestion-2"]').click(force=True)
    await page.wait_for_selector('[data-testid^="open-checkpoint-inline-"]', timeout=10_000)
    await page.wait_for_timeout(400)


async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox"])
        ctx = await browser.new_context(viewport={"width": W, "height": H}, device_scale_factor=1)

        # ─── Screenshot 01 — home with "+" menu open + prompt being typed ────────
        page = await ctx.new_page()
        await page.goto(URL, wait_until="networkidle", timeout=30_000)
        await page.wait_for_timeout(800)
        ta = page.locator('[data-testid="chat-input-textarea"]')
        await ta.click()
        await ta.fill(
            "Outline a careful migration plan from Postgres 14 to Postgres 16 "
            "for our production reporting cluster."
        )
        await page.wait_for_timeout(150)
        await page.locator('[data-testid="action-menu-trigger"]').click(force=True)
        await page.wait_for_selector('[data-testid="action-menu"]', timeout=4_000)
        await page.wait_for_timeout(300)
        await shot(page, "01-home-with-plus-menu.png")
        await page.close()

        # ─── Screenshot 02 — "Preparing review session…" transition ──────────────
        page = await ctx.new_page()
        await open_panel(page)
        # Slow the 650ms preparing setTimeout so we can capture the state
        await page.evaluate(
            """
            () => {
              const orig = window.setTimeout.bind(window);
              window.setTimeout = (cb, ms, ...rest) => {
                if (ms === 650) ms = 6000;
                return orig(cb, ms, ...rest);
              };
            }
            """
        )
        await page.locator('[data-testid^="open-checkpoint-inline-"]').first.click(force=True)
        # Wait for panel slide-in (300ms) + a small margin
        await page.wait_for_selector('[data-testid="checkpoint-preparing"]', timeout=4_000)
        await page.wait_for_timeout(400)
        await shot(page, "02-checkpoint-activation.png")

        # Wait for the (extended) preparing to finish so we land in the real panel
        await page.wait_for_selector('[data-testid="review-summary"]', timeout=12_000)
        await page.wait_for_timeout(400)

        # ─── Screenshot 03 — Review overview (top of panel) ──────────────────────
        await shot(page, "03-review-overview.png")

        # ─── Screenshot 04 — Execution Review with Activity Timeline expanded ────
        panel_scroll = page.locator('[data-testid="checkpoint-panel"] .flex-1.overflow-y-auto')
        await page.locator('[data-testid="activity-timeline"]').scroll_into_view_if_needed()
        await page.locator('[data-testid="timeline-expand-all"]').click(force=True)
        await page.wait_for_timeout(350)
        await page.locator('[data-testid="activity-timeline"]').scroll_into_view_if_needed()
        await panel_scroll.evaluate("el => el.scrollBy(0, -110)")
        await page.wait_for_timeout(250)
        await shot(page, "04-execution-review-timeline.png")

        # ─── Screenshot 05 — File Explorer + Diff Viewer ─────────────────────────
        await panel_scroll.evaluate("el => el.scrollBy(0, 700)")
        await page.wait_for_timeout(300)
        await shot(page, "05-file-explorer-diff.png")

        # ─── Screenshot 06 — Protected Files (Locked + Editable) ─────────────────
        await panel_scroll.evaluate("el => el.scrollBy(0, 800)")
        await page.wait_for_timeout(300)
        # If we haven't reached protected files, scroll more
        for _ in range(4):
            if await page.locator('[data-testid="protected-files-panel"]').is_visible():
                break
            await panel_scroll.evaluate("el => el.scrollBy(0, 400)")
            await page.wait_for_timeout(200)
        # Flip the first locked file to Editable so both states show
        toggles = page.locator('[data-testid^="protected-toggle-"]')
        if await toggles.count() >= 2:
            # Click the first toggle (likely Locked → becomes Editable)
            await toggles.first.click(force=True)
            await page.wait_for_timeout(250)
        await page.locator('[data-testid="protected-files-panel"]').scroll_into_view_if_needed()
        await panel_scroll.evaluate("el => el.scrollBy(0, -40)")
        await page.wait_for_timeout(200)
        await shot(page, "06-protected-files.png")

        # ─── Screenshot 09 — Challenge results (first click → generated only) ────
        await panel_scroll.evaluate("el => el.scrollTo(0, 0)")
        await page.wait_for_timeout(200)
        await page.locator('[data-testid="challenge-action-button"]').click(force=True)
        await page.wait_for_selector(
            '[data-testid="checkpoint-panel"] [data-testid="challenge-results-section"]',
            timeout=5_000,
        )
        await page.wait_for_timeout(350)
        panel_challenge = page.locator(
            '[data-testid="checkpoint-panel"] [data-testid="challenge-results-section"]'
        )
        await panel_challenge.scroll_into_view_if_needed()
        await panel_scroll.evaluate("el => el.scrollBy(0, -40)")
        await page.wait_for_timeout(250)
        await shot(page, "09-challenge-results.png")
        await page.close()

        # ─── Screenshots 07 + 08 — inline pills + tooltip hover ──────────────────
        page = await ctx.new_page()
        await open_panel(page)
        # Center the assistant message
        msg = page.locator('[data-testid^="message-assistant-"]').first
        await msg.scroll_into_view_if_needed()
        await page.wait_for_timeout(250)
        await shot(page, "07-evaluation-layer-inline-pills.png")

        # Tooltip — hover Assumption pill (has trigger chips, most visually rich)
        assumption_wrap = page.locator('[data-testid="signal-pill-assumption-wrapper"]').first
        if await assumption_wrap.count() > 0:
            target = assumption_wrap.locator('[data-testid="signal-pill-assumption"]')
        else:
            target = page.locator('[data-testid="signal-pill-context"]').first
        await target.scroll_into_view_if_needed()
        await target.hover(force=True)
        await page.wait_for_timeout(450)
        await shot(page, "08-tooltip-hover.png")
        await page.close()

        # ─── Screenshot 10 — Decision: Approved ──────────────────────────────────
        async def decision(suggestion_idx: int, action_testid: str, filename: str):
            p2 = await ctx.new_page()
            await p2.goto(URL, wait_until="networkidle", timeout=30_000)
            await p2.wait_for_timeout(600)
            await p2.locator(f'[data-testid="welcome-suggestion-{suggestion_idx}"]').click(force=True)
            await p2.wait_for_selector('[data-testid^="open-checkpoint-inline-"]', timeout=10_000)
            await p2.wait_for_timeout(400)
            await p2.locator('[data-testid^="open-checkpoint-inline-"]').first.click(force=True)
            await p2.wait_for_selector('[data-testid="review-summary"]', timeout=8_000)
            await p2.wait_for_timeout(400)
            await p2.locator(f'[data-testid="{action_testid}"]').click(force=True)
            await p2.wait_for_timeout(900)
            await p2.locator('[data-testid^="message-assistant-"]').first.scroll_into_view_if_needed()
            await p2.wait_for_timeout(250)
            await shot(p2, filename)
            await p2.close()

        await decision(0, "approve-action-button", "10-decision-approved.png")
        await decision(1, "reject-action-button",  "11-decision-rejected.png")
        await decision(2, "rollback-action-button", "12-decision-rollback.png")

        await ctx.close()
        await browser.close()
        print("\nAll 12 screenshots captured.")


if __name__ == "__main__":
    asyncio.run(capture())
