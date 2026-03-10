"""
FursBliss Facebook Group Scraper — FIXED
=========================================
FIXES FROM ORIGINAL:
1. Uses manual group list (auto-discovery was finding 3 groups)
2. Clicks "See more" to expand truncated posts
3. Fixed post URL extraction (was grabbing user profiles, not posts)
4. Better relevance filtering
5. Outputs actual post URLs you can click and reply to

USAGE:
  python3 fb_scraper_v2.py --login     (first time — saves session)
  python3 fb_scraper_v2.py             (scrape with browser visible)
  python3 fb_scraper_v2.py --headless  (scrape in background)
"""

import csv
import os
import random
import time
import argparse
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

# ── CONFIG ────────────────────────────────────────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(SCRIPT_DIR, "fb_profile")
OUTPUT_FILE = os.path.join(SCRIPT_DIR, "fursbliss_fb_opportunities.csv")

SCROLL_PASSES = 8          # scrolls per group (more = more posts, slower)
DELAY_MIN = 2.0
DELAY_MAX = 4.5
MAX_POSTS_PER_GROUP = 10   # cap per group to avoid one group dominating

# ── MANUAL GROUP LIST ─────────────────────────────────────────────────────────
# Facebook auto-discovery is unreliable. Maintain this list manually.
# Add/remove groups as needed. Use the group URL slug or numeric ID.

GROUPS = [
    # Senior Dog Health & Support
    {"name": "Support Group for Owners of Sick/Senior Dogs", "id": "682454455106203"},
    {"name": "Senior Dog Care Club", "id": "seniordogcareclub"},
    {"name": "Old Dogs New Tricks - Senior Dog Support", "id": "olddogsnewtricksseniordogsupport"},
    {"name": "Canine Cognitive Dysfunction (Doggy Dementia)", "id": "caninecognitivedysfunctiondoggydementia"},

    # Breed Groups (high engagement, health-focused owners)
    {"name": "Golden Retriever Owners", "id": "127127583433663"},
    {"name": "Labrador Retriever Owners", "id": "labownergroup"},
    {"name": "Doodle Owners (Goldendoodle, Labradoodle, Aussiedoodle)", "id": "doodleowners"},
    {"name": "Aussiedoodle Owners", "id": "aussiedoodleowners"},
    {"name": "German Shepherd Owners", "id": "germanshepherdowners"},
    {"name": "Boxer Dog Owners", "id": "boxerdogowners"},

    # Vet & Health Specific
    {"name": "Dog Health & Nutrition Advice", "id": "doghealthandnutritionadvice"},
    {"name": "LIBRELA THE TRUTH", "id": "1952044462362260"},
    {"name": "Dog Cancer Support Group", "id": "dogcancersupport"},
    {"name": "Canine Arthritis & Mobility Support", "id": "caninearthritis"},

    # General Dog (large, active)
    {"name": "Dog Owners Community", "id": "dogownerscommunity"},
]

# ── KEYWORDS ──────────────────────────────────────────────────────────────────

RELEVANCE_KEYWORDS = [
    "health", "sick", "vet", "emergency", "worried", "symptoms", "not eating",
    "limping", "lump", "tumor", "breathing", "coughing", "vomiting", "diarrhea",
    "mobility", "arthritis", "pain", "medication", "supplement", "advice",
    "help", "anyone else", "does anyone", "should i", "what should", "senior",
    "older dog", "aging", "decline", "slowing down", "stiff", "tired",
    "appetite", "lethargy", "lethargic", "blood", "seizure", "shaking",
    "kidney", "liver", "heart", "cancer", "cognitive", "dementia", "confused",
    "panting", "drinking more", "losing weight", "gained weight", "won't walk",
    "can't get up", "incontinence", "accidents in house", "blind", "deaf",
    "rapamycin", "loy-002", "longevity", "lifespan", "how long do",
]

GRIEF_EXCLUSIONS = [
    "rip ", "passed away", "rainbow bridge", "put down", "goodbye",
    "miss you", "grieving", "loss of my", "in memory", "memorial",
    "crossed the bridge", "rest in peace", "fly high", "forever in my heart",
    "had to let go", "said goodbye", "over the rainbow",
]

SPAM_EXCLUSIONS = [
    "buy now", "click here", "discount", "promo code", "sale",
    "giveaway", "follow me", "check my page", "dm me", "link in bio",
    "order now", "free shipping", "use code",
]

# ── HELPERS ───────────────────────────────────────────────────────────────────

def sleep(lo=None, hi=None):
    time.sleep(random.uniform(lo or DELAY_MIN, hi or DELAY_MAX))

def is_relevant(text):
    if not text or len(text) < 30:
        return False
    tl = text.lower()
    return any(k in tl for k in RELEVANCE_KEYWORDS)

