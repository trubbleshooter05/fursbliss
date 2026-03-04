#!/usr/bin/env python3
"""
Build an OpenClaw-ready social posting pack from FursBliss marketing copy.

Outputs (under --output-dir):
  - openclaw_social_queue.json
  - openclaw_social_queue.csv
  - openclaw_social_tasks.md
  - manual_exports/tiktok_manual_queue.csv
  - manual_exports/x_manual_queue.csv
  - manual_exports/*.txt (ready-to-post drafts)

Designed for cron usage (no network side effects, review-first).
"""

from __future__ import annotations

import argparse
import csv
import json
from dataclasses import asdict, dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import List


@dataclass
class CampaignItem:
    day_index: int
    day_title: str
    content_type: str
    platforms: str
    hook_text: str
    caption: str
    hashtags: str
    cta_text: str
    destination_url: str
    scheduled_local: str
    image_url: str
    status: str = "pending_human_approval"


# Ready-to-post concepts/copy from docs/marketing/er-triage-social-calendar.md
SOCIAL_CALENDAR = [
    {
        "day_title": "Day 1 - Problem Hook",
        "content_type": "reel",
        "platforms": "TikTok,Instagram Reels,Facebook Reels",
        "hook_text": "Before you rush to pet ER, do this first.",
        "caption": (
            "Pet emergencies are stressful. Our new safety-first ER Triage Assistant helps "
            "dog owners decide: ER now, vet today, or monitor at home. Link in bio."
        ),
        "hashtags": "#DogParents #PetHealth #DogMom #DogDad #VetVisit #DogWellness #FursBliss",
        "cta_text": "Link in bio",
        "destination_url": "https://www.fursbliss.com/er-triage-for-dogs",
    },
    {
        "day_title": "Day 2 - Feature Spotlight",
        "content_type": "carousel",
        "platforms": "Instagram,Facebook",
        "hook_text": "New: Dog ER Triage Assistant",
        "caption": "Fast urgency guidance when you're not sure what to do next.",
        "hashtags": "#DogHealthTips #PetCare #SeniorDog #DogCommunity #PetOwner",
        "cta_text": "Try now",
        "destination_url": "https://www.fursbliss.com/triage",
    },
    {
        "day_title": "Day 3 - Vaccine Hub Reveal",
        "content_type": "carousel",
        "platforms": "Instagram,Facebook",
        "hook_text": "Stop losing vaccine records.",
        "caption": (
            "Vaccine Hub is now live in FursBliss. Store dates, due reminders, clinic notes, "
            "and record links for every pet."
        ),
        "hashtags": "#PetRecords #DogCare #PuppyCare #DogHealth #PetParents",
        "cta_text": "Open vaccine hub",
        "destination_url": "https://www.fursbliss.com/pets",
    },
    {
        "day_title": "Day 4 - User Outcome Post",
        "content_type": "feed",
        "platforms": "Instagram,Facebook,LinkedIn",
        "hook_text": "Better prep, calmer vet visits.",
        "caption": (
            "Organized records and triage prep can save time, stress, and unnecessary ER costs."
        ),
        "hashtags": "#VetPrep #DogOwners #PetParentLife #DogWellness",
        "cta_text": "See how it works",
        "destination_url": "https://www.fursbliss.com/er-triage-for-dogs",
    },
    {
        "day_title": "Day 5 - Story Sequence",
        "content_type": "stories",
        "platforms": "Instagram Stories,Facebook Stories",
        "hook_text": "Not sure if it's urgent? Run ER Triage in 60 seconds.",
        "caption": "Story CTA sticker text: Try now",
        "hashtags": "#DogStories #PetTips #DogHealth",
        "cta_text": "Try now",
        "destination_url": "https://www.fursbliss.com/triage",
    },
    {
        "day_title": "Day 6 - Educational Short",
        "content_type": "reel",
        "platforms": "TikTok,Instagram Reels,YouTube Shorts",
        "hook_text": "Red flags you should never ignore.",
        "caption": (
            "If your dog has breathing trouble, collapse, seizure, or heavy bleeding, "
            "skip triage and go ER now."
        ),
        "hashtags": "#PetEmergency #DogSafety #DogParents",
        "cta_text": "Save this post",
        "destination_url": "https://www.fursbliss.com/er-triage-for-dogs",
    },
    {
        "day_title": "Day 7 - Conversion Push",
        "content_type": "feed+story",
        "platforms": "Instagram,Facebook",
        "hook_text": "Premium unlock this week.",
        "caption": (
            "Unlock full ER triage analysis, home-care guidance, and vet-prep checklists with Premium."
        ),
        "hashtags": "#PetTech #DogCareApp #FursBliss #DogHealth",
        "cta_text": "Start free trial",
        "destination_url": "https://www.fursbliss.com/pricing?from=er-triage-social",
    },
]


def schedule_for_day(start: date, day_index: int, default_time: str) -> str:
    publish_date = start + timedelta(days=day_index - 1)
    return f"{publish_date.isoformat()} {default_time}"


def write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def write_csv(path: Path, rows: List[CampaignItem]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    headers = list(asdict(rows[0]).keys()) if rows else []
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        for row in rows:
            writer.writerow(asdict(row))


def write_markdown_tasks(path: Path, rows: List[CampaignItem], generated_at: str) -> None:
    blocks: List[str] = [
        "# OpenClaw Social Tasks (Generated)",
        "",
        f"- Generated UTC: {generated_at}",
        f"- Items: {len(rows)}",
        "- Mode: review-first (human approval required)",
        "",
    ]
    for idx, row in enumerate(rows, start=1):
        blocks.extend(
            [
                f"## {idx}. {row.day_title}",
                f"- Scheduled local: `{row.scheduled_local}`",
                f"- Platforms: `{row.platforms}`",
                f"- Content type: `{row.content_type}`",
                f"- Hook: {row.hook_text}",
                f"- Caption: {row.caption}",
                f"- Hashtags: {row.hashtags}",
                f"- CTA: {row.cta_text}",
                f"- URL: {row.destination_url}",
                f"- Image URL (Meta/IG): {row.image_url}",
                "",
            ]
        )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(blocks), encoding="utf-8")


