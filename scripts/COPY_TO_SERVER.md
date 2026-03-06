# Copy Updated Reddit Scanner to OpenClaw Server

## Step 1: Copy the new script to your server

Since you're running as user `gp` but the server is at `/Volumes/ladmin`, run these commands in Terminal:

```bash
# Copy the new script
sudo cp /Users/gp/fursbliss_new/scripts/reddit_opportunity_finder.py /Volumes/ladmin/clawd/scripts/

# Make it executable
sudo chmod +x /Volumes/ladmin/clawd/scripts/reddit_opportunity_finder.py

# Verify it's there
ls -la /Volumes/ladmin/clawd/scripts/reddit_opportunity_finder.py
```

## Step 2: Test the script on the server

```bash
# Run it manually to test
python3 /Volumes/ladmin/clawd/scripts/reddit_opportunity_finder.py

# Check the output
cat /Users/gp/fursbliss_growth/reddit_opportunities_$(date +%Y%m%d).json | python3 -m json.tool | head -50
```

## Step 3: Update OpenClaw's daily review task

The JSON format has changed. OpenClaw needs to know:

1. **No more `suggested_reply` field** - tell OpenClaw to ignore this field
2. **New fields:**
   - `relevance_score`: 0-100 (higher = more relevant)
   - `sensitivity`: "grief" | "urgent" | "normal"

3. **Filtering logic:**
   - Show top 5 posts sorted by: newest first, fewest comments second
   - Prioritize `sensitivity: "urgent"` posts

### Tell OpenClaw (in your next conversation):

```
The Reddit opportunity scanner JSON format has changed.

New fields:
- relevance_score: 0-100 (higher = more relevant)
- sensitivity: "grief" | "urgent" | "normal"

Removed fields:
- suggested_reply (no longer exists)
- notes (no longer exists)

When summarizing opportunities:
1. Show top 5 posts (already sorted by newest + fewest comments)
2. Highlight "urgent" sensitivity posts first
3. For each post show: subreddit, title, URL, age, comments, category, relevance score, sensitivity
4. Remind me to write personalized replies (no templates)
```

## Step 4: Verify cron job

The cron job should already be set up for 9am daily. Verify:

```bash
crontab -l | grep reddit
```

Should show:
```
0 9 * * * /usr/bin/python3 /Volumes/ladmin/clawd/scripts/reddit_opportunity_finder.py >> ~/logs/reddit_finder.log 2>&1
```

## What Changed

**Before:** 20 opportunities (many irrelevant - puppies, cats, grief, training)
**After:** 5 opportunities (all genuine senior dog health posts)

**Exclusions added:**
- Puppies (< 1 year)
- Cats/other animals
- Grief/loss posts
- Training, crates, toys, grooming

**New scoring:** Only posts with relevance score >= 40 are included.

## Next Manual Steps

Each day at 9:05am, OpenClaw will read the opportunities file and send you a Telegram notification with the top 5 posts.

For each post:
1. Read the full Reddit post
2. Check the `sensitivity` flag
3. Write a personalized reply (no templates!)
4. Max 3-5 replies per day to avoid spam filters

**Sensitivity guidelines:**
- "urgent": Empathetic + actionable (e.g., "That sounds scary. Have you been to a vet yet?")
- "normal": Helpful + non-salesy (e.g., "Tracking those symptoms might help your vet see patterns")