def is_excluded(text):
    if not text:
        return True
    tl = text.lower()
    return any(k in tl for k in GRIEF_EXCLUSIONS) or any(k in tl for k in SPAM_EXCLUSIONS)

def dismiss_popups(page):
    selectors = [
        '[aria-label="Close"]',
        '[data-testid="cookie-policy-dialog-accept-button"]',
        'div[role="dialog"] [aria-label="Close"]',
        'div[role="dialog"] [aria-label="Decline optional cookies"]',
    ]
    for sel in selectors:
        try:
            btn = page.query_selector(sel)
            if btn and btn.is_visible():
                btn.click()
                time.sleep(0.5)
        except Exception:
            pass

def scroll_and_load(page, passes):
    """Scroll down to load more posts, with random pauses."""
    for i in range(passes):
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(random.uniform(1.5, 3.0))
        # Occasionally scroll up slightly to seem human
        if i % 3 == 2:
            page.evaluate("window.scrollBy(0, -300)")
            time.sleep(0.5)

def expand_see_more(page):
    """Click all 'See more' links to expand truncated post text."""
    try:
        see_more_buttons = page.query_selector_all(
            'div[role="article"] div[role="button"]:has-text("See more"), '
            'div[role="article"] span[role="button"]:has-text("See more"), '
            'div[role="article"] a:has-text("See more")'
        )
        clicked = 0
        for btn in see_more_buttons[:20]:  # cap to avoid infinite loops
            try:
                if btn.is_visible():
                    btn.click()
                    clicked += 1
                    time.sleep(random.uniform(0.3, 0.7))
            except Exception:
                continue
        return clicked
    except Exception:
        return 0

# ── POST EXTRACTION ───────────────────────────────────────────────────────────

def extract_posts(page, group_name):
    """Extract posts with proper URLs and expanded text."""
    try:
        posts = page.evaluate("""
            () => {
                const results = [];
                const seen = new Set();
                const articles = document.querySelectorAll('[role="article"]');

                articles.forEach(article => {
                    // ── FIND POST URL ──
                    // Priority 1: permalink links (most reliable)
                    let postUrl = '';
                    const links = article.querySelectorAll('a[href]');

                    for (const link of links) {
                        const href = link.href || '';

                        // Match: /groups/xxx/posts/yyy or /groups/xxx/permalink/yyy
                        if (href.match(/\\/groups\\/[^\\/]+\\/(posts|permalink)\\/\\d+/)) {
                            postUrl = href.split('?')[0];
                            break;
                        }

                        // Match: story_fbid pattern
                        if (href.includes('story_fbid=')) {
                            postUrl = href.split('&')[0];
                            if (!postUrl.includes('?')) postUrl = href;
                            break;
                        }

                        // Match: /groups/xxx/yyy where yyy is a long numeric ID (likely a post)
                        const groupPostMatch = href.match(/\\/groups\\/[^\\/]+\\/(\\d{10,})/);
                        if (groupPostMatch) {
                            postUrl = href.split('?')[0];
                            break;
                        }
                    }

                    // SKIP if we couldn't find a real post URL
                    // DO NOT fall back to user profile links
                    if (!postUrl) return;

                    // Skip user profile links that slipped through
                    if (postUrl.includes('/user/') || postUrl.includes('/profile.php')) return;

                    if (seen.has(postUrl)) return;
                    seen.add(postUrl);

                    // ── EXTRACT TEXT ──
                    let text = '';

                    // Method 1: data-ad-preview (most reliable for post body)
                    const adPreview = article.querySelector('[data-ad-preview="message"]');
                    if (adPreview) {
                        text = (adPreview.innerText || '').trim();
                    }

                    // Method 2: find the largest text block in dir="auto" elements
                    if (!text || text.length < 30) {
                        const autoEls = article.querySelectorAll('[dir="auto"]');
                        let bestText = '';
                        for (const el of autoEls) {
                            const t = (el.innerText || '').trim();
                            // Skip short strings (names, timestamps, button labels)
                            if (t.length > bestText.length && t.length > 30) {
                                // Skip if it's just a link or contains common UI text
                                if (!t.startsWith('http') &&
                                    !t.includes('Write a comment') &&
                                    !t.includes('Like') &&
                                    !t.match(/^\\d+ (comments?|likes?|shares?)$/i)) {
                                    bestText = t;
                                }
                            }
                        }
                        if (bestText) text = bestText;
                    }

                    // Method 3: data-testid post_message
                    if (!text || text.length < 30) {
                        const msg = article.querySelector('[data-testid="post_message"]');
                        if (msg) text = (msg.innerText || '').trim();
                    }

                    if (!text || text.length < 30) return;

                    // Clean up: remove "See more" artifacts and collapse whitespace
                    text = text.replace(/See more$/i, '').replace(/\\s+/g, ' ').trim();

                    results.push({
                        url: postUrl,
                        text: text.substring(0, 800)
                    });
                });

                return results;
            }
        """)
        return posts or []
    except Exception as e:
        print(f"     ⚠ Extract error: {str(e)[:80]}")
        return []

