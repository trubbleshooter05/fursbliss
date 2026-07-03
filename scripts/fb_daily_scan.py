#!/usr/bin/env python3
"""Hermes daily FB group scan — finds relevant posts + drafts reply copy.

Follows openclaw_automation_policy.json:
- human_approval_required (never auto-posts)
- grief/crisis threads get support-only drafts (no link)
- stdout = one Telegram summary; full report -> Obsidian
"""
from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

load_dotenv(Path.home() / ".hermes" / ".env")

from fb_keywords import COMMUNITY_LINK, draft_reply, link_allowed, classify_post  # noqa: E402
from fb_scraper_v2 import GROUPS, run_scraper  # noqa: E402

POLICY_PATH = SCRIPT_DIR.parent / "fursbliss_growth" / "openclaw_automation_policy.json"
REPORT_DIR = Path.home() / "ObsidianVault" / "fursbliss" / "fb_outreach" / "scans"
LOG_PATH = Path.home() / "ObsidianVault" / "logs" / "automation_runs.md"

# Priority groups (joined + high-signal). Rotates 3/day.
DAILY_GROUP_IDS = [
    "682454455106203",  # Support group for owners of sick/senior dogs
    "iHeartSeniorDogs",
    "seniordogcareclub",
    "dogcancersupport",
    "caninearthritis",
    "caninecognitivedysfunctiondoggydementia",
    "doghealthandnutritionadvice",
]


def require_paths() -> None:
    hermes_env = Path.home() / ".hermes" / ".env"
    if not hermes_env.exists():
        print("Required Hermes path missing: ~/.hermes/.env", file=sys.stderr)
        sys.exit(1)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.touch(exist_ok=True)


def groups_for_today(today: datetime) -> list[dict]:
    by_id = {g["id"]: g for g in GROUPS}
    pool = [by_id[gid] for gid in DAILY_GROUP_IDS if gid in by_id]
    if not pool:
        pool = GROUPS[:3]
    day = int(today.strftime("%j"))
    start = (day - 1) % len(pool)
    picked = []
    for i in range(min(3, len(pool))):
        picked.append(pool[(start + i) % len(pool)])
    return picked


def unique_report_path(today: datetime) -> Path:
    base = REPORT_DIR / f"{today.strftime('%Y-%m-%d')}.md"
    if not base.exists():
        return base
    return REPORT_DIR / f"{today.strftime('%Y-%m-%d_%H%M%S')}.md"


def save_report(path: Path, rows: list[dict], groups: list[dict], today: datetime) -> None:
    lines = [
        f"# FB Group Scan — {today.strftime('%Y-%m-%d')}",
        "",
        f"Groups scanned: {', '.join(g['name'] for g in groups)}",
        f"Tracked link: {COMMUNITY_LINK}",
        f"Matches: {len(rows)}",
        "",
        "**Human approval required before posting any reply.**",
        "",
    ]
    if not rows:
        lines.extend([
            "No matching posts found today.",
            "",
            "Troubleshooting:",
            "- Run `~/projects/fursbliss/scripts/fb_login.sh` if session expired",
            "- Confirm you're still a member of today's groups",
            "",
        ])
    else:
        for i, row in enumerate(rows, 1):
            reply = draft_reply(row.get("snippet", ""))
            lines.extend([
                f"## {i}. {row.get('group_name', 'Unknown group')}",
                "",
                f"**URL:** {row.get('post_url', '')}",
                f"**Type:** {row.get('post_type') or classify_post(row.get('snippet', ''))}",
                f"**Keywords:** {row.get('keywords', '')}",
                f"**Link OK:** {'yes' if link_allowed(row.get('snippet', '')) else 'no — support only'}",
                "",
                "**Snippet:**",
                f"> {row.get('snippet', '')[:400]}",
                "",
                "**Draft reply (edit before posting):**",
                "```",
                reply,
                "```",
                "",
            ])
    path.write_text("\n".join(lines), encoding="utf-8")


def append_log(report_path: Path, count: int, today: datetime) -> None:
    with LOG_PATH.open("a", encoding="utf-8") as fh:
        fh.write(f"- {today.isoformat()} | FB Group Scan | {count} matches | {report_path}\n")


def print_summary(rows: list[dict], groups: list[dict], report_path: Path) -> None:
    lines = [
        "FB Group Scan",
        f"Groups: {', '.join(g['name'] for g in groups)}",
        f"Matches: {len(rows)} (human approval before replying)",
        f"Report: {report_path}",
    ]
    for i, row in enumerate(rows[:3], 1):
        snippet = (row.get("snippet") or "")[:120].replace("\n", " ")
        lines.append(f"{i}. {row.get('group_name')}: {snippet}...")
        lines.append(f"   {row.get('post_url')}")
    if len(rows) > 3:
        lines.append(f"+ {len(rows) - 3} more in report")
    if not rows:
        lines.append("No matches — check report for troubleshooting.")
    print("\n".join(lines))


def main() -> int:
    require_paths()
    today = datetime.now()
    groups = groups_for_today(today)
    out_csv = REPORT_DIR / f"{today.strftime('%Y-%m-%d')}.csv"

    try:
        rows = run_scraper(
            headless=True,
            groups=groups,
            output_file=str(out_csv),
            scroll_passes=4,
            max_posts_per_group=5,
        )
    except Exception as exc:
        print(f"FB scan failed: {exc}", file=sys.stderr)
        print(f"FB Group Scan FAILED\nError: {exc}\nRun: python3 {SCRIPT_DIR}/fb_scraper_v2.py --login")
        return 1

    if rows is None:
        rows = []

    report_path = unique_report_path(today)
    save_report(report_path, rows, groups, today)
    append_log(report_path, len(rows), today)
    print_summary(rows, groups, report_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
