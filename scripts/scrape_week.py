# scripts/scrape_week.py
# Usage:
#   Live (default):    python scripts/scrape_week.py
#   Offline test:      python scripts/scrape_week.py --html-file "C:\path\to\NBA_2026_games.html"
#
# What it does:
# - NEXT 7 DAYS from today in America/Toronto (times preserved like "7:30p").
# - If next 7 days are empty (offseason), uses FIRST GAME DAY … +6 (e.g., Tue→Mon).
# - Saves UI-shaped JSON to: ../frontend/public/data/upcoming.json

import argparse
import io
import json
import random
import time
from datetime import datetime, timedelta, date
from pathlib import Path
from zoneinfo import ZoneInfo

import pandas as pd
import requests

# ----------------------------
# Config
# ----------------------------
LOCAL_TZ = ZoneInfo("America/Toronto")
SEASON_ENDING_YEAR = 2026  # NBA_2026_games.html (2025-26 season)
SEASON_URL = f"https://www.basketball-reference.com/leagues/NBA_{SEASON_ENDING_YEAR}_games.html"

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_PATH = (SCRIPT_DIR.parent / "frontend" / "public" / "data" / "upcoming.json")

# Polite delays (you run this via cron—be generous)
INITIAL_SLEEP_RANGE = (6, 12)  # seconds before first request
RETRY_BACKOFF_BASE = 8.0       # base seconds between retries
MAX_RETRIES = 4

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/127.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/",
    "Connection": "keep-alive",
}

# ----------------------------
# Team mapping (BBR name → {name, abbr, city})
# ----------------------------
TEAMS = {
    "Atlanta Hawks":              {"name": "Hawks", "abbreviation": "ATL", "city": "Atlanta"},
    "Boston Celtics":             {"name": "Celtics", "abbreviation": "BOS", "city": "Boston"},
    "Brooklyn Nets":              {"name": "Nets", "abbreviation": "BKN", "city": "Brooklyn"},
    "Charlotte Hornets":          {"name": "Hornets", "abbreviation": "CHA", "city": "Charlotte"},
    "Chicago Bulls":              {"name": "Bulls", "abbreviation": "CHI", "city": "Chicago"},
    "Cleveland Cavaliers":        {"name": "Cavaliers", "abbreviation": "CLE", "city": "Cleveland"},
    "Dallas Mavericks":           {"name": "Mavericks", "abbreviation": "DAL", "city": "Dallas"},
    "Denver Nuggets":             {"name": "Nuggets", "abbreviation": "DEN", "city": "Denver"},
    "Detroit Pistons":            {"name": "Pistons", "abbreviation": "DET", "city": "Detroit"},
    "Golden State Warriors":      {"name": "Warriors", "abbreviation": "GSW", "city": "Golden State"},
    "Houston Rockets":            {"name": "Rockets", "abbreviation": "HOU", "city": "Houston"},
    "Indiana Pacers":             {"name": "Pacers", "abbreviation": "IND", "city": "Indiana"},
    "LA Clippers":                {"name": "Clippers", "abbreviation": "LAC", "city": "Los Angeles"},
    "Los Angeles Clippers":       {"name": "Clippers", "abbreviation": "LAC", "city": "Los Angeles"},
    "Los Angeles Lakers":         {"name": "Lakers", "abbreviation": "LAL", "city": "Los Angeles"},
    "Memphis Grizzlies":          {"name": "Grizzlies", "abbreviation": "MEM", "city": "Memphis"},
    "Miami Heat":                 {"name": "Heat", "abbreviation": "MIA", "city": "Miami"},
    "Milwaukee Bucks":            {"name": "Bucks", "abbreviation": "MIL", "city": "Milwaukee"},
    "Minnesota Timberwolves":     {"name": "Timberwolves", "abbreviation": "MIN", "city": "Minnesota"},
    "New Orleans Pelicans":       {"name": "Pelicans", "abbreviation": "NOP", "city": "New Orleans"},
    "New York Knicks":            {"name": "Knicks", "abbreviation": "NYK", "city": "New York"},
    "Oklahoma City Thunder":      {"name": "Thunder", "abbreviation": "OKC", "city": "Oklahoma City"},
    "Orlando Magic":              {"name": "Magic", "abbreviation": "ORL", "city": "Orlando"},
    "Philadelphia 76ers":         {"name": "76ers", "abbreviation": "PHI", "city": "Philadelphia"},
    "Phoenix Suns":               {"name": "Suns", "abbreviation": "PHX", "city": "Phoenix"},
    "Portland Trail Blazers":     {"name": "Trail Blazers", "abbreviation": "POR", "city": "Portland"},
    "Sacramento Kings":           {"name": "Kings", "abbreviation": "SAC", "city": "Sacramento"},
    "San Antonio Spurs":          {"name": "Spurs", "abbreviation": "SAS", "city": "San Antonio"},
    "Toronto Raptors":            {"name": "Raptors", "abbreviation": "TOR", "city": "Toronto"},
    "Utah Jazz":                  {"name": "Jazz", "abbreviation": "UTA", "city": "Utah"},
    "Washington Wizards":         {"name": "Wizards", "abbreviation": "WAS", "city": "Washington"},
}

