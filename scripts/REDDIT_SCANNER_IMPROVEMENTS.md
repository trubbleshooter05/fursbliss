# Reddit Opportunity Scanner - Improvements (March 5, 2026)

## Problem
The old Reddit scanner was suggesting replies on irrelevant posts:
- Puppies (< 1 year old)
- Cats and other non-dog animals
- Grief/loss/euthanasia posts (insensitive to reply)
- Training, crates, toys, grooming (unrelated to senior dog health)
- Generic posts with no health concerns

**Example bad suggestions from old output:**
- "New dog owner here any advice?" (new puppy) → categorized as "senior"
- "how soon would kidney damage show up following lily exposure" (2 year old CAT) → categorized as "senior"
- "Processing a loss" (grief post) → categorized as "senior"
- "Euthanasia?" (9 month old kitten) → categorized as "emergency"
- "how do i get my dog to not eat cat food?" (3 year old dog) → categorized as "senior"

## Solution

### 1. Hard Exclusion Filters
**Never include posts containing:**
- Puppies: "puppy", "puppies", "8 weeks", "10 weeks", etc.
- Grief: "RIP", "passed away", "rainbow bridge", "euthanasia", "put down", "goodbye", "miss you", "grieving", "processing a loss"
- Cats: "kitten", "cat", "feline"
- Unrelated: "crate training", "potty training", "book recommendation", "food bowl", "toys", "grooming", "rabies vaccine", "eating cat food"

### 2. Relevance Scoring (0-100)
**Only include posts with score >= 40:**
- Subreddit bonus:
  - r/seniordogs: +40 points (always include)
  - r/AskVet: +10 points
- Age detection: 7+ years = +30 points, < 2 years = -50 points
- Health keywords: +5 points each (max +30)
- Emergency keywords: +15 points

**Must have at least ONE:**
- Dog age >= 7 years
- Keywords: "senior", "older", "aging", "arthritis", "limping", "not eating", "lump", "tumor", "breathing", "coughing", "confused", "cognitive", "slowing down", "mobility", "health decline", "supplement", "quality of life"
- Post from r/seniordogs

### 3. Fixed Categorization
- **"senior"**: Dogs 7+ years with health/aging concerns (relevance score >= 50)
- **"emergency"**: Acute symptoms (vomiting, bleeding, collapse, difficulty breathing, seizure) in dogs >= 1 year
- **"not_relevant"**: Everything else (excluded from output)

### 4. Removed Suggested Replies
- **Old:** Script generated generic suggested replies for every post
- **New:** NO suggested replies in JSON output
- **Why:** Replies must be written manually after reading the full post context

### 5. Sensitivity Flags
- **"grief"**: Post mentions loss/dying/euthanasia → DO NOT REPLY (these posts are excluded entirely now)
- **"urgent"**: Emergency symptoms → empathetic + actionable tone
- **"normal"**: Standard health concerns → helpful + non-salesy tone

## Results

**Before (example from 2026-03-04):**
- 20 opportunities
- Included: puppies, cats, grief posts, crates, rabies questions, euthanasia posts
- Generic "Fellow senior dog owner" replies suggested for everything

**After (test run 2026-03-06):**
- 5 opportunities
- All posts: actual senior dogs (8-13 years old) with genuine health concerns
- No suggested replies (manual review required)
- Sensitivity flags for appropriate tone

## Output Format (JSON)

```json
{
  "generated_at": "2026-03-06T00:52:21.101722",
  "total_found": 5,
  "opportunities": [
    {
      "subreddit": "AskVet",
      "post_url": "https://reddit.com/...",
      "post_title": "13 Year Old Male Poodle Peeing Small amounts of Blood",
      "post_snippet": "My dog (Male, miniature poodle, 13 years old)...",
      "age_hours": 10.3,
      "num_comments": 7,
      "reply_category": "emergency",
      "relevance_score": 80.0,
      "sensitivity": "urgent"
    }
  ],
  "instructions": [
    "1. Review each post manually",
    "2. Write personalized replies based on sensitivity flag",
    "3. 'grief' = DO NOT REPLY (included for context only)",
    "4. 'urgent' = empathetic + actionable",
    "5. 'normal' = helpful + non-salesy",
    "6. Max 3-5 replies per day to avoid spam filters"
  ]
}
```

## File Locations

- **Script:** `/Users/gp/fursbliss_new/scripts/reddit_opportunity_finder.py`
- **Output:** `/Users/gp/fursbliss_growth/reddit_opportunities_YYYYMMDD.json`
- **Cron:** Daily at 9am (configured separately)

## Next Steps

1. Copy the new script to your OpenClaw server: `/Volumes/ladmin/clawd/scripts/reddit_opportunity_finder.py`
2. Test the cron job to ensure it runs daily at 9am
3. Update OpenClaw's daily review task to read the new JSON format (no `suggested_reply` field)
4. Manually review and write personalized replies for the top 3-5 posts each day

## Key Improvement

**Old approach:** Suggest replies for everything, filter manually
**New approach:** Filter aggressively at scan time, only surface genuinely relevant opportunities

This prevents Reddit bans by ensuring we only engage where it's genuinely helpful.
