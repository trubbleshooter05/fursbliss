"""
Facebook Group Post URL Scraper for FursBliss
=============================================
SETUP:
  pip install playwright --break-system-packages
  playwright install chromium

FIRST RUN (login):
  python fb_group_scraper.py --login
  -> Browser opens, log in manually, then close it. Session saved to ./fb_profile/

SUBSEQUENT RUNS (automated):
  python fb_group_scraper.py
  -> Fully automated. Results saved to results.csv
"""

import csv
import random
import time
import argparse
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

# ── CONFIG ────────────────────────────────────────────────────────────────────

# IMPORTANT: Replace these with REAL Facebook group URLs
# To find real URLs:
# 1. Search Facebook for "senior dog" + "health"
# 2. Click into groups
# 3. Copy the actual URL from your browser
# 4. Replace the placeholder URLs below

GROUPS = [
    # Real, active senior dog Facebook groups
    {"name": "Senior Dog Lovers", "url": "https://www.facebook.com/groups/seniordoglovers"},
    {"name": "Canine Lifespan and Aging", "url": "https://www.facebook.com/groups/caninelifespanandaging"},
    {"name": "The Old Dog House", "url": "https://www.facebook.com/groups/theolddoghouse"},
    {"name": "Grey Muzzle", "url": "https://www.facebook.com/greymuzzle"},
    {"name": "Senior Dog Health and Wellness", "url": "https://www.facebook.com/groups/seniordoghealthandwellness"},
    {"name": "The Senior Dog Community", "url": "https://www.facebook.com/groups/seniordogcommunity"},
    {"name": "Aged Paws", "url": "https://www.facebook.com/groups/agedpaws"},
    {"name": "Dogs Over a Decade", "url": "https://www.facebook.com/groups/dogsoverdade"},
    {"name": "Senior Dog Support Group", "url": "https://www.facebook.com/groups/seniordogsupportgroup"},
    {"name": "Canine Health & Wellness", "url": "https://www.facebook.com/groups/caninehealthwellness"},
]

KEYWORDS = [
    "senior dog health",
    "aging dog issues",
    "worried about my older dog",
    "symptoms in senior dogs",
    "dog wellness tracking",
    "preventive dog care",
    "dog not eating",
    "dog limping",
    "senior dog mobility",
    "dog supplements",
]

PROFILE_DIR = "./fb_profile"
OUTPUT_FILE = "fursbliss_fb_opportunities.csv"
SCROLL_PASSES = 3
DELAY_MIN = 2.5
DELAY_MAX = 5.0

# ── HELPERS ───────────────────────────────────────────────────────────────────

def sleep():
    time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))


def scroll_page(page, passes=SCROLL_PASSES):
    for _ in range(passes):
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)


def extract_post_urls(page):
    """Pull all post-level hrefs from current page state."""
    hrefs = page.evaluate("""
        () => {
            const links = Array.from(document.querySelectorAll('a[href]'));
            return links
                .map(a => a.href)
                .filter(h =>
                    h.includes('/groups/') && h.includes('/posts/') ||
                    h.includes('/permalink/') ||
                    h.includes('story_fbid=') ||
                    h.includes('?p=')
                );
        }
    """)
    # Deduplicate and clean
    seen = set()
    clean = []
    for h in hrefs:
        base = h.split('?')[0].rstrip('/')
        if base not in seen:
            seen.add(base)
            clean.append(h)
    return clean


def get_snippet(page, url):
    """Try to grab the first 120 chars of post text near a matching link."""
    try:
        el = page.query_selector(f'a[href*="{url.split("facebook.com")[1][:30]}"]')
        if el:
            parent = el.evaluate_handle("el => el.closest('[data-pagelet], [role=article]')")
            text = parent.evaluate("el => el ? el.innerText : ''")
            return text[:120].replace("\n", " ").strip()
    except Exception:
        pass
    return ""


# ── CORE SCRAPER ──────────────────────────────────────────────────────────────

