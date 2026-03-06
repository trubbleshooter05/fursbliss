"""
Facebook Groups Auto-Discovery Scraper
=======================================
Automatically finds and scrapes ALL groups you're a member of.
No need to manually list group URLs!

SETUP:
  pip install playwright --break-system-packages
  playwright install chromium

USAGE:
  python fb_auto_scraper.py --login   (first time only)
  python fb_auto_scraper.py           (automated)
"""

import csv
import random
import time
import argparse
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

# ── CONFIG ────────────────────────────────────────────────────────────────────

# Keywords to filter posts (case-insensitive)
RELEVANCE_KEYWORDS = [
    "health", "sick", "vet", "emergency", "worried", "symptoms", "not eating",
    "limping", "lump", "tumor", "breathing", "coughing", "vomiting", "diarrhea",
    "mobility", "arthritis", "pain", "medication", "supplement", "dying", 
    "quality of life", "advice needed", "help", "anyone else", "does anyone", 
    "should i", "what should", "seizure", "collapse", "blood", "urgent",
]

PROFILE_DIR = "./fb_profile"
OUTPUT_FILE = "fursbliss_fb_all_groups.csv"
SCROLL_PASSES = 3  # Reduced for speed (can increase if needed)
DELAY_MIN = 2.0
DELAY_MAX = 4.0
MAX_GROUPS = 30  # Limit to first 30 groups (can increase, but takes longer)

# ── HELPERS ───────────────────────────────────────────────────────────────────

def sleep():
    time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

def scroll_page(page, passes=SCROLL_PASSES):
    """Scroll down to load more posts"""
    for i in range(passes):
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)

def is_relevant(text):
    """Check if post text contains any relevance keywords"""
    if not text:
        return False
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
                    const textElements = article.querySelectorAll('[dir="auto"]');
                    let text = '';
                    for (const el of textElements) {
                        text += el.innerText + ' ';
                    }
                    
                    if (postUrl && text.trim()) {
                        posts.push({
                            url: postUrl,
                            text: text.trim().substring(0, 300)
                        });
                    }
                });
                
                return posts;
            }
        """)
        return posts
    except Exception as e:
        print(f"      Error extracting posts: {e}")
        return []

def get_group_urls(page):
    """Extract all group URLs from the Groups page"""
    try:
        print("  Finding all groups you're a member of...")
        
        # Go to Groups page
        page.goto("https://www.facebook.com/groups/joins/", timeout=30000, wait_until="domcontentloaded")
        sleep()
        
        # Scroll to load more groups
        for i in range(3):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)
        
        # Extract group links
        groups = page.evaluate("""
            () => {
                const groups = [];
                const links = document.querySelectorAll('a[href*="/groups/"]');
                const seen = new Set();
                
                links.forEach(link => {
                    const href = link.href.split('?')[0];
                    if (href.includes('/groups/') && !seen.has(href)) {
                        // Get group name from link text or nearby element
                        const name = link.innerText || link.getAttribute('aria-label') || 'Unknown Group';
                        if (name && name !== 'Unknown Group') {
                            seen.add(href);
                            groups.push({
                                name: name.substring(0, 50),
                                url: href
                            });
                        }
                    }
                });
                
                return groups;
            }
        """)
        
        # Filter to only actual group pages (not settings, search, etc)
        filtered_groups = []
        for group in groups:
            # Only include if URL matches group pattern
            if '/groups/' in group['url'] and not any(x in group['url'] for x in ['/search', '/settings', '/about', '/members', '/photos']):
                filtered_groups.append(group)
        
        print(f"  ✓ Found {len(filtered_groups)} groups")
        return filtered_groups[:MAX_GROUPS]  # Limit to MAX_GROUPS
        
    except Exception as e:
        print(f"  Error getting group list: {e}")
        return []

# ── CORE SCRAPER ──────────────────────────────────────────────────────────────

def scrape_group(page, group, writer, counter):
    name = group["name"]
    url = group["url"]
    
    print(f"\n  {counter[1]+1}. Scraping: {name[:40]}")
    
    try:
        # Go to group feed
        page.goto(url, timeout=30000, wait_until="domcontentloaded")
        sleep()
        
        # Check if we can access the group
        if "Join Group" in page.content() or "Request to Join" in page.content():
            print(f"      ⚠️  Not a member of this group - skipping")
            return
        
        # Scroll to load posts
        scroll_page(page, passes=SCROLL_PASSES)
        
        # Extract posts
        posts = extract_posts(page)
        
        if not posts:
            print(f"      No posts found (group may be private or empty)")
            return
        
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
        
        print(f"      ✓ {relevant_count} relevant posts saved (total: {counter[0]})")
        counter[1] += 1
        
    except PWTimeout:
        print(f"      ✗ Timeout - skipping")
    except Exception as e:
        print(f"      ✗ Error: {str(e)[:50]} - skipping")
    
    sleep()

# ── MAIN ──────────────────────────────────────────────────────────────────────

def run_scraper():
    print("\n" + "="*70)
    print("FursBliss Facebook Auto-Discovery Scraper")
    print("="*70)
    print("\nThis will automatically find and scrape all groups you're a member of.")
    print(f"Limited to first {MAX_GROUPS} groups for speed.\n")
    
    counter = [0, 0]  # [total_posts, groups_scraped]
    
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        fieldnames = ["group_name", "post_url", "snippet", "scraped_at"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(
                user_data_dir=PROFILE_DIR,
                headless=False,  # Visible so you can see progress
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
            
            print("✓ Session valid\n")
            
            # Get all groups
            groups = get_group_urls(page)
            
            if not groups:
                print("No groups found. Make sure you're a member of some Facebook groups.")
                context.close()
                return
            
            print(f"\nStarting scrape of {len(groups)} groups...\n")
            
            # Scrape each group
            for group in groups:
                scrape_group(page, group, writer, counter)
            
            context.close()
    
    print("\n" + "="*70)
    print(f"✓ Done!")
    print(f"  - Groups scraped: {counter[1]}")
    print(f"  - Relevant posts found: {counter[0]}")
    print(f"  - Saved to: {OUTPUT_FILE}")
    print("="*70)
    print(f"\nNext steps:")
    print(f"  1. Review {OUTPUT_FILE}")
    print(f"  2. Reply to 3-5 posts per day")
    print(f"  3. Share your Luna story naturally\n")

def run_login():
    """Open browser for manual login"""
    print(f"Opening browser for manual login...")
    print(f"1. Log into Facebook")
    print(f"2. Close the browser when done")
    print(f"Session will be saved to: {PROFILE_DIR}\n")
    
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            headless=False
        )
        page = context.new_page()
        page.goto("https://www.facebook.com/login")
        input("Press Enter after logging in...")
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
