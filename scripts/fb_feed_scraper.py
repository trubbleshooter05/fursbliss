"""
Facebook Group Feed Scraper for FursBliss (Simplified)
=======================================================
This version doesn't use search - it just grabs recent posts from each group's main feed.

SETUP:
  pip install playwright --break-system-packages
  playwright install chromium

REQUIREMENTS:
  - You must be a MEMBER of all groups before running
  - Join groups first: https://facebook.com/groups/[groupname]

USAGE:
  python fb_feed_scraper.py --login   (first time)
  python fb_feed_scraper.py           (automated)
"""

import csv
import random
import time
import argparse
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

# ── CONFIG ────────────────────────────────────────────────────────────────────

GROUPS = [
    {"name": "Senior Dog Lovers", "url": "https://www.facebook.com/groups/seniordoglovers"},
    {"name": "Canine Lifespan and Aging", "url": "https://www.facebook.com/groups/caninelifespanandaging"},
    {"name": "The Old Dog House", "url": "https://www.facebook.com/groups/theolddoghouse"},
    {"name": "Senior Dog Health and Wellness", "url": "https://www.facebook.com/groups/seniordoghealthandwellness"},
    {"name": "The Senior Dog Community", "url": "https://www.facebook.com/groups/seniordogcommunity"},
    {"name": "Aged Paws", "url": "https://www.facebook.com/groups/agedpaws"},
    {"name": "Dogs Over a Decade", "url": "https://www.facebook.com/groups/dogsoverdade"},
    {"name": "Senior Dog Support Group", "url": "https://www.facebook.com/groups/seniordogsupportgroup"},
    {"name": "Canine Health & Wellness", "url": "https://www.facebook.com/groups/caninehealthwellness"},
]

# Keywords to filter posts (case-insensitive)
RELEVANCE_KEYWORDS = [
    "health", "sick", "vet", "emergency", "worried", "symptoms", "not eating",
    "limping", "lump", "tumor", "breathing", "coughing", "vomiting", "diarrhea",
    "mobility", "arthritis", "pain", "medication", "supplement", "dying", "quality of life",
    "advice needed", "help", "anyone else", "does anyone", "should i", "what should",
]

PROFILE_DIR = "./fb_profile"
OUTPUT_FILE = "fursbliss_fb_feed.csv"
SCROLL_PASSES = 5
DELAY_MIN = 3.0
DELAY_MAX = 6.0

# ── HELPERS ───────────────────────────────────────────────────────────────────

def sleep():
    time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

def scroll_page(page, passes=SCROLL_PASSES):
    """Scroll down to load more posts"""
    for i in range(passes):
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        print(f"    Scrolling... ({i+1}/{passes})")
        time.sleep(3)

def is_relevant(text):
    """Check if post text contains any relevance keywords"""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in RELEVANCE_KEYWORDS)

def extract_posts(page):
    """Extract posts from current page state"""
    try:
        posts = page.evaluate("""
            () => {
                const posts = [];
                const articles = document.querySelectorAll('[role="article"]');
                
                articles.forEach(article => {
                    // Find post link
                    const links = article.querySelectorAll('a[href*="/posts/"], a[href*="/permalink/"]');
                    let postUrl = '';
                    for (const link of links) {
                        if (link.href.includes('/posts/') || link.href.includes('/permalink/')) {
                            postUrl = link.href.split('?')[0];
                            break;
                        }
                    }
                    
                    // Get post text
                    const textDiv = article.querySelector('[data-ad-preview="message"], [dir="auto"]');
                    const text = textDiv ? textDiv.innerText : '';
                    
                    if (postUrl && text) {
                        posts.push({
                            url: postUrl,
                            text: text.substring(0, 300)
                        });
                    }
                });
                
                return posts;
            }
        """)
        return posts
    except Exception as e:
        print(f"    Error extracting posts: {e}")
        return []

# ── CORE SCRAPER ──────────────────────────────────────────────────────────────

def scrape_group(page, group, writer, counter):
    name = group["name"]
    url = group["url"]
    
    print(f"\n── Scraping: {name}")
    
    try:
        # Go to group feed
        page.goto(url, timeout=30000, wait_until="domcontentloaded")
        sleep()
        
        # Dismiss any popups
        for selector in ['[aria-label="Close"]', '[data-testid="cookie-policy-dialog-accept-button"]']:
            try:
                btn = page.query_selector(selector)
                if btn:
                    btn.click()
                    time.sleep(1)
            except Exception:
                pass
        
        # Scroll to load more posts
        scroll_page(page)
        
        # Extract posts
        posts = extract_posts(page)
        print(f"    Extracted {len(posts)} total posts")
        
        # Filter for relevance
        relevant_count = 0
        seen_urls = set()
        
        for post in posts:
            if post['url'] in seen_urls:
                continue
            seen_urls.add(post['url'])
            
            if is_relevant(post['text']):
                writer.writerow({
                    "group_name": name,
                    "post_url": post['url'],
                    "snippet": post['text'][:200],
                    "scraped_at": datetime.now().isoformat()
                })
                relevant_count += 1
                counter[0] += 1
        
        print(f"    ✓ {relevant_count} relevant posts saved (total: {counter[0]})")
        
    except PWTimeout:
        print(f"    ✗ Timeout on {name} — skipping")
    except Exception as e:
        print(f"    ✗ Error on {name}: {e} — skipping")
    
    sleep()

# ── MAIN ──────────────────────────────────────────────────────────────────────

def run_scraper():
    print("Starting FursBliss Facebook Feed Scraper...")
    print(f"Groups: {len(GROUPS)}\n")
    print("⚠️  IMPORTANT: You must be a MEMBER of all these groups!")
    print("   If you're not a member, join them first on Facebook.\n")
    
    counter = [0]
    
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        fieldnames = ["group_name", "post_url", "snippet", "scraped_at"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(
                user_data_dir=PROFILE_DIR,
                headless=False,  # Changed to False so you can see what's happening
                args=["--disable-blink-features=AutomationControlled"],
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/121.0.0.0 Safari/537.36"
                )
            )
            page = context.new_page()
            
            # Check auth
            page.goto("https://www.facebook.com/", timeout=15000, wait_until="domcontentloaded")
            if "login" in page.url or page.query_selector('[data-testid="royal_login_button"]'):
                print("ERROR: Not logged in. Run with --login first.")
                context.close()
                return
            
            print("✓ Session valid, starting scrape...\n")
            
            for group in GROUPS:
                scrape_group(page, group, writer, counter)
            
            context.close()
    
    print(f"\n✓ Done. {counter[0]} relevant posts saved to {OUTPUT_FILE}")
    print(f"\nNext steps:")
    print(f"  1. Review {OUTPUT_FILE}")
    print(f"  2. Manually reply to 3-5 posts per day")
    print(f"  3. Share your Luna story naturally")

def run_login():
    """Open browser for manual login"""
    print(f"Opening browser for manual login...")
    print(f"1. Log into Facebook")
    print(f"2. JOIN all the groups you want to scrape")
    print(f"3. Close the browser when done")
    print(f"Session will be saved to: {PROFILE_DIR}\n")
    
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            headless=False
        )
        page = context.new_page()
        page.goto("https://www.facebook.com/login")
        input("Press Enter here after you've logged in and joined groups...")
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