# ----------------------------
# Fetch (very polite)
# ----------------------------
def fetch_html(url: str) -> str:
    s = requests.Session()
    s.headers.update(HEADERS)

    # Initial wait
    time.sleep(random.uniform(*INITIAL_SLEEP_RANGE))

    # Warm-up homepage to collect benign cookies
    try:
        s.get("https://www.basketball-reference.com/", timeout=30, allow_redirects=True)
        time.sleep(random.uniform(1.0, 2.0))
    except requests.RequestException:
        pass

    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            # small pre-attempt jitter
            time.sleep(random.uniform(0.5, 1.5))
            resp = s.get(url, timeout=30, allow_redirects=True)
            if resp.status_code in (403, 429, 503):
                last_err = requests.HTTPError(f"{resp.status_code} for {url}")
                # backoff grows each attempt
                time.sleep(RETRY_BACKOFF_BASE * attempt + random.uniform(4, 8))
                continue
            resp.raise_for_status()
            return resp.text
        except requests.RequestException as e:
            last_err = e
            time.sleep(RETRY_BACKOFF_BASE * attempt + random.uniform(4, 8))
            continue

    raise last_err or RuntimeError("Failed to fetch HTML")

# ----------------------------
# Parse schedule tables
# ----------------------------
def parse_schedule_html(html: str) -> pd.DataFrame:
    # Use StringIO to avoid pandas FutureWarning for literal HTML
    tables = pd.read_html(io.StringIO(html))

    # pick monthly schedule tables
    sched_like = []
    for t in tables:
        cols = [str(c).lower() for c in t.columns.tolist()]
        if "date" in cols and any("visitor" in c for c in cols) and any("home" in c for c in cols):
            sched_like.append(t)
    if not sched_like:
        raise RuntimeError("Could not find schedule tables on the page.")

    df = pd.concat(sched_like, ignore_index=True)

    # robust column mapping
    colmap, visitor_pts_seen = {}, False
    for c in df.columns:
        lc = str(c).lower()
        if lc.startswith("date"):
            colmap[c] = "date"
        elif "start" in lc:
            colmap[c] = "start_et"
        elif "visitor" in lc:
            colmap[c] = "visitor"
        elif "home" in lc:
            colmap[c] = "home"
        elif lc == "pts" and not visitor_pts_seen:
            colmap[c] = "visitor_pts"; visitor_pts_seen = True
        elif lc == "pts" and visitor_pts_seen:
            colmap[c] = "home_pts"
        elif "arena" in lc:
            colmap[c] = "arena"
        elif "notes" in lc:
            colmap[c] = "notes"
        elif "attend" in lc:
            colmap[c] = "attendance"
    df = df.rename(columns=colmap)

    # remove repeated header rows; keep rows whose Date looks like "Tue, Oct 21, 2025"
    df = df[df["date"].astype(str).str.contains(",")].copy()

    # parse dates
    df["game_date"] = df["date"].apply(lambda s: datetime.strptime(s.strip(), "%a, %b %d, %Y").date())

    # clean strings
    for col in ["start_et","visitor","home","arena","notes"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    return df

def fetch_schedule_df_live() -> pd.DataFrame:
    html = fetch_html(SEASON_URL)
    return parse_schedule_html(html)

# ----------------------------
# Window helpers (NEXT 7 DAYS)
# ----------------------------
def next_7_days_or_offseason(df: pd.DataFrame, today: date) -> tuple[pd.DataFrame, date]:
    """
    Return (window_df, start_date).
    - Try [today .. today+6].
    - If empty (offseason), use [first_game_date .. +6].
    """
    end = today + timedelta(days=6)
    window = df[(df["game_date"] >= today) & (df["game_date"] <= end)].copy()
    if window.empty:
        start = df["game_date"].min()
        end = start + timedelta(days=6)
        window = df[(df["game_date"] >= start) & (df["game_date"] <= end)].copy()
        return window, start
    return window, today

def weekday_name(d: date) -> str:
    return d.strftime("%A")

# ----------------------------
# Build UI JSON (next-7-days)
# ----------------------------
def to_ui_json(window: pd.DataFrame, start: date) -> dict:
    # Group games by date in the 7-day window
    by_date = {}
    for d, chunk in window.sort_values(["game_date", "start_et"]).groupby("game_date"):
        games = []
        gid = 1
        for _, r in chunk.iterrows():
            home = r.get("home")
            away = r.get("visitor")
            arena = r.get("arena") or None
            time_et = r.get("start_et") if r.get("start_et") and str(r.get("start_et")).lower() != "nan" else None

            # Map teams (fallback if unexpected label appears)
            home_map = TEAMS.get(home, {
                "name": (home.split()[-1] if home else None),
                "abbreviation": None,
                "city": (home.split()[0] if home else None)
            })
            away_map = TEAMS.get(away, {
                "name": (away.split()[-1] if away else None),
                "abbreviation": None,
                "city": (away.split()[0] if away else None)
            })

            games.append({
                "id": gid,
                "homeTeam": {
                    "name": home_map["name"],
                    "abbreviation": home_map["abbreviation"],
                    "city": home_map["city"]
                },
                "awayTeam": {
                    "name": away_map["name"],
                    "abbreviation": away_map["abbreviation"],
                    "city": away_map["city"]
                },
                "time": time_et,         # keep "7:30p" style
                "venue": arena,
                "date": d.isoformat(),
                "prediction": {
                    "winner": "TBD",
                    "confidence": 0,
                    "spread": None,
                    "overUnder": None
                },        # intentionally empty
                "gameStatus": "scheduled"
            })
            gid += 1
        by_date[d] = games

    # Build exactly seven consecutive day keys using the real weekday names in this rolling window
    current_week = {}
    for i in range(7):
        this_day = start + timedelta(days=i)
        label = weekday_name(this_day)   # "Tuesday", etc.
        current_week[label] = by_date.get(this_day, [])

    total_games = sum(len(v) for v in current_week.values())
    payload = {
        "currentWeek": current_week,
        "metadata": {
            "lastUpdated": datetime.now(tz=LOCAL_TZ).isoformat(),
            "weekStartDate": start.isoformat(),
            "weekEndDate": (start + timedelta(days=6)).isoformat(),
            "totalGames": total_games,
            "dataSource": "Basketball-Reference (parsed)",
            "version": "1.0"
        }
    }
    return payload

# ----------------------------
# Main
# ----------------------------
def main():
    ap = argparse.ArgumentParser(description="Build next-7-days NBA schedule JSON for the site.")
    ap.add_argument("--html-file", help="Parse from a local saved HTML file instead of fetching live.")
    args = ap.parse_args()

    # 1) Fetch + parse
    if args.html_file:
        print(f"[main] Parsing local file: {args.html_file}")
        with open(args.html_file, "r", encoding="utf-8") as f:
            html = f.read()
        df = parse_schedule_html(html)
    else:
        df = fetch_schedule_df_live()

    # 2) NEXT 7 DAYS (or offseason first 7)
    today = datetime.now(tz=LOCAL_TZ).date()
    window, start = next_7_days_or_offseason(df, today)

    # 3) Build UI-shaped JSON
    payload = to_ui_json(window, start)

    # 4) Save
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    # 5) Console confirmation
    print(f"Saved {sum(len(v) for v in payload['currentWeek'].values())} games "
          f"for {payload['metadata']['weekStartDate']} → {payload['metadata']['weekEndDate']}")
    print(f"→ {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
