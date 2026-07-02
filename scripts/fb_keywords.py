"""Shared Facebook group post relevance filters for FursBliss outreach."""

from __future__ import annotations

# User-defined symptom / urgency terms (case-insensitive substring match)
SYMPTOM_KEYWORDS = [
    "seizure",
    "lump",
    "tumor",
    "cancer",
    "breathing",
    "coughing",
    "cough",
    "panting",
    "not eating",
    "won't eat",
    "wont eat",
    "diarrhea",
    "vomiting",
    "throwing up",
    "limping",
    "arthritis",
    "pain",
    "shaking",
    "trembling",
    "collapsed",
    "collapse",
    "weak",
    "can't walk",
    "cant walk",
    "won't walk",
    "wont walk",
    "won't stand",
    "wont stand",
    "can't stand",
    "cant stand",
    "peeing",
    "blood",
    "kidney",
    "liver",
    "heart",
    "dementia",
    "confused",
    "pacing",
    "crying",
    "whining",
    "emergency",
    "vet",
    "hospice",
    "euthanasia",
    "quality of life",
]

# Conversation-intent signals (owner asking for help)
INTENT_PHRASES = [
    "anyone else",
    "does anyone",
    "should i",
    "what should",
    "need help",
    "please help",
    "any advice",
    "looking for advice",
    "worried about",
    "not sure if",
    "older dog",
    "senior dog",
    "slowing down",
    "accidents in house",
    "drinking more",
    "losing weight",
]

INTENT_WORDS = [
    "health",
    "sick",
    "worried",
    "symptoms",
    "senior",
    "aging",
    "advice",
    "mobility",
    "medication",
    "supplement",
    "appetite",
    "lethargy",
    "lethargic",
    "stiff",
    "tired",
    "incontinence",
]

RELEVANCE_KEYWORDS = SYMPTOM_KEYWORDS + INTENT_PHRASES + INTENT_WORDS

GRIEF_EXCLUSIONS = [
    "rip ",
    "passed away",
    "rainbow bridge",
    "put down",
    "goodbye",
    "miss you",
    "grieving",
    "loss of my",
    "in memory",
    "memorial",
    "crossed the bridge",
    "rest in peace",
    "fly high",
    "forever in my heart",
    "had to let go",
    "said goodbye",
    "over the rainbow",
    "euthanasia day",
    "saying goodbye",
]

OFF_TOPIC_EXCLUSIONS = [
    "true hero",
    "saved lives",
    "rescue dog helped",
    "earthquake",
    "abandoned puppy",
]

SPAM_EXCLUSIONS = [
    "buy now",
    "click here",
    "discount",
    "promo code",
    "sale",
    "giveaway",
    "follow me",
    "check my page",
    "dm me",
    "link in bio",
    "order now",
    "free shipping",
    "use code",
]

CRISIS_NO_LINK = [
    "seizure",
    "collapsed",
    "collapse",
    "can't breathe",
    "cant breathe",
    "trouble breathing",
    "choking",
    "not breathing",
    "unresponsive",
    "bleeding",
    "poison",
    "chocolate",
    "xylitol",
]

COMMUNITY_LINK = "https://www.fursbliss.com/check?utm_source=fb-senior-dog&source=community"
DISCLOSURE = "Disclosure: I work on FursBliss."


def is_relevant(text: str, *, min_len: int = 30) -> bool:
    if not text or len(text) < min_len:
        return False
    tl = text.lower()
    if any(k in tl for k in SYMPTOM_KEYWORDS):
        return True
    if any(p in tl for p in INTENT_PHRASES):
        return True
    padded = f" {tl} "
    return any(f" {w} " in padded for w in INTENT_WORDS)


def is_excluded(text: str) -> bool:
    if not text:
        return True
    tl = text.lower()
    return any(k in tl for k in GRIEF_EXCLUSIONS) or any(k in tl for k in SPAM_EXCLUSIONS) or any(k in tl for k in OFF_TOPIC_EXCLUSIONS)


def matched_keywords(text: str) -> list[str]:
    tl = (text or "").lower()
    return [k for k in RELEVANCE_KEYWORDS if k in tl]


def link_allowed(text: str) -> bool:
    if is_excluded(text):
        return False
    tl = (text or "").lower()
    if any(k in tl for k in CRISIS_NO_LINK):
        return False
    return True


def draft_reply(snippet: str) -> str:
    """Human-approval draft — never auto-posted."""
    snippet = (snippet or "").strip()
    first_line = snippet.split(".")[0][:120]

    if is_excluded(snippet):
        return (
            f"Sending love — this sounds like a loss/grief post. Reply with empathy only, no links.\n"
            f"Post context: {first_line}..."
        )

    if not link_allowed(snippet):
        return (
            f"So scary — I'm glad you're reaching out. If breathing/collapse/seizure is happening now, "
            f"I'd call the ER line while you gather info. Hope they stabilize quickly.\n"
            f"(No link on crisis threads — support only.)\n"
            f"Post context: {first_line}..."
        )

    return (
        f"So sorry you're dealing with this — that sounds really stressful, especially with a senior pup.\n"
        f"If it's late and you're stuck on ER-now vs wait, I built a free 60-second check for exactly "
        f"that moment ({COMMUNITY_LINK}) — no judgment, just clarity.\n"
        f"{DISCLOSURE}\n"
        f"Post context: {first_line}..."
    )
