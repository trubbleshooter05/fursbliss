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
    "heart failure",
    "heart murmur",
    "heart disease",
    "congestive heart",
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

COMMENT_REPLY_SIGNALS = [
    "no words that can",
    "been through so many",
    "the best thing you are doing",
    "the best thing you're doing",
    "letting him go in familiar",
    "letting her go in familiar",
    "for him you got to",
    "for her you got to",
    "you got to do it",
    "praying for you and",
    "sending love and light",
    "i'm so sorry for your loss",
    "so sorry for your loss",
]

UPDATE_SIGNALS = [
    "update:",
    "quick update",
    "good update",
    "much better",
    "looking much better",
    "healing well",
    "on the mend",
    "great news",
    "turned a corner",
    "improving",
    "doing much better",
    "vet said he",
    "vet said she",
    "vet is pleased",
    "weight bearing again",
]

QOL_SIGNALS = [
    "quality of life",
    "qol",
    "euthanasia",
    "at home euth",
    "at-home euth",
    "put down",
    "put to sleep",
    "let him go",
    "let her go",
    "letting him go",
    "letting her go",
    "saying goodbye",
    "last days",
    "final days",
    "when is it time",
    "how do i know when",
    "mobile vet",
    "in home vet",
]

OP_SIGNALS = [
    "my dog",
    "my pup",
    "my boy",
    "my girl",
    "my senior",
    "our dog",
    "update:",
    "update ",
    "anyone else",
    "does anyone",
    "should i",
    "what should i",
    "please help",
    "need help",
    "worried about",
    "not sure if",
    "i have a",
    "we have a",
    "i'm worried",
    "im worried",
    "my heart hurts",
    "my heart is",
    "help me",
    "any advice",
    "looking for advice",
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


def is_comment_reply(text: str) -> bool:
    tl = (text or "").lower()
    return any(k in tl for k in COMMENT_REPLY_SIGNALS)


def is_update_post(text: str) -> bool:
    tl = (text or "").lower()
    return any(k in tl for k in UPDATE_SIGNALS)


def is_qol_thread(text: str) -> bool:
    tl = (text or "").lower()
    return any(k in tl for k in QOL_SIGNALS)


def sounds_like_op(text: str) -> bool:
    if is_comment_reply(text):
        return False
    tl = (text or "").lower()
    return any(k in tl for k in OP_SIGNALS)


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
    return (
        any(k in tl for k in GRIEF_EXCLUSIONS)
        or any(k in tl for k in SPAM_EXCLUSIONS)
        or any(k in tl for k in OFF_TOPIC_EXCLUSIONS)
    )


def classify_post(text: str) -> str:
    """Returns: skip | update | qol | grief | crisis | comment | symptom_question"""
    snippet = (text or "").strip()
    if not snippet:
        return "skip"
    if is_excluded(snippet):
        return "grief"
    if is_comment_reply(snippet):
        return "comment"
    if is_update_post(snippet):
        return "update"
    if is_qol_thread(snippet):
        return "qol"
    tl = snippet.lower()
    if any(k in tl for k in CRISIS_NO_LINK):
        return "crisis"
    if sounds_like_op(snippet) and is_relevant(snippet):
        return "symptom_question"
    if is_relevant(snippet) and not sounds_like_op(snippet):
        return "comment"
    return "skip"


def is_outreach_candidate(text: str, *, min_len: int = 30) -> bool:
    """True only when scraped text looks like an OP asking for help."""
    if not text or len(text) < min_len:
        return False
    if is_excluded(text):
        return False
    return classify_post(text) == "symptom_question"


def matched_keywords(text: str) -> list[str]:
    tl = (text or "").lower()
    return [k for k in RELEVANCE_KEYWORDS if k in tl]


def link_allowed(text: str) -> bool:
    return classify_post(text) == "symptom_question"


def draft_reply(snippet: str) -> str:
    """Human-approval draft — never auto-posted. Matched to post intent."""
    snippet = (snippet or "").strip()
    first_line = snippet.split(".")[0][:120]
    kind = classify_post(snippet)

    if kind == "comment":
        return (
            "SKIP — scraped text looks like a comment reply, not the original post. "
            "Open the URL, read what the owner actually wrote, then reply manually.\n"
            f"Scraped text: {first_line}..."
        )

    if kind == "update":
        return (
            "This looks like a positive update — reply with encouragement only. "
            "No tool link, no product mention.\n"
            "Example angle: celebrate the progress, ask how the next vet check goes, "
            "acknowledge how hard the last few days must have been.\n"
            f"Post context: {first_line}..."
        )

    if kind in ("grief", "qol"):
        return (
            "Quality-of-life / end-of-life thread — empathy only. No links, no checker, no product.\n"
            "Example angle: acknowledge how impossible this decision is, validate that "
            "being present and loving them through it matters. Do not pitch tools.\n"
            f"Post context: {first_line}..."
        )

    if kind == "crisis":
        return (
            "Active crisis thread — support only, no link.\n"
            "Example angle: if breathing/collapse/seizure is happening now, call the ER "
            "line while someone else drives. Hope they stabilize.\n"
            f"Post context: {first_line}..."
        )

    if kind == "symptom_question":
        return (
            "Owner asking about symptoms/urgency — checker link OK only after answering their question.\n"
            f"If it's late and you're stuck on ER-now vs wait, I built a free 60-second "
            f"check for exactly that moment ({COMMUNITY_LINK}) — no judgment, just clarity.\n"
            f"{DISCLOSURE}\n"
            f"Post context: {first_line}..."
        )

    return (
        "No clear outreach match — read the full post before replying. "
        "Default to empathy only unless they're clearly asking whether to go to the vet tonight.\n"
        f"Post context: {first_line}..."
    )