# ── GROUP SCRAPER ─────────────────────────────────────────────────────────────

def scrape_group(page, group, writer, counter):
    name = group["name"]
    gid = group["id"]
    url = f"https://www.facebook.com/groups/{gid}"

    print(f"\n  📂 {name}")
    print(f"     {url}")

    try:
        page.goto(url, timeout=35000, wait_until="domcontentloaded")
        sleep(2, 4)
        dismiss_popups(page)

        # Check access
        content = page.content() or ""
        if "You need to join" in content or "This content isn't available" in content:
            print(f"     ⚠ No access — skipping (join this group first)")
            return

        if "This group is private" in content and "Join group" in content:
            print(f"     ⚠ Not a member — skipping")
            return

        # Scroll to load posts
        scroll_and_load(page, SCROLL_PASSES)

        # Expand truncated posts
        expanded = expand_see_more(page)
        if expanded > 0:
            print(f"     📖 Expanded {expanded} 'See more' posts")
            time.sleep(1)

        # Extract
        posts = extract_posts(page, name)

        relevant_count = 0
        for post in posts:
            if relevant_count >= MAX_POSTS_PER_GROUP:
                break

            if is_excluded(post["text"]):
                continue

            if is_relevant(post["text"]):
                writer.writerow({
                    "group_name": name,
                    "post_url": post["url"],
                    "snippet": post["text"][:500].replace("\n", " "),
                    "scraped_at": datetime.now().isoformat(),
                })
                relevant_count += 1
                counter[0] += 1

        print(f"     ✓ {len(posts)} posts found, {relevant_count} relevant (total: {counter[0]})")

    except PWTimeout:
        print(f"     ✗ Timeout — skipping")
    except Exception as e:
        print(f"     ✗ Error: {str(e)[:100]}")

    # Random delay between groups to avoid rate limiting
    sleep(3, 7)

# ── MAIN ──────────────────────────────────────────────────────────────────────

def run_scraper(headless=False):
    print("=" * 60)
    print("FURSBLISS FACEBOOK SCRAPER v2")
    print("=" * 60)
    print(f"Groups to scrape: {len(GROUPS)}")
    print(f"Output: {OUTPUT_FILE}\n")

    counter = [0]

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["group_name", "post_url", "snippet", "scraped_at"])
        writer.writeheader()

        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(
                user_data_dir=PROFILE_DIR,
                headless=headless,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                ],
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1280, "height": 900},
            )
            page = context.new_page()

            # Verify login
            try:
                page.goto("https://www.facebook.com/", timeout=20000, wait_until="domcontentloaded")
                sleep(2, 3)
            except Exception as e:
                print(f"ERROR: Could not reach Facebook: {e}")
                context.close()
                return

            if "login" in page.url or page.query_selector('[data-testid="royal_login_button"]'):
                print("❌ Not logged in. Run: python3 fb_scraper_v2.py --login")
                context.close()
                return

            print("✓ Logged in\n")
            print("─" * 60)

            for i, group in enumerate(GROUPS, 1):
                print(f"\n[{i}/{len(GROUPS)}]", end="")
                scrape_group(page, group, writer, counter)

            context.close()

    print("\n" + "=" * 60)
    print(f"✅ DONE: {counter[0]} relevant posts → {OUTPUT_FILE}")
    print("=" * 60)

    if counter[0] == 0:
        print("\nTroubleshooting:")
        print("  1. Make sure you've joined the groups in the GROUPS list")
        print("  2. Run with browser visible (no --headless) to see what's happening")
        print("  3. Facebook may be blocking — try again in a few hours")
        print("  4. Update group IDs if they've changed\n")
    else:
        print(f"\nNext steps:")
        print(f"  1. Open {OUTPUT_FILE}")
        print(f"  2. Click post URLs to read full context")
        print(f"  3. Write genuine, helpful replies (NO links, NO FursBliss mentions)")
        print(f"  4. Max 3-5 replies per day across all groups\n")


def run_login():
    print("Opening browser for Facebook login...")
    print("1. Log into Facebook in the browser that opens")
    print("2. Once you see your feed, come back here")
    print("3. Press Enter to save session\n")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            headless=False,
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
        )
        page = context.new_page()
        page.goto("https://www.facebook.com/login")
        input("✓ Press Enter once you're logged in and see your feed...")
        context.close()

    print("✅ Session saved. Now run: python3 fb_scraper_v2.py\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--login", action="store_true", help="Open browser to log in")
    parser.add_argument("--headless", action="store_true", help="Run without visible browser")
    args = parser.parse_args()

    if args.login:
        run_login()
    else:
        run_scraper(headless=args.headless)
