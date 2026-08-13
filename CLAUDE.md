# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## WAT Framework

This project uses the **WAT architecture** (Workflows → Agents → Tools):

- **Workflows** (`workflows/`): Markdown SOPs defining objective, inputs, tool sequence, outputs, and error handling. Read the relevant workflow before doing anything. Don't create or overwrite workflows without asking.
- **Agents** (you): Orchestrate tool execution, handle failures, and keep workflows updated as you learn.
- **Tools** (`tools/`): Python scripts that do the actual work. Always check `tools/` for an existing script before writing new code.

Deliverables go to cloud services (Google Slides, Sheets, etc.). Everything in `.tmp/` is disposable scratch space.

---

## Running the Pipeline

**Full end-to-end report (runs all 5 steps):**
```bash
python tools/run_weekly_report.py
```

**Run individual steps:**
```bash
python tools/fetch_youtube_data.py        # Step 1: YouTube API → .tmp/youtube_data.json
python tools/scrape_youtube_playwright.py # Step 2: Headed browser → .tmp/screenshots/, .tmp/thumbnails/
python tools/analyze_themes_gemini.py     # Step 3: Gemini → .tmp/analysis.json
python tools/create_google_slides.py      # Step 4: Google Slides → .tmp/slides_url.txt
python tools/send_gmail.py               # Step 5: Gmail → email to collindickinson4@gmail.com
```

All commands must be run from the **project root** (the directory containing `CLAUDE.md`). The orchestrator (`run_weekly_report.py`) sets `os.chdir` to the project root automatically, but individual tools rely on relative paths like `.tmp/` and `credentials.json`.

---

## Implemented Automation: YouTube Trend Report

The only automation currently built is `workflows/youtube_trend_report.md`. It runs weekly (Monday 9am via Windows Task Scheduler) and produces a 4-slide Google Slides deck covering:

1. Title slide (week + date range)
2. Top trending videos table (top 8, ranked by view count)
3. Content themes & patterns (Gemini analysis)
4. Video recommendations + surprise insight

**Keywords monitored** (defined in `tools/fetch_youtube_data.py` → `KEYWORDS`):
`"Claude AI"`, `"Claude tips"`, `"AI tools 2025"`, `"best AI tools"`, `"prompt engineering"`

---

## Credentials & Environment

| File | Purpose |
|------|---------|
| `.env` | `YOUTUBE_API_KEY`, `GEMINI_API_KEY` |
| `credentials.json` | Google OAuth Desktop client (must enable Slides API, Drive API, Gmail API in Google Cloud Console) |
| `token.json` | Auto-generated OAuth token cache. Delete to force re-auth. |

Google OAuth scopes used: `presentations`, `drive.file`, `gmail.send`. If any scope is missing from the OAuth client, delete `token.json` and re-run to trigger a fresh consent flow.

---

## Key API Constraints

**Google Slides API** — the Python client is quirky:
- `transform.translateX` / `translateY` must be **plain EMU integers** (points × 12700), not `{"magnitude": ..., "unit": "EMU"}` objects (those are only for `size` fields)
- Text `foregroundColor` requires `{"opaqueColor": {"rgbColor": {...}}}` — not bare `{"rgbColor": {...}}`
- Paragraph `alignment` uses `"START"` / `"CENTER"` / `"END"` — **not** `"LEFT"` / `"RIGHT"`
- Outline weight of `0` is rejected — omit the outline field entirely for borderless shapes
- Batch all requests for a single slide into one `batchUpdate` call per slide function

**YouTube Data API v3** — quota is 10,000 units/day. Each `search.list` call costs 100 units. The weekly run uses ~600 units total (safe).

**Gemini** — `gemini-2.0-flash` is retired for new users. Use `gemini-2.5-flash` (defined in `tools/analyze_themes_gemini.py` → `MODEL`). Uses `google-genai` SDK (`from google import genai`), not the deprecated `google-generativeai` package.

**Windows terminal** — the terminal encoding is `cp1252` by default and can't print emoji that appear in YouTube video titles. `run_weekly_report.py` calls `sys.stdout.reconfigure(encoding="utf-8", errors="replace")` at startup; individual tools run standalone in a subprocess context and don't need this.

**Playwright** — runs in headed mode (real visible browser). Install browser once with `python -m playwright install chromium`. The scraping step is non-fatal: the orchestrator continues if it fails.

---

## Dependencies

Install with:
```bash
pip install -r requirements.txt
python -m playwright install chromium
```

Key packages: `google-api-python-client`, `google-genai`, `google-auth-oauthlib`, `playwright`, `python-dotenv`, `isodate`, `pandas`, `pillow`.
