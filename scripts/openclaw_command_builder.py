#!/usr/bin/env python3
"""
Convert posting_queue.json into OpenClaw-ready Telegram command blocks.

Input:
  - fursbliss_growth/posting_queue.json

Output:
  - fursbliss_growth/openclaw_telegram_commands.md

This is review-first and generates prompt commands (no direct posting side effects).
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List


def load_queue(path: Path) -> List[Dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not isinstance(data.get("items"), list):
        raise ValueError("Invalid queue JSON format: expected { items: [] }")
    return data["items"]


def normalize_name(text: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "_" for ch in text).strip("_")


def render_prompt_block(item: Dict[str, Any], index: int) -> str:
    platform = str(item.get("platform", "X"))
    content_type = str(item.get("content_type", "post"))
    scheduled_local = str(item.get("scheduled_local", "unspecified"))
    title = str(item.get("title", "Untitled"))
    body = str(item.get("body", "")).strip()
    destination = str(item.get("destination", "")).strip()

    block = [
        f"### {index}. {platform} - {title}",
        "",
        "Run this task:",
        f'Publish a draft {content_type} on {platform}.',
        f"Scheduled local time: {scheduled_local}",
        f"Title: {title}",
        f"Body: {body}",
        f"Destination URL: {destination}",
        "Rules:",
        "- Keep wording unchanged unless platform character limits require trimming.",
        "- Keep tone helpful and non-spammy.",
        "- Return a short confirmation with posted link or failure reason.",
        "",
        "---",
        "",
    ]
    return "\n".join(block)


def render_scheduled_stub(item: Dict[str, Any], index: int) -> str:
    """
    Optional helper line in case user wants command-based scheduling in OpenClaw.
    This outputs a plain text stub they can adapt to their OpenClaw command format.
    """
    platform = normalize_name(str(item.get("platform", "x")))
    title = normalize_name(str(item.get("title", "untitled"))
                          )[:40] or "item"
    scheduled_local = str(item.get("scheduled_local", "unspecified"))
    return (
        f"# schedule_stub_{index}\n"
        f"# name=fursbliss_{platform}_{title}\n"
        f"# when_local={scheduled_local}\n"
        "# command=<your openclaw publish command here>\n"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Build OpenClaw Telegram command blocks from posting queue.")
    parser.add_argument(
        "--queue",
        default="fursbliss_growth/posting_queue.json",
        help="Path to posting_queue.json",
    )
    parser.add_argument(
        "--output",
        default="fursbliss_growth/openclaw_telegram_commands.md",
        help="Output markdown file path",
    )
    args = parser.parse_args()

    queue_path = Path(args.queue)
    output_path = Path(args.output)

    items = load_queue(queue_path)
    generated_at = datetime.now(timezone.utc).isoformat()

    header = [
        "# OpenClaw Telegram Commands (Generated)",
        "",
        f"- Generated UTC: {generated_at}",
        f"- Source queue: `{queue_path}`",
        f"- Items: {len(items)}",
        "",
        "Copy/paste each `Run this task:` block into OpenClaw Telegram.",
        "",
        "---",
        "",
    ]

    blocks: List[str] = []
    for i, item in enumerate(items, start=1):
        blocks.append(render_prompt_block(item, i))

    stubs_header = [
        "## Optional Scheduling Stubs",
        "",
        "If you want recurring scheduled tasks in OpenClaw command format, adapt these:",
        "",
    ]
    stubs = [render_scheduled_stub(item, i) for i, item in enumerate(items, start=1)]

    content = "\n".join(header + blocks + stubs_header + stubs)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")

    print(f"Wrote: {output_path}")
    print("Done.")


if __name__ == "__main__":
    main()
