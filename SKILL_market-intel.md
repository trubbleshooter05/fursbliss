---
name: market-intel
description: SaaS opportunity discovery from Google Trends, Reddit, HN, Autocomplete, Product Hunt
---

# Market Intelligence v3

## Overview
Discovers high-potential SaaS opportunities from 5 free data sources daily.

## Sources
- **Google Trends** — Trending & rising searches for tool/SaaS/problem keywords
- **Google Autocomplete** — What people actively search right now
- **Reddit** — Pain points from SaaS/startup communities
- **HackerNews** — Top stories with market signals
- **Product Hunt** — New launches with SaaS signals

## Output
- Writes top opportunities to `~/ObsidianVault/ideas/market_intel.md`
- Deduplicates against prior runs
- Sends summary to Telegram
- Logs to `~/ObsidianVault/logs/automation_runs.md`

## Requirements
- pytrends (pip install pytrends)
- requests, beautifulsoup4 (usually pre-installed)
- TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in ~/.hermes/.env

## Schedule
Recommended: Daily 11 AM (non-blocking, ~2-3 min runtime)
