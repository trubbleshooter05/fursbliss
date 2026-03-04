#!/usr/bin/env python3
"""
All-in-one manual social prep for OpenClaw (TikTok/X without APIs).

What it does in one run:
  1) Reads openclaw_social_queue.json (same source used for Meta/IG queue).
  2) Auto-generates manual copy files for TikTok + X per day.
  3) Auto-downloads media from queue image_url when day media is missing.
  4) Pairs dayXX copy + media and writes ready-to-post outputs.

Outputs:
  - manual_exports/dayXX_tiktok.txt
  - manual_exports/dayXX_x.txt
  - manual_exports/posting_manifest.csv
  - manual_exports/posting_checklist.md
  - manual_exports/ready/dayXX_ready.txt
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urlparse
from urllib.request import urlopen


DAY_PATTERN = re.compile(r"^(day\d{2})_", re.IGNORECASE)
MEDIA_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".mov", ".m4v"}
IMAGE_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


@dataclass
class DayPack:
    day_key: str
    copy_files: List[Path]
    feed_media: List[Path]
    story_media: List[Path]

    def status(self) -> str:
        has_copy = bool(self.copy_files)
        has_media = bool(self.feed_media or self.story_media)
        if has_copy and has_media:
            return "ready"
        if has_copy and not has_media:
            return "missing_media"
        if not has_copy and has_media:
            return "missing_copy"
        return "missing_copy_and_media"

    def choose_media(self) -> Optional[Path]:
        # If copy name implies story/reel, prefer story media first.
        copy_names = " ".join(path.name.lower() for path in self.copy_files)
        if "story" in copy_names or "reel" in copy_names:
            if self.story_media:
                return sorted(self.story_media, key=lambda p: p.name.lower())[0]
            if self.feed_media:
                return sorted(self.feed_media, key=lambda p: p.name.lower())[0]
            return None
        if self.feed_media:
            return sorted(self.feed_media, key=lambda p: p.name.lower())[0]
        if self.story_media:
            return sorted(self.story_media, key=lambda p: p.name.lower())[0]
        return None

    def choose_copy(self) -> Optional[Path]:
        if not self.copy_files:
            return None
        ranked = sorted(
            self.copy_files,
            key=lambda p: (
                0 if "_tiktok" in p.name.lower() else 1 if "_x" in p.name.lower() else 2,
                p.name.lower(),
            ),
        )
        return ranked[0]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build posting manifest/checklist by pairing dayXX copy with dayXX media."
    )
    parser.add_argument(
        "--openclaw-root",
        default="/Users/ladmin",
        help="OpenClaw server root path.",
    )
    parser.add_argument(
        "--output-subdir",
        default="fursbliss_growth/openclaw_social",
        help="Folder under --openclaw-root containing assets/ and manual_exports/.",
    )
    parser.add_argument(
        "--expected-days",
        default="day01,day02,day03,day04,day05,day06,day07",
        help="Comma-separated day keys to always include in reports.",
    )
    parser.add_argument(
        "--queue-file",
        default="openclaw_social_queue.json",
        help="Queue JSON filename under social root.",
    )
    parser.add_argument(
        "--skip-sync",
        action="store_true",
        help="Skip auto-generating copy + downloading missing media from queue.",
    )
    parser.add_argument(
        "--overwrite-copy",
        action="store_true",
        help="Overwrite existing dayXX_tiktok.txt / dayXX_x.txt files.",
    )
    return parser.parse_args()


def day_key_for_file(path: Path) -> Optional[str]:
    match = DAY_PATTERN.match(path.name)
    if not match:
        return None
    return match.group(1).lower()


def day_key_for_index(day_index: int) -> str:
    return f"day{day_index:02d}"


def list_copy_files(manual_dir: Path) -> Dict[str, List[Path]]:
    copy_map: Dict[str, List[Path]] = {}
    for path in manual_dir.glob("*.txt"):
        day_key = day_key_for_file(path)
        if not day_key:
            continue
        copy_map.setdefault(day_key, []).append(path)
    return copy_map


def list_media_files(media_dir: Path) -> Dict[str, List[Path]]:
    media_map: Dict[str, List[Path]] = {}
    if not media_dir.exists():
        return media_map
    for path in media_dir.iterdir():
        if not path.is_file() or path.suffix.lower() not in MEDIA_EXTENSIONS:
            continue
        day_key = day_key_for_file(path)
        if not day_key:
            continue
        media_map.setdefault(day_key, []).append(path)
    return media_map


def clip_x_text(text: str, limit: int = 280) -> str:
    compact = " ".join(text.split())
    if len(compact) <= limit:
        return compact
    return compact[: limit - 1].rstrip() + "…"


def load_queue_items(queue_path: Path) -> List[dict]:
    if not queue_path.exists():
        return []
    try:
        payload = json.loads(queue_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    items = payload.get("items")
    if isinstance(items, list):
        return [item for item in items if isinstance(item, dict)]
    return []


def write_if_needed(path: Path, content: str, overwrite: bool) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and not overwrite:
        return
    path.write_text(content.strip() + "\n", encoding="utf-8")


def infer_extension_from_url_or_type(url: str, content_type: str) -> str:
    lower_type = (content_type or "").split(";")[0].strip().lower()
    if lower_type in IMAGE_CONTENT_TYPES:
        return IMAGE_CONTENT_TYPES[lower_type]
    parsed = urlparse(url)
    suffix = Path(parsed.path).suffix.lower()
    if suffix in MEDIA_EXTENSIONS:
        return suffix
    return ".jpg"


def download_media(url: str, out_path_no_ext: Path) -> Optional[Path]:
    try:
        with urlopen(url, timeout=20) as response:
            data = response.read()
            content_type = response.headers.get("Content-Type", "")
    except Exception:
        return None
    if not data:
        return None
    ext = infer_extension_from_url_or_type(url, content_type)
    out_path = out_path_no_ext.with_suffix(ext)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(data)
    return out_path


def has_media_for_day(feed_map: Dict[str, List[Path]], story_map: Dict[str, List[Path]], day_key: str) -> bool:
    return bool(feed_map.get(day_key) or story_map.get(day_key))


def sync_from_queue(
    queue_items: List[dict],
    manual_dir: Path,
    feed_dir: Path,
    feed_map: Dict[str, List[Path]],
    story_map: Dict[str, List[Path]],
    overwrite_copy: bool,
) -> None:
    for item in queue_items:
        day_idx = item.get("day_index")
        if not isinstance(day_idx, int):
            continue
        day_key = day_key_for_index(day_idx)
        hook = str(item.get("hook_text", "")).strip()
        caption = str(item.get("caption", "")).strip()
        hashtags = str(item.get("hashtags", "")).strip()
        destination_url = str(item.get("destination_url", "")).strip()
        image_url = str(item.get("image_url", "")).strip()

        tiktok_copy = (
            f"{hook}\n\n{caption}\n\n{hashtags}\n\n{destination_url}"
        ).strip()
        x_copy = clip_x_text(f"{hook} {caption} {hashtags} {destination_url}".strip())

        write_if_needed(manual_dir / f"{day_key}_tiktok.txt", tiktok_copy, overwrite_copy)
        write_if_needed(manual_dir / f"{day_key}_x.txt", x_copy, overwrite_copy)

        if not has_media_for_day(feed_map, story_map, day_key) and image_url.startswith(("http://", "https://")):
            downloaded = download_media(image_url, feed_dir / f"{day_key}_meta-sync_feed")
            if downloaded:
                feed_map.setdefault(day_key, []).append(downloaded)


def relative_to_social_root(path: Optional[Path], social_root: Path) -> str:
    if not path:
        return ""
    try:
        return str(path.relative_to(social_root))
    except ValueError:
        return str(path)


def build_day_packs(
    expected_days: List[str],
    copy_map: Dict[str, List[Path]],
    feed_map: Dict[str, List[Path]],
    story_map: Dict[str, List[Path]],
) -> List[DayPack]:
    all_keys = set(expected_days) | set(copy_map.keys()) | set(feed_map.keys()) | set(story_map.keys())
    packs = [
        DayPack(
            day_key=key,
            copy_files=copy_map.get(key, []),
            feed_media=feed_map.get(key, []),
            story_media=story_map.get(key, []),
        )
        for key in sorted(all_keys)
    ]
    return packs


def write_manifest(path: Path, packs: List[DayPack], social_root: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rows = []
    for pack in packs:
        copy_file = pack.choose_copy()
        media_file = pack.choose_media()
        rows.append(
            {
                "day": pack.day_key,
                "status": pack.status(),
                "copy_file": relative_to_social_root(copy_file, social_root),
                "media_file": relative_to_social_root(media_file, social_root),
                "copy_count": len(pack.copy_files),
                "feed_media_count": len(pack.feed_media),
                "story_media_count": len(pack.story_media),
            }
        )

    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()) if rows else [])
        if rows:
            writer.writeheader()
            writer.writerows(rows)


def write_checklist(path: Path, packs: List[DayPack], social_root: Path) -> None:
    lines: List[str] = [
        "# Manual Posting Checklist",
        "",
        "Use this checklist for TikTok/X manual posting.",
        "",
    ]

    ready_count = 0
    for pack in packs:
        status = pack.status()
        copy_file = pack.choose_copy()
        media_file = pack.choose_media()
        icon = "✅" if status == "ready" else "⚠️"
        if status == "ready":
            ready_count += 1

        lines.append(f"## {icon} {pack.day_key.upper()} - {status.replace('_', ' ')}")
        lines.append(f"- Copy: `{relative_to_social_root(copy_file, social_root) or 'MISSING'}`")
        lines.append(f"- Media: `{relative_to_social_root(media_file, social_root) or 'MISSING'}`")
        if len(pack.copy_files) > 1:
            lines.append("- Note: multiple copy files found, preferring TikTok copy, then X, then alphabetical fallback.")
        if len(pack.feed_media) + len(pack.story_media) > 1:
            lines.append("- Note: multiple media files found, using first preferred match.")
        lines.append("")

    lines.extend(
        [
            "---",
            "",
            f"Ready days: **{ready_count}/{len(packs)}**",
            "",
            "One-line rule: keep all media in `assets/` and name files with `day01..day07`.",
            "",
        ]
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def write_ready_files(ready_dir: Path, packs: List[DayPack], social_root: Path) -> None:
    ready_dir.mkdir(parents=True, exist_ok=True)
    for pack in packs:
        if pack.status() != "ready":
            continue
        copy_file = pack.choose_copy()
        media_file = pack.choose_media()
        if not copy_file or not media_file:
            continue
        copy_text = copy_file.read_text(encoding="utf-8").strip()
        payload = (
            "PLATFORM: tiktok,x\n"
            f"DAY: {pack.day_key}\n"
            f"MEDIA: {relative_to_social_root(media_file, social_root)}\n\n"
            "CAPTION:\n"
            f"{copy_text}\n"
        )
        (ready_dir / f"{pack.day_key}_ready.txt").write_text(payload, encoding="utf-8")


def main() -> None:
    args = parse_args()
    social_root = Path(args.openclaw_root) / args.output_subdir
    manual_dir = social_root / "manual_exports"
    feed_dir = social_root / "assets" / "feed"
    story_dir = social_root / "assets" / "story"

    expected_days = [d.strip().lower() for d in args.expected_days.split(",") if d.strip()]

    feed_map = list_media_files(feed_dir)
    story_map = list_media_files(story_dir)
    if not args.skip_sync:
        queue_items = load_queue_items(social_root / args.queue_file)
        sync_from_queue(
            queue_items=queue_items,
            manual_dir=manual_dir,
            feed_dir=feed_dir,
            feed_map=feed_map,
            story_map=story_map,
            overwrite_copy=args.overwrite_copy,
        )
        # Re-scan copy/media after sync to include newly generated files.
        feed_map = list_media_files(feed_dir)
        story_map = list_media_files(story_dir)

    copy_map = list_copy_files(manual_dir)
    packs = build_day_packs(expected_days, copy_map, feed_map, story_map)

    write_manifest(manual_dir / "posting_manifest.csv", packs, social_root)
    write_checklist(manual_dir / "posting_checklist.md", packs, social_root)
    write_ready_files(manual_dir / "ready", packs, social_root)

    print(f"Wrote: {manual_dir / 'posting_manifest.csv'}")
    print(f"Wrote: {manual_dir / 'posting_checklist.md'}")
    print(f"Wrote ready files to: {manual_dir / 'ready'}")


if __name__ == "__main__":
    main()