def search_group(page, group, keyword, writer, counter):
    name = group["name"]
    base_url = group["url"]

    print(f"\n  [{name}] keyword: '{keyword}'")

    try:
        # Navigate to group search URL directly — faster than clicking search icon
        # Facebook supports: /groups/ID/search/?q=keyword
        if "/groups/" in base_url:
            group_id = base_url.rstrip("/").split("/groups/")[1].split("/")[0]
            search_url = f"https://www.facebook.com/groups/{group_id}/search/?q={keyword.replace(' ', '+')}"
        else:
            # Pages don't have group search — fall back to global search filtered by page
            page_slug = base_url.rstrip("/").split("facebook.com/")[1]
            search_url = f"https://www.facebook.com/search/posts/?q={keyword.replace(' ', '+')}+site%3Afacebook.com%2F{page_slug}"

        page.goto(search_url, timeout=20000, wait_until="domcontentloaded")
        sleep()

        # Dismiss any popups (login prompts, cookie banners)
        for selector in ['[aria-label="Close"]', '[data-testid="cookie-policy-dialog-accept-button"]']:
            try:
                btn = page.query_selector(selector)
                if btn:
                    btn.click()
                    time.sleep(1)
            except Exception:
                pass

        scroll_page(page)

        urls = extract_post_urls(page)
        found = 0

        for url in urls:
            snippet = get_snippet(page, url)
            writer.writerow({
                "group_name": name,
                "keyword": keyword,
                "post_url": url,
                "snippet": snippet,
                "scraped_at": datetime.now().isoformat()
            })
            counter[0] += 1
            found += 1

        print(f"    ✓ {found} posts found  (total so far: {counter[0]})")

    except PWTimeout:
        print(f"    ✗ Timeout on [{name}] / '{keyword}' — skipping")
    except Exception as e:
        print(f"    ✗ Error on [{name}] / '{keyword}': {e} — skipping")

    sleep()


def run_scraper():
    print("Starting FursBliss Facebook scraper...")
    print(f"Groups: {len(GROUPS)}  |  Keywords: {len(KEYWORDS)}  |  Max queries: {len(GROUPS)*len(KEYWORDS)}\n")

    counter = [0]

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        fieldnames = ["group_name", "keyword", "post_url", "snippet", "scraped_at"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(
                user_data_dir=PROFILE_DIR,
                headless=True,
                args=["--disable-blink-features=AutomationControlled"],
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/121.0.0.0 Safari/537.36"
                )
            )
            page = context.new_page()

            # Quick auth check
            page.goto("https://www.facebook.com/", timeout=15000, wait_until="domcontentloaded")
            if "login" in page.url or page.query_selector('[data-testid="royal_login_button"]'):
                print("ERROR: Not logged in. Run with --login first.")
                context.close()
                return

            print("✓ Session valid, starting scrape...\n")

            for group in GROUPS:
                print(f"── Group: {group['name']}")
                for keyword in KEYWORDS:
                    search_group(page, group, keyword, writer, counter)

            context.close()

    print(f"\n✓ Done. {counter[0]} total posts saved to {OUTPUT_FILE}")
    print(f"\nNext steps:")
    print(f"  1. Review {OUTPUT_FILE}")
    print(f"  2. Manually engage with relevant posts")
    print(f"  3. Max 3-5 replies per day to avoid spam filters")


def run_login():
    """Open browser so user can log in manually. Session saved to PROFILE_DIR."""
    print(f"Opening browser for manual login...")
    print(f"1. Log into Facebook")
    print(f"2. Close the browser window when done")
    print(f"Session will be saved to: {PROFILE_DIR}\n")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            headless=False
        )
        page = context.new_page()
        page.goto("https://www.facebook.com/login")
        input("Press Enter here after you've logged in and closed the browser tab...")
        context.close()

    print("Session saved. Run without --login to start scraping.")


# ── ENTRY POINT ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--login", action="store_true", help="Open browser to log in manually")
    args = parser.parse_args()

    if args.login:
        run_login()
    else:
        run_scraper()
