#!/usr/bin/env python3
"""
Hermes Market Intel v3 — SaaS Opportunity Discovery Engine

Combines multiple free data sources to find high-potential SaaS ideas:
  1. Google Trends (pytrends) — trending/rising topics + related queries
  2. Reddit — pain points from SaaS/startup communities
  3. HackerNews — top stories with market signals
  4. Google Autocomplete — what people are actively searching
  5. Product Hunt (public) — what's launching and getting traction

Outputs: Obsidian vault + Telegram alerts
Runs as Hermes cron (daily recommended)

Requirements (Hermes venv):
  pip install pytrends requests beautifulsoup4

NOTE: pytrends gives RELATIVE interest (0-100), not actual monthly
search volume. For real volume/KD you need a paid tool. This script
surfaces TRENDS and SIGNALS — you validate the best ones manually
with free tools like Google Keyword Planner or Ubersuggest free tier.
"""

import sys
import os
import re
import time
import json
import difflib
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional

sys.path.insert(0, str(Path.home() / ".hermes"))

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("❌ Missing: requests or beautifulsoup4")
    print("   Install: pip install requests beautifulsoup4")
    sys.exit(1)

try:
    from pytrends.request import TrendReq
    HAS_PYTRENDS = True
except ImportError:
    HAS_PYTRENDS = False
    print("⚠️  pytrends not installed — Google Trends disabled")
    print("   Install: pip install pytrends")

from obsidian_memory import ObsidianMemory

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MAX_PRIOR_IDEAS = 300
DEDUP_THRESHOLD = 0.80
TOP_N = 12

# Seed categories to monitor in Google Trends
# These are broad SaaS/tool categories — edit to match your interests
TREND_SEEDS = [
    # Tools people search for
    "ai tool for", "saas for", "app to",
    "alternative to", "better than",
    # Problem patterns
    "how to automate", "how to track",
    "best free", "open source",
    # Verticals you care about
    "sports card", "dog health", "movie recommendation",
    "brand kit generator", "email spam checker",
]

# Subreddits to monitor
SUBREDDITS = [
    "SaaS", "startups", "SideProject", "Entrepreneur",
    "indiehackers", "webdev", "smallbusiness", "microsaas",
]


def send_telegram(message: str):
    """Send message to Telegram using env vars"""
    BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
    CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

    if not BOT_TOKEN or not CHAT_ID:
        print("⚠️  Telegram credentials not set (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)")
        return

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    try:
        # Truncate if too long for Telegram (4096 char limit)
        if len(message) > 4000:
            message = message[:3997] + "..."
        requests.post(url, json={"chat_id": CHAT_ID, "text": message}, timeout=10)
    except Exception as e:
        print(f"⚠️  Telegram send failed: {str(e)[:60]}")