def write_manual_exports(base_dir: Path, rows: List[CampaignItem]) -> None:
    manual_dir = base_dir / "manual_exports"
    manual_dir.mkdir(parents=True, exist_ok=True)

    tiktok_rows = []
    x_rows = []
    for item in rows:
        hashtags_spaced = item.hashtags
        hashtags_compact = " ".join(
            tag for tag in hashtags_spaced.split() if tag.startswith("#")
        )
        draft = (
            f"{item.hook_text}\n\n"
            f"{item.caption}\n\n"
            f"{hashtags_spaced}\n\n"
            f"{item.destination_url}"
        )
        safe_name = f"day{item.day_index:02d}_{item.content_type.replace('+', '_')}"
        (manual_dir / f"{safe_name}.txt").write_text(draft, encoding="utf-8")

        if "TikTok" in item.platforms:
            tiktok_rows.append(
                {
                    "day_index": item.day_index,
                    "day_title": item.day_title,
                    "scheduled_local": item.scheduled_local,
                    "hook_text": item.hook_text,
                    "caption": item.caption,
                    "hashtags": hashtags_spaced,
                    "destination_url": item.destination_url,
                    "draft_file": f"{safe_name}.txt",
                }
            )
        if "X" in item.platforms or "Twitter" in item.platforms:
            x_text = f"{item.hook_text} {item.caption} {hashtags_compact} {item.destination_url}".strip()
            x_rows.append(
                {
                    "day_index": item.day_index,
                    "day_title": item.day_title,
                    "scheduled_local": item.scheduled_local,
                    "x_post_text": x_text[:280],
                    "destination_url": item.destination_url,
                    "draft_file": f"{safe_name}.txt",
                }
            )

    # Ensure at least one X manual row from this campaign
    if not x_rows:
        for item in rows:
            x_text = f"{item.hook_text} {item.destination_url} #FursBliss #DogHealth"
            x_rows.append(
                {
                    "day_index": item.day_index,
                    "day_title": item.day_title,
                    "scheduled_local": item.scheduled_local,
                    "x_post_text": x_text[:280],
                    "destination_url": item.destination_url,
                    "draft_file": f"day{item.day_index:02d}_{item.content_type.replace('+', '_')}.txt",
                }
            )

    def write_dict_csv(path: Path, rows_dict: List[dict]) -> None:
        if not rows_dict:
            return
        with path.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(rows_dict[0].keys()))
            writer.writeheader()
            writer.writerows(rows_dict)

    write_dict_csv(manual_dir / "tiktok_manual_queue.csv", tiktok_rows)
    write_dict_csv(manual_dir / "x_manual_queue.csv", x_rows)


def build_queue(
    start: date,
    default_time: str,
    default_image_url: str,
) -> List[CampaignItem]:
    rows: List[CampaignItem] = []
    for i, base in enumerate(SOCIAL_CALENDAR, start=1):
        rows.append(
            CampaignItem(
                day_index=i,
                day_title=base["day_title"],
                content_type=base["content_type"],
                platforms=base["platforms"],
                hook_text=base["hook_text"],
                caption=base["caption"],
                hashtags=base["hashtags"],
                cta_text=base["cta_text"],
                destination_url=base["destination_url"],
                scheduled_local=schedule_for_day(start, i, default_time),
                image_url=default_image_url,
            )
        )
    return rows


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate OpenClaw-ready social queue from FursBliss campaign assets."
    )
    parser.add_argument(
        "--openclaw-root",
        default="/Users/ladmin",
        help="OpenClaw server root path.",
    )
    parser.add_argument(
        "--output-subdir",
        default="fursbliss_growth/openclaw_social",
        help="Folder created under --openclaw-root for queue + assets.",
    )
    parser.add_argument(
        "--start-date",
        default=date.today().isoformat(),
        help="Campaign day 1 date in YYYY-MM-DD.",
    )
    parser.add_argument(
        "--default-time",
        default="09:00",
        help="Default local post time for each day (HH:MM).",
    )
    parser.add_argument(
        "--default-image-url",
        default="https://www.fursbliss.com/og-default.jpg",
        help="Image URL used for Meta/Instagram autoposts.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    now = datetime.now(timezone.utc).isoformat()

    root = Path(args.openclaw_root)
    output_dir = root / args.output_subdir

    start = date.fromisoformat(args.start_date)
    queue = build_queue(start, args.default_time, args.default_image_url)

    write_manual_exports(output_dir, queue)
    write_json(
        output_dir / "openclaw_social_queue.json",
        {
            "generated_at_utc": now,
            "openclaw_root": str(root),
            "output_dir": str(output_dir),
            "item_count": len(queue),
            "items": [asdict(item) for item in queue],
        },
    )
    write_csv(output_dir / "openclaw_social_queue.csv", queue)
    write_markdown_tasks(output_dir / "openclaw_social_tasks.md", queue, now)

    print(f"Wrote: {output_dir / 'openclaw_social_queue.json'}")
    print(f"Wrote: {output_dir / 'openclaw_social_queue.csv'}")
    print(f"Wrote: {output_dir / 'openclaw_social_tasks.md'}")
    print(f"Wrote manual downloads to: {output_dir / 'manual_exports'}")
    print("Done. Review queue and approve inside OpenClaw before posting.")


if __name__ == "__main__":
    main()
