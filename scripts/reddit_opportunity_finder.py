#!/usr/bin/env python3
"""
Reddit Opportunity Scanner for FursBliss
Uses JSON scraping (no API key needed) to find relevant senior dog health posts.

STRICT FILTERING: Only surfaces posts genuinely relevant to senior dog health/longevity.
Excludes: puppies, cats, grief posts, training, crates, unrelated topics.
"""

import json
import re
import requests
from datetime import datetime
from typing import List, Dict, Optional

# Hard exclusion keywords - NEVER include posts with these
EXCLUSION_KEYWORDS = [
    # Puppies / young dogs
    "puppy", "puppies", "8 weeks", "10 weeks", "12 weeks", "3 months", "4 months", "5 months", "6 months",
    
    # Grief / loss / end of life
    "rip", "r.i.p", "passed away", "rainbow bridge", "euthanasia", "euthanized", "put down", "put to sleep",
    "goodbye", "miss you", "miss him", "miss her", "grieving", "processing a loss", "nearing the end",
    "said goodbye", "losing him", "losing her", "terminal", "final days", "final moments",
    
    # Non-dog animals
    "kitten", "kittens", "cat", "cats", "feline", "bird", "rabbit", "guinea pig",
    
    # Unrelated topics
    "crate training", "potty training", "leash training", "obedience", "book recommendation",
    "dog bed", "food bowl", "toys", "grooming", "haircut", "nail trim", "rabies vaccine",
    "eating cat food", "social preference", "obsessed with", "how to train"
]

# Relevance keywords - posts MUST have at least one to be included
RELEVANCE_KEYWORDS = [
    # Age indicators
    "senior", "older dog", "aging", "elderly", "geriatric", "7 years", "8 years", "9 years", 
    "10 years", "11 years", "12 years", "13 years", "14 years", "15 years", "16 years",
    "7 year old", "8 year old", "9 year old", "10 year old", "11 year old", "12 year old",
    
    # Health decline keywords
    "arthritis", "limping", "mobility", "slowing down", "not eating", "won't eat", "appetite loss",
    "lump", "tumor", "mass", "growth", "breathing", "coughing", "heart", "kidney", "liver",
    "confused", "disoriented", "cognitive", "dementia", "sundowners", "cancer",
    "weight loss", "lethargy", "weakness", "collapsing", "seizure", "vomiting blood",
    "difficulty breathing", "labored breathing", "copd", "heart disease", "chronic",
    "quality of life", "health decline", "supplement", "medication", "diagnosis",
    
    # Acute emergency (always relevant if about dogs)
    "emergency", "er visit", "urgent", "blood", "can't walk", "won't get up", "unresponsive"
]

# Emergency keywords - trigger "urgent" sensitivity flag
EMERGENCY_KEYWORDS = [
    "vomiting", "vomiting blood", "bleeding", "blood", "collapse", "collapsed", "can't walk",
    "difficulty breathing", "labored breathing", "seizure", "unresponsive", "won't get up",
    "emergency", "er visit", "urgent care", "urgent"
]

SUBREDDITS = [
    "dogs",
    "seniordogs",  # Always include posts from this subreddit
    "DogCare",
    "DogAdvice",
    "AskVet"
]

SEARCH_QUERIES = [
    "senior dog not eating",
    "old dog emergency",
    "senior dog health",
    "dog arthritis",
    "senior dog limping"
]

def fetch_reddit_posts(subreddit: str, query: str) -> List[Dict]:
    """Fetch posts from Reddit using JSON scraping (no API key needed)."""
    try:
        url = f"https://www.reddit.com/r/{subreddit}/search.json"
        params = {
            "q": query,
            "restrict_sr": "true",
            "sort": "new",
            "limit": 25,
            "t": "day"
        }
        headers = {"User-Agent": "FursBliss/1.0"}
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get("data", {}).get("children", [])
        return []
    except Exception as e:
        print(f"Error fetching {subreddit} for '{query}': {e}")
        return []

def extract_age_from_text(text: str) -> Optional[int]:
    """Extract dog age from text. Returns age in years or None."""
    text_lower = text.lower()
    
    # Pattern: "X year", "X years", "X-year", "X yr", "X y/o", "Xyo"
    age_patterns = [
        r'(\d+)\s*(?:year|yr|y/o|yo)',
        r'(\d+)\s*-\s*(?:year|yr)',
    ]
    
    for pattern in age_patterns:
        match = re.search(pattern, text_lower)
        if match:
            age = int(match.group(1))
            return age
    
    return None

def check_exclusion(text: str) -> bool:
    """Check if post should be excluded based on hard exclusions."""
    text_lower = text.lower()
    for keyword in EXCLUSION_KEYWORDS:
        if keyword.lower() in text_lower:
            return True
    return False

def calculate_relevance_score(post_title: str, post_body: str, subreddit: str) -> float:
    """
    Calculate relevance score (0-100).
    Higher score = more relevant to senior dog health/longevity.
    """
    text = f"{post_title} {post_body}".lower()
    score = 0.0
    
    # Subreddit bonus
    if subreddit == "seniordogs":
        score += 40  # High base score for senior dog subreddit
    elif subreddit == "AskVet":
        score += 10
    
    # Age detection
    age = extract_age_from_text(text)
    if age and age >= 7:
        score += 30
    elif age and age < 2:
        score -= 50  # Heavy penalty for puppies
    
    # Relevance keyword matching
    matched_keywords = 0
    for keyword in RELEVANCE_KEYWORDS:
        if keyword.lower() in text:
            matched_keywords += 1
    
    score += min(matched_keywords * 5, 30)  # Cap at 30 points
    
    # Emergency keyword bonus
    for keyword in EMERGENCY_KEYWORDS:
        if keyword in text:
            score += 15
            break
    
    return min(score, 100.0)