class MarketIntel:
    def __init__(self):
        self.mem = ObsidianMemory()
        self.vault = Path.home() / "ObsidianVault"
        self.idea_file = self.vault / "ideas" / "market_intel.md"
        self.prior_ideas = self._load_prior_ideas()
        self.results: List[Dict] = []

    # ------------------------------------------------------------------
    # Dedup helpers
    # ------------------------------------------------------------------
    def _load_prior_ideas(self) -> List[str]:
        if not self.idea_file.exists():
            return []
        content = self.idea_file.read_text(errors="replace")
        ideas = []
        for line in content.split("\n"):
            # Match lines with status tags
            match = re.search(r'\] (.+?)(?:\s\(\*\*|\s\||\s—)', line)
            if match:
                ideas.append(self._norm(match.group(1).strip()))
        return ideas[-MAX_PRIOR_IDEAS:]

    def _norm(self, text: str) -> str:
        text = text.lower().strip()
        text = re.sub(r'[^a-z0-9\s]', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text

    def _is_dup(self, title: str) -> bool:
        norm = self._norm(title)
        for prior in self.prior_ideas:
            if difflib.SequenceMatcher(None, norm, prior).ratio() > DEDUP_THRESHOLD:
                return True
        return False

    def _add(self, title: str, source: str, score: float,
             trend_data: str = "", url: str = "", category: str = "general"):
        """Add an opportunity to results"""
        if self._is_dup(title):
            return
        self.results.append({
            "title": title[:120],
            "source": source,
            "score": round(score, 1),
            "trend_data": trend_data,
            "url": url,
            "category": category,
            "status": "NEW",
        })

    # ------------------------------------------------------------------
    # SOURCE 1: Google Trends — Rising queries + trending searches
    # ------------------------------------------------------------------
    def fetch_google_trends(self):
        """Pull rising/breakout queries and daily trending searches"""
        if not HAS_PYTRENDS:
            print("    Skipped (pytrends not installed)")
            return

        try:
            pytrends = TrendReq(hl='en-US', tz=360, timeout=(10, 25))

            # --- A) Daily trending searches (US) ---
            print("    Fetching daily trending searches...")
            try:
                trending = pytrends.trending_searches(pn='united_states')
                if trending is not None and not trending.empty:
                    for idx, row in trending.head(20).iterrows():
                        term = str(row[0]).strip()
                        if len(term) < 3:
                            continue
                        # Check if it has SaaS/tool potential
                        lower = term.lower()
                        saas_signals = ["ai", "app", "tool", "software", "platform",
                                        "api", "saas", "automation", "tracker", "monitor",
                                        "generator", "builder", "scanner", "checker"]
                        if any(s in lower for s in saas_signals):
                            self._add(
                                title=f"Trending: {term}",
                                source="Google Trends (daily)",
                                score=7.5,
                                trend_data="Daily trending in US",
                                category="trending",
                            )
                    print(f"      Got {len(trending)} trending searches")
            except Exception as e:
                print(f"      Daily trending failed: {str(e)[:60]}")

            # --- B) Rising related queries for seed terms ---
            print("    Fetching rising queries for seed terms...")
            # Process seeds in batches of 1 (pytrends rate limits)
            rising_found = 0
            for seed in TREND_SEEDS[:8]:  # Limit to avoid rate limits
                try:
                    pytrends.build_payload([seed], timeframe='today 3-m', geo='US')
                    related = pytrends.related_queries()

                    if seed in related and related[seed] and related[seed].get('rising') is not None:
                        rising_df = related[seed]['rising']
                        if not rising_df.empty:
                            for _, row in rising_df.head(5).iterrows():
                                query = str(row.get('query', '')).strip()
                                value = row.get('value', 0)
                                if len(query) < 5:
                                    continue

                                # "Breakout" means >5000% growth
                                is_breakout = str(value).lower() == 'breakout' or (isinstance(value, (int, float)) and value > 5000)

                                score = 8.5 if is_breakout else 6.0 + min(2, value / 1000) if isinstance(value, (int, float)) else 6.5
                                trend_label = "BREAKOUT" if is_breakout else f"+{value}%"

                                self._add(
                                    title=query,
                                    source=f"Google Trends (rising for '{seed}')",
                                    score=score,
                                    trend_data=trend_label,
                                    category="rising_query",
                                )
                                rising_found += 1

                    time.sleep(1.5)  # Rate limit

                except Exception as e:
                    if "429" in str(e) or "rate" in str(e).lower():
                        print(f"      Rate limited on '{seed}', waiting 30s...")
                        time.sleep(30)
                    else:
                        print(f"      Seed '{seed}' failed: {str(e)[:50]}")
                    continue

            print(f"      Found {rising_found} rising queries")

        except Exception as e:
            print(f"    Google Trends error: {str(e)[:80]}")

    # ------------------------------------------------------------------
    # SOURCE 2: Google Autocomplete — what people are typing RIGHT NOW
    # ------------------------------------------------------------------
    def fetch_google_autocomplete(self):
        """Hit Google's autocomplete API for seed phrases"""
        found = 0
        saas_seeds = [
            "best ai tool for", "app that", "alternative to",
            "saas for", "how to automate", "free tool to",
            "is there an app", "software to", "ai that can",
        ]

        for seed in saas_seeds:
            try:
                url = "https://suggestqueries.google.com/complete/search"
                params = {
                    "client": "firefox",  # Returns JSON
                    "q": seed,
                    "hl": "en",
                    "gl": "us",
                }
                resp = requests.get(url, params=params, timeout=5)
                if resp.status_code != 200:
                    continue

                data = resp.json()
                suggestions = data[1] if len(data) > 1 else []

                for suggestion in suggestions[:5]:
                    suggestion = str(suggestion).strip()
                    if len(suggestion) > len(seed) + 3:  # Must add meaningful content
                        self._add(
                            title=suggestion,
                            source="Google Autocomplete",
                            score=6.0,
                            trend_data="Active autocomplete",
                            category="autocomplete",
                        )
                        found += 1

                time.sleep(0.5)

            except Exception as e:
                print(f"      Autocomplete error for '{seed}': {str(e)[:40]}")

        print(f"    Got {found} autocomplete suggestions")

    # ------------------------------------------------------------------
    # SOURCE 3: Reddit — pain points + "what tool do you use" threads
    # ------------------------------------------------------------------
    def fetch_reddit(self):
        """Scrape Reddit for SaaS opportunity signals"""
        signal_keywords = [
            # Pain / need
            "looking for", "need a tool", "is there", "any good",
            "alternative to", "frustrated", "switched from",
            "what do you use", "recommend", "wish there was",
            "built my own", "i made", "launched", "just shipped",
            # Market signals
            "paying for", "subscription", "would pay for",
            "shut down", "acquired", "raised", "mrr", "revenue",
            "customers", "growing", "scaling",
            # Opportunity
            "underserved", "no good", "gap in", "missing",
            "problem", "broken", "expensive",
        ]
        total_matched = 0

        for subreddit in SUBREDDITS:
            try:
                url = f"https://www.reddit.com/r/{subreddit}/hot.json?limit=25"
                headers = {"User-Agent": "MarketIntel/3.0 (SaaS research; +https://github.com)"}
                resp = requests.get(url, headers=headers, timeout=10)

                if resp.status_code == 429:
                    print(f"      r/{subreddit}: rate-limited, skipping")
                    time.sleep(3)
                    continue
                if resp.status_code != 200:
                    continue

                try:
                    data = resp.json()
                except (json.JSONDecodeError, ValueError):
                    continue

                posts = data.get("data", {}).get("children", [])

                for post in posts:
                    pd = post.get("data", {})
                    title = pd.get("title", "")
                    selftext = pd.get("selftext", "")[:500]
                    score = pd.get("score", 0)
                    comments = pd.get("num_comments", 0)
                    permalink = pd.get("permalink", "")

                    combined = (title + " " + selftext).lower()

                    if any(kw in combined for kw in signal_keywords):
                        engagement = min(3, (comments + score) / 50)
                        self._add(
                            title=title[:120],
                            source=f"r/{subreddit}",
                            score=round(5.0 + engagement, 1),
                            url=f"https://reddit.com{permalink}" if permalink else "",
                            category="reddit_signal",
                        )
                        total_matched += 1

                time.sleep(1.5)

            except Exception as e:
                print(f"      r/{subreddit}: {str(e)[:60]}")

        print(f"    Matched {total_matched} posts across {len(SUBREDDITS)} subreddits")

    # ------------------------------------------------------------------
    # SOURCE 4: HackerNews — top stories with market signals
    # ------------------------------------------------------------------
    def fetch_hackernews(self):
        """Top HN stories with SaaS/tool/market signals"""
        signal_keywords = [
            "alternative to", "built", "launched", "open source",
            "saas", "tool", "api", "platform", "automate",
            "side project", "revenue", "customers", "show hn",
            "ask hn", "switching", "replaced", "free",
            "ai", "llm", "agent", "workflow",
        ]
        matched = 0

        try:
            resp = requests.get(
                "https://hacker-news.firebaseio.com/v0/topstories.json",
                timeout=10
            )
            if resp.status_code != 200:
                print(f"    HN API returned {resp.status_code}")
                return

            story_ids = resp.json()[:40]

            for sid in story_ids:
                try:
                    item = requests.get(
                        f"https://hacker-news.firebaseio.com/v0/item/{sid}.json",
                        timeout=5
                    ).json()

                    if not item or item.get("type") != "story":
                        continue

                    title = item.get("title", "")
                    hn_score = item.get("score", 0)
                    comments = item.get("descendants", 0)
                    lower = title.lower()

                    if any(kw in lower for kw in signal_keywords):
                        engagement = min(4, (hn_score + comments) / 150)
                        hn_url = item.get("url", f"https://news.ycombinator.com/item?id={sid}")
                        self._add(
                            title=title[:120],
                            source="HackerNews",
                            score=round(5.5 + engagement, 1),
                            url=hn_url,
                            category="hn_signal",
                        )
                        matched += 1

                except Exception:
                    continue
                time.sleep(0.05)

            print(f"    Matched {matched} stories from top 40")

        except Exception as e:
            print(f"    HN error: {str(e)[:80]}")

    # ------------------------------------------------------------------
    # SOURCE 5: Product Hunt — what's launching and getting upvotes
    # ------------------------------------------------------------------
    def fetch_producthunt(self):
        """Scrape Product Hunt homepage for trending launches"""
        matched = 0
        try:
            url = "https://www.producthunt.com/"
            headers = {
                "User-Agent": "MarketIntel/3.0 (SaaS research)",
                "Accept": "text/html",
            }
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code != 200:
                print(f"    PH returned {resp.status_code}")
                return

            soup = BeautifulSoup(resp.text, "html.parser")

            # PH uses data attributes and JS rendering, so we parse what we can
            # Look for product name patterns in the HTML
            # Try title tags, meta tags, and any text with "upvote" patterns
            for tag in soup.find_all(['h3', 'a', 'div']):
                text = tag.get_text(strip=True)
                if 10 < len(text) < 100:
                    lower = text.lower()
                    saas_signals = ["ai", "tool", "app", "platform", "automate",
                                    "saas", "api", "builder", "generator",
                                    "tracker", "monitor", "workflow"]
                    if any(s in lower for s in saas_signals):
                        self._add(
                            title=f"PH Launch: {text}",
                            source="Product Hunt",
                            score=6.5,
                            url="https://www.producthunt.com",
                            category="ph_launch",
                        )
                        matched += 1
                        if matched >= 10:
                            break

            print(f"    Found {matched} launches with SaaS signals")

        except Exception as e:
            print(f"    Product Hunt error: {str(e)[:60]}")

    # ------------------------------------------------------------------
    # Ranking & output
    # ------------------------------------------------------------------
    def rank_results(self) -> List[Dict]:
        """Deduplicate within results and rank by score"""
        seen = {}
        for item in self.results:
            norm = self._norm(item["title"])
            if norm not in seen:
                seen[norm] = item
            else:
                # Seen from multiple sources = stronger signal
                seen[norm]["score"] += 1.0
                seen[norm]["status"] = "MULTI-SOURCE"
                existing_src = seen[norm]["source"]
                new_src = item["source"]
                if new_src not in existing_src:
                    seen[norm]["source"] = f"{existing_src} + {new_src}"

        ranked = sorted(seen.values(), key=lambda x: x["score"], reverse=True)[:TOP_N]
        return ranked

    def write_vault(self, ranked: List[Dict]) -> int:
        if not ranked:
            return 0

        self.idea_file.parent.mkdir(parents=True, exist_ok=True)

        now = datetime.now()
        date_hdr = now.strftime("%Y-%m-%d %H:%M")
        date_short = now.strftime("%Y-%m-%d")

        lines = [f"\n## [{date_hdr}] Market Intel Run\n"]

        for opp in ranked:
            status = opp["status"]
            title = opp["title"]
            score = f'{opp["score"]:.1f}'
            source = opp["source"]
            trend = opp.get("trend_data", "")
            url = opp.get("url", "")
            cat = opp.get("category", "")

            line = f"- **[{date_short}]** [{status}] {title} — **{score}** pts | {source}"
            if trend:
                line += f" | {trend}"
            if url:
                line += f" | [link]({url})"
            lines.append(line)

            print(f"    ✓ [{status}] {title[:60]}... ({score} pts)")

        content = "\n".join(lines)

        if self.idea_file.exists():
            current = self.idea_file.read_text(encoding="utf-8", errors="replace")
            self.idea_file.write_text(current + content, encoding="utf-8")
        else:
            header = "# Market Intelligence Log\n\nGenerated by Hermes Market Intel v3\n"
            self.idea_file.write_text(header + content, encoding="utf-8")

        return len(ranked)

    def format_telegram(self, ranked: List[Dict]) -> str:
        now = datetime.now().strftime("%Y-%m-%d %H:%M")
        lines = [f"🔍 Market Intel v3 ({now})", f"{len(ranked)} opportunities found", ""]

        for i, opp in enumerate(ranked, 1):
            status = opp["status"]
            title = opp["title"]
            score = opp["score"]
            source = opp["source"]
            trend = opp.get("trend_data", "")
            url = opp.get("url", "")

            lines.append(f"{i}. [{status}] {title}")
            line2 = f"   {score} pts | {source}"
            if trend:
                line2 += f" | {trend}"
            lines.append(line2)
            if url:
                lines.append(f"   {url}")
            lines.append("")

        return "\n".join(lines)

    # ------------------------------------------------------------------
    # Main
    # ------------------------------------------------------------------
    def run(self):
        print(f"🔍 MARKET INTEL v3")
        print(f"   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"   Prior ideas in dedup: {len(self.prior_ideas)}")
        print()

        # --- Fetch all sources ---
        print("📈 [1/5] Google Trends...")
        self.fetch_google_trends()
        print()

        print("🔤 [2/5] Google Autocomplete...")
        self.fetch_google_autocomplete()
        print()

        print("💬 [3/5] Reddit...")
        self.fetch_reddit()
        print()

        print("🧡 [4/5] HackerNews...")
        self.fetch_hackernews()
        print()

        print("🚀 [5/5] Product Hunt...")
        self.fetch_producthunt()
        print()

        # --- Rank ---
        print(f"📊 Raw results: {len(self.results)}")
        ranked = self.rank_results()
        print(f"   Ranked top {len(ranked)} opportunities")
        print()

        # --- Write ---
        print("💾 Writing to vault...")
        count = self.write_vault(ranked)
        print(f"   Wrote {count} ideas to market_intel.md")
        print()

        # --- Log ---
        self.mem.log_run(
            "research/market-intel",
            "market_intel.py",
            f"Raw: {len(self.results)} → Top {count} opportunities",
            "success"
        )

        # --- Telegram ---
        if ranked:
            msg = self.format_telegram(ranked)
        else:
            msg = (
                f"✅ Market Intel v3 ran.\n"
                f"Raw results: {len(self.results)}, 0 new unique after dedup.\n"
                f"Prior ideas: {len(self.prior_ideas)}"
            )
        send_telegram(msg)
        print("📱 Sent to Telegram")

        print(f"\n✅ MARKET INTEL COMPLETE")
        return 0


if __name__ == "__main__":
    try:
        intel = MarketIntel()
        sys.exit(intel.run())
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
