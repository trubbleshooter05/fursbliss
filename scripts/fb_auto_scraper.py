"""
Facebook Auto-Discovery Group Scraper
======================================
This script AUTOMATICALLY finds all groups you've joined and scrapes them.
No manual URL entry needed!

SETUP:
  pip install playwright --break-system-packages
  playwright install chromium

USAGE:
  python3 fb_auto_scraper.py --login     (first time only)
  python3 fb_auto_scraper.py             (fully automated)

WHAT IT DOES:
  1. Goes to facebook.com/groups/joins
  2. Scrolls to load ALL your joined groups
  3. Extracts group names and URLs automatically
  4. Scrapes recent posts from each group
  5. Filters for relevant posts (health, vet, symptoms, etc.)
  6. Saves to CSV
"""

import csv
import random
import time
import argparse
import re
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

# ── CONFIG ────────────────────────────────────────────────────────────────────

# Keywords to filter posts (case-insensitive)
RELEVANCE_KEYWORDS = [
    "health", "sick", "vet", "emergency", "worried", "symptoms", "not eating",
    "limping", "lump", "tumor", "breathing", "coughing", "vomiting", "diarrhea",
    "mobility", "arthritis", "pain", "medication", "supplement", "advice needed",
    "help", "anyone else", "does anyone", "should i", "what should", "senior",
    "older dog", "aging", "decline", "slowing down", "stiff", "tired",
]

PROFILE_DIR = "./fb_profile"
OUTPUT_FILE = "fursbliss_fb_auto.csv"
GROUPS_TO_SCRAPE = 20  # Max number of groups to scrape (to avoid taking forever)
SCROLL_PASSES_DISCOVERY = 10  # How many times to scroll when discovering groups
SCROLL_PASSES_POSTS = 3  # How many times to scroll in each group
DELAY_MIN = 2.0
DELAY_MAX = 4.0

# ── HELPERS ───────────────────────────────────────────────────────────────────

def sleep():
    time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

def scroll_page(page, passes):
    """Scroll down to load more content"""
    for i in range(passes):
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)

def is_relevant(text):
    """Check if post text contains any relevance keywords"""
    if not text:
        return False
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in RELEVANCE_KEYWORDS)

# ── GROUP DISCOVERY ───────────────────────────────────────────────────────────

def discover_groups(page):
    """Automatically discover all groups user has joined"""
    print("\n🔍 Discovering your joined groups...")
    
    try:
        # Go to groups/joins page
        page.goto("https://www.facebook.com/groups/joins", timeout=30000, wait_until="domcontentloaded")
        sleep()
        
        # Dismiss popups
        for selector in ['[aria-label="Close"]', '[data-testid="cookie-policy-dialog-accept-button"]']:
            try:
                btn = page.query_selector(selector)
                if btn:
                    btn.click()
                    time.sleep(1)
            except Exception:
                pass
        
        # Scroll to load more groups
        print(f"   Scrolling to load groups...")
        scroll_page(page, SCROLL_PASSES_DISCOVERY)
        
        # Extract group links
        groups = page.evaluate("""
            () => {
                const groups = [];
                const links = document.querySelectorAll('a[href*="/groups/"]');
                const seen = new Set();
                
                links.forEach(link => {
                    const href = link.href.split('?')[0];
                    const match = href.match(/facebook\\.com\\/groups\\/([^\\/]+)/);
                    
                    if (match && !seen.has(href)) {
                        seen.add(href);
                        
                        // Try to get group name
                        let name = '';
                        const parent = link.closest('[role="article"]') || link.closest('div[class*="x1"]');
                        if (parent) {
                            const textEls = parent.querySelectorAll('span, strong, a');
                            for (const el of textEls) {
                                const text = el.innerText.trim();
                                if (text && text.length > 3 && text.length < 100) {
                                    name = text;
                                    break;
                                }
                            }
                        }
                        
                        if (!name) {
                            name = match[1].replace(/-/g, ' ');
                        }
                        
                        groups.push({
                            name: name,
                            url: href
                        });
                    }
                });
                
                return groups;
            }
        """)
        
        # Deduplicate by URL
        seen_urls = set()
        unique_groups = []
        for g in groups:
            if g['url'] not in seen_urls:
                seen_urls.add(g['url'])
                unique_groups.append(g)
        
        print(f"   ✓ Found {len(unique_groups)} groups")
        
        return unique_groups[:GROUPS_TO_SCRAPE]  # Limit to avoid taking forever
        
    except Exception as e:
        print(f"   ✗ Error discovering groups: {e}")
        return []