def categorize_post(post_title: str, post_body: str, relevance_score: float) -> str:
    """Categorize post: senior, emergency, or not_relevant."""
    text = f"{post_title} {post_body}".lower()
    
    # Check for emergency keywords
    has_emergency = any(keyword in text for keyword in EMERGENCY_KEYWORDS)
    
    # Extract age
    age = extract_age_from_text(text)
    
    if has_emergency and (age is None or age >= 1):
        # Emergency symptoms, not a puppy
        return "emergency"
    elif relevance_score >= 50:
        # High relevance score = senior dog health concern
        return "senior"
    else:
        return "not_relevant"

def determine_sensitivity(post_title: str, post_body: str) -> str:
    """Determine sensitivity level: grief, urgent, or normal."""
    text = f"{post_title} {post_body}".lower()
    
    # Grief indicators
    grief_keywords = ["passed away", "rainbow bridge", "rip", "euthanasia", "put down", 
                      "goodbye", "miss you", "grieving", "processing a loss", "said goodbye",
                      "losing", "terminal", "final days"]
    if any(keyword in text for keyword in grief_keywords):
        return "grief"
    
    # Emergency indicators
    if any(keyword in text for keyword in EMERGENCY_KEYWORDS):
        return "urgent"
    
    return "normal"

def process_opportunities() -> Dict:
    """Main function: fetch, filter, score, and output opportunities."""
    all_posts = {}  # De-duplicate by post ID
    
    print("🔍 Scraping Reddit (no API key)...")
    
    for subreddit in SUBREDDITS:
        for query in SEARCH_QUERIES:
            print(f"  Searching r/{subreddit} for: {query}")
            posts = fetch_reddit_posts(subreddit, query)
            
            for post_data in posts:
                post = post_data.get("data", {})
                post_id = post.get("id")
                
                if not post_id or post_id in all_posts:
                    continue  # Skip duplicates
                
                post_title = post.get("title", "")
                post_body = post.get("selftext", "")
                post_url = f"https://reddit.com{post.get('permalink', '')}"
                created_utc = post.get("created_utc", 0)
                num_comments = post.get("num_comments", 0)
                
                # Calculate age in hours
                age_hours = (datetime.utcnow().timestamp() - created_utc) / 3600
                
                # Create snippet (first 150 chars)
                snippet = (post_body[:147] + "...") if len(post_body) > 150 else post_body
                if not snippet:
                    snippet = post_title[:150]
                
                # HARD EXCLUSION CHECK
                if check_exclusion(f"{post_title} {post_body}"):
                    continue  # Skip this post entirely
                
                # Calculate relevance score
                relevance_score = calculate_relevance_score(post_title, post_body, subreddit)
                
                # Only include if relevance score >= 40 (or if from r/seniordogs)
                if relevance_score < 40 and subreddit != "seniordogs":
                    continue
                
                # Categorize
                category = categorize_post(post_title, post_body, relevance_score)
                
                # Skip if not relevant
                if category == "not_relevant":
                    continue
                
                # Determine sensitivity
                sensitivity = determine_sensitivity(post_title, post_body)
                
                # Skip grief posts entirely
                if sensitivity == "grief":
                    continue
                
                all_posts[post_id] = {
                    "subreddit": subreddit,
                    "post_url": post_url,
                    "post_title": post_title,
                    "post_snippet": snippet,
                    "age_hours": round(age_hours, 1),
                    "num_comments": num_comments,
                    "reply_category": category,
                    "relevance_score": round(relevance_score, 1),
                    "sensitivity": sensitivity
                }
    
    # Sort by newest first, then by fewest comments (prioritize fresh posts)
    opportunities = sorted(
        all_posts.values(),
        key=lambda x: (x["age_hours"], x["num_comments"])
    )
    
    # Output
    output = {
        "generated_at": datetime.utcnow().isoformat(),
        "total_found": len(opportunities),
        "opportunities": opportunities,
        "instructions": [
            "1. Review each post manually",
            "2. Write personalized replies based on sensitivity flag",
            "3. 'grief' = DO NOT REPLY (included for context only)",
            "4. 'urgent' = empathetic + actionable",
            "5. 'normal' = helpful + non-salesy",
            "6. Max 3-5 replies per day to avoid spam filters"
        ]
    }
    
    # Save to file
    today = datetime.utcnow().strftime("%Y%m%d")
    output_file = f"/Users/gp/fursbliss_growth/reddit_opportunities_{today}.json"
    
    with open(output_file, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Found {len(opportunities)} opportunities")
    print(f"📁 Saved to: {output_file}")
    
    # Print top 5 for quick review
    if opportunities:
        print(f"\n💡 Top 5 posts:")
        for i, opp in enumerate(opportunities[:5], 1):
            print(f"{i}. r/{opp['subreddit']} - {opp['post_title'][:60]}")
            print(f"   {opp['post_url']}")
            print(f"   {opp['age_hours']}h old | {opp['num_comments']} comments | {opp['reply_category']} | score: {opp['relevance_score']}")
            if opp['sensitivity'] != 'normal':
                print(f"   ⚠️  Sensitivity: {opp['sensitivity'].upper()}")
            print()
    
    return output

if __name__ == "__main__":
    process_opportunities()
