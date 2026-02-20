#!/usr/bin/env python3
"""
Lean v1 marketing orchestrator for FursBliss.

Generates:
1) weekly_hooks.json
2) ad_variants.json
3) posting_queue.json

This is intentionally review-first (no auto-posting side effects).
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass, asdict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import List


@dataclass
class Hook:
    day: str
    angle: str
    hook: str
    cta: str
    destination: str


@dataclass
class AdVariant:
    name: str
    audience: str
    creative_direction: str
    primary_text: str
    headline: str
    cta_label: str
    destination: str


@dataclass
class QueueItem:
    platform: str
    content_type: str
    scheduled_local: str
    title: str
    body: str
    destination: str
    status: str = "draft"


def week_dates(start: date) -> List[date]:
    return [start + timedelta(days=i) for i in range(7)]


def build_hooks(brand_url: str, start: date) -> List[Hook]:
    angles = [
        ("Emotional", "More good days together start with better tracking."),
        ("Clinical", "Early changes are easier to catch than late-stage decline."),
        ("LOY-002", "Build a baseline now so future treatment decisions are smarter."),
        ("Practical", "Track appetite, mobility, sleep, and stool in one place."),
        ("Trust", "Bring cleaner trend data to your next vet visit."),
        ("Breed-Specific", "Senior large breeds age differently. Track what matters early."),
        ("Urgency", "A small trend today can prevent a bigger issue next month."),
    ]

    hooks: List[Hook] = []
    for idx, d in enumerate(week_dates(start)):
        angle, hook_text = angles[idx]
        destination = f"{brand_url}/quiz" if idx % 2 == 0 else f"{brand_url}/longevity-drugs"
        hooks.append(
            Hook(
                day=d.isoformat(),
                angle=angle,
                hook=hook_text,
                cta="Take the free 60-second quiz",
                destination=destination,
            )
        )
    return hooks


def build_ad_variants(brand_url: str) -> List[AdVariant]:
    return [
        AdVariant(
            name="emotional_variant_a",
            audience="Senior dog owners 35-65 US",
            creative_direction="Owner + senior dog bond moment, warm home light, high contrast headline",
            primary_text="You are not late. Tracking today can protect more good days ahead.",
            headline="More good days together",
            cta_label="Take Quiz",
            destination=f"{brand_url}/quiz",
        ),
        AdVariant(
            name="evidence_variant_b",
            audience="Senior dog owners interested in longevity research",
            creative_direction="Simple chart motif + calm clinical palette, no fear tactics",
            primary_text="Daily baseline tracking helps you catch subtle changes earlier.",
            headline="Early signals matter",
            cta_label="Check Readiness",
            destination=f"{brand_url}/quiz",
        ),
        AdVariant(
            name="loy002_variant_c",
            audience="Owners searching LOY-002 updates",
            creative_direction="Clean productless informational card with LOY-002 timeline framing",
            primary_text="LOY-002 timelines may move fast. Build your dog's baseline before approval windows shift.",
            headline="Plan before it is urgent",
            cta_label="View LOY-002 Hub",
            destination=f"{brand_url}/longevity-drugs",
        ),
        AdVariant(
            name="vet_ready_variant_d",
            audience="Owners who value practical vet prep",
            creative_direction="Checklist-style visual: appetite, mobility, sleep, stool",
            primary_text="Bring trend data to your next vet visit instead of trying to remember details.",
            headline="Walk into appointments prepared",
            cta_label="Start Tracking",
            destination=f"{brand_url}/quiz",
        ),
        AdVariant(
            name="breed_variant_e",
            audience="Large-breed senior owners",
            creative_direction="Senior golden/lab outdoors, bold text overlay, soft teal accent",
            primary_text="Large breeds often show decline differently. Start your baseline now.",
            headline="Large breeds need earlier signals",
            cta_label="Get Score",
            destination=f"{brand_url}/quiz",
        ),
    ]


def build_queue(hooks: List[Hook], brand_url: str, start: date) -> List[QueueItem]:
    queue: List[QueueItem] = []
    for idx, h in enumerate(hooks):
        d = start + timedelta(days=idx)
        queue.append(
            QueueItem(
                platform="X",
                content_type="post",
                scheduled_local=f"{d.isoformat()} 09:15",
                title=f"{h.angle} hook",
                body=f"{h.hook} {h.cta}: {h.destination}",
                destination=h.destination,
            )
        )
        queue.append(
            QueueItem(
                platform="Facebook",
                content_type="group_post",
                scheduled_local=f"{d.isoformat()} 12:30",
                title=f"{h.angle} group post",
                body=(
                    "Senior dog owners: what changes have you noticed first as your dog aged? "
                    "Tracking daily signals helps spot patterns earlier. "
                    f"Free tool: {brand_url}/quiz"
                ),
                destination=f"{brand_url}/quiz",
            )
        )
    return queue


def write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate weekly FursBliss marketing assets.")
    parser.add_argument(
        "--brand-url",
        default="https://www.fursbliss.com",
        help="Base URL used for CTA destinations.",
    )
    parser.add_argument(
        "--output-dir",
        default="fursbliss_growth",
        help="Directory where JSON output files are written.",
    )
    parser.add_argument(
        "--start-date",
        default=date.today().isoformat(),
        help="Week start date in YYYY-MM-DD.",
    )
    args = parser.parse_args()

    start = date.fromisoformat(args.start_date)
    now = datetime.now(timezone.utc).isoformat()
    out_dir = Path(args.output_dir)

    hooks = build_hooks(args.brand_url.rstrip("/"), start)
    variants = build_ad_variants(args.brand_url.rstrip("/"))
    queue = build_queue(hooks, args.brand_url.rstrip("/"), start)

    hooks_payload = {
        "generated_at_utc": now,
        "week_start": start.isoformat(),
        "count": len(hooks),
        "items": [asdict(item) for item in hooks],
    }
    variants_payload = {
        "generated_at_utc": now,
        "count": len(variants),
        "items": [asdict(item) for item in variants],
    }
    queue_payload = {
        "generated_at_utc": now,
        "count": len(queue),
        "items": [asdict(item) for item in queue],
    }

    write_json(out_dir / "weekly_hooks.json", hooks_payload)
    write_json(out_dir / "ad_variants.json", variants_payload)
    write_json(out_dir / "posting_queue.json", queue_payload)

    print(f"Wrote: {out_dir / 'weekly_hooks.json'}")
    print(f"Wrote: {out_dir / 'ad_variants.json'}")
    print(f"Wrote: {out_dir / 'posting_queue.json'}")
    print("Done. Review outputs before publishing.")


if __name__ == "__main__":
    main()