# ── POST EXTRACTION ───────────────────────────────────────────────────────────

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
                    let text = '';
                    const textDivs = article.querySelectorAll('[dir="auto"], [data-ad-preview="message"]');
                    for (const div of textDivs) {
                        const t = div.innerText.trim();
                        if (t && t.length > 20) {
                            text = t;
                            break;
                        }
                    }
                    
                    if (postUrl && text) {
                        posts.push({
                            url: postUrl,
                            text: text.substring(0, 400)
                        });
                    }
                });
                
                return posts;
            }
        """)
        return posts
    except Exception as e:
        return []

# ── GROUP SCRAPER ─────────────────────────────────────────────────────────────

def scrape_group(page, group, writer, counter):
    """Scrape posts from a single group"""
    name = group["name"]
    url = group["url"]
    
    print(f"\n  📂 {name}")
    print(f"     {url}")
    
    try:
        page.goto(url, timeout=30000, wait_until="domcontentloaded")
        sleep()
        
        # Dismiss popups
        for selector in ['[aria-label="Close"]']:
            try:
                btn = page.query_selector(selector)
                if btn:
                    btn.click()
                    time.sleep(1)
            except Exception:
                pass
        
        # Scroll to load posts
        scroll_page(page, SCROLL_PASSES_POSTS)
        
        # Extract posts
        posts = extract_posts(page)
        
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
                    "snippet": post['text'][:250].replace('\n', ' '),
                    "scraped_at": datetime.now().isoformat()
                })
                relevant_count += 1
                counter[0] += 1
        
        print(f"     ✓ {len(posts)} posts, {relevant_count} relevant (total: {counter[0]})")
        
    except PWTimeout:
        print(f"     ✗ Timeout — skipping")
    except Exception as e:
        print(f"     ✗ Error: {str(e)[:100]} — skipping")
    
    sleep()

# ── MAIN ──────────────────────────────────────────────────────────────────────

def run_scraper():
    print("=" * 60)
    print("FURSBLISS FACEBOOK AUTO-SCRAPER")
    print("=" * 60)
    print("\nThis will:")
    print("  1. Auto-discover all groups you've joined")
    print("  2. Scrape recent posts from each group")
    print("  3. Filter for health/vet/symptom posts")
    print("  4. Save to CSV\n")
    
    counter = [0]
    
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        fieldnames = ["group_name", "post_url", "snippet", "scraped_at"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(
                user_data_dir=PROFILE_DIR,
                headless=False,  # Visible so you can monitor
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
            
            print("✓ Logged in\n")
            
            # Auto-discover groups
            groups = discover_groups(page)
            
            if not groups:
                print("\n❌ No groups found. Make sure you've joined some groups on Facebook.")
                context.close()
                return
            
            print(f"\n📊 Will scrape {len(groups)} groups\n")
            print("─" * 60)
            
            # Scrape each group
            for i, group in enumerate(groups, 1):
                print(f"\n[{i}/{len(groups)}]", end=" ")
                scrape_group(page, group, writer, counter)
            
            context.close()
    
    print("\n" + "=" * 60)
    print(f"✓ DONE: {counter[0]} relevant posts saved to {OUTPUT_FILE}")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Review the CSV file")
    print("  2. Reply to 3-5 posts per day")
    print("  3. Share your Luna story naturally\n")

def run_login():
    """Open browser for manual login"""
    print("Opening browser for manual login...")
    print("1. Log into Facebook")
    print("2. Close the browser when done\n")
    
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            headless=False
        )
        page = context.new_page()
        page.goto("https://www.facebook.com/login")
        input("Press Enter after logging in and closing the browser...")
        context.close()
    
    print("Session saved. Run without --login to start scraping.")

# ── ENTRY POINT ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--login", action="store_true", help="Open browser to log in")
    args = parser.parse_args()
    
    if args.login:
        run_login()
    else:
        run_scraper()
