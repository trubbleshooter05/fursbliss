#!/usr/bin/env python3
"""Generate unique weekday FursBliss social infographics into public/images/social/."""
from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "public" / "images" / "social"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1080
TEAL = (13, 115, 119); TEAL_DARK = (8, 85, 88); TEAL_SOFT = (232, 245, 245)
ORANGE = (232, 93, 4); ORANGE_SOFT = (255, 243, 232); CREAM = (252, 249, 244)
WHITE = (255, 255, 255); INK = (35, 40, 48); MUTED = (90, 98, 110); RED = (180, 45, 45)

def font(size, bold=False):
    for path in [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]:
        if Path(path).exists():
            try: return ImageFont.truetype(path, size)
            except Exception: pass
    return ImageFont.load_default()

def draw_logo(draw, x=48, y=40):
    draw.ellipse((x, y, x+54, y+54), fill=TEAL)
    draw.ellipse((x+16, y+18, x+28, y+30), fill=WHITE)
    draw.ellipse((x+28, y+18, x+40, y+30), fill=WHITE)
    draw.ellipse((x+14, y+8, x+24, y+18), fill=WHITE)
    draw.ellipse((x+32, y+8, x+42, y+18), fill=WHITE)
    draw.ellipse((x+22, y+28, x+34, y+44), fill=WHITE)
    draw.text((x+68, y+6), "FursBliss", font=font(34, True), fill=TEAL_DARK)
    draw.text((x+68, y+40), "Better care. Happier days.", font=font(18), fill=MUTED)

def footer(draw, text="Not sure? Free check in 60 seconds — fursbliss.com/check"):
    draw.rectangle((0, H-110, W, H), fill=ORANGE)
    draw.ellipse((42, H-78, 66, H-54), fill=WHITE)
    draw.ellipse((58, H-78, 82, H-54), fill=WHITE)
    draw.polygon([(42, H-64), (82, H-64), (62, H-38)], fill=WHITE)
    draw.text((100, H-72), text, font=font(26, True), fill=WHITE)

def checklist_card(title, items, filename, accent=TEAL):
    img = Image.new("RGB", (W, H), CREAM); d = ImageDraw.Draw(img); draw_logo(d)
    y = 130; words = title.upper().split(); line1, line2 = [], []
    for w in words:
        test = " ".join(line1 + [w])
        if d.textlength(test, font=font(46, True)) < W - 96 and not line2: line1.append(w)
        else: line2.append(w)
    d.text((48, y), " ".join(line1), font=font(46, True), fill=TEAL_DARK)
    if line2:
        d.text((48, y+56), " ".join(line2), font=font(46, True), fill=TEAL_DARK); y += 120
    else:
        y += 70
    row_h = 95 if len(items) <= 5 else 82
    for i, (label, sub) in enumerate(items):
        bg = TEAL_SOFT if i % 2 == 0 else ORANGE_SOFT
        top = y + i * row_h
        d.rounded_rectangle((40, top, W-40, top+row_h-10), radius=18, fill=bg)
        cx, cy = 70, top + 22
        d.rounded_rectangle((cx, cy, cx+36, cy+36), radius=8, fill=accent)
        d.line([(cx+8, cy+18), (cx+15, cy+26), (cx+28, cy+10)], fill=WHITE, width=4)
        d.text((130, top+14), label, font=font(30, True), fill=INK)
        if sub: d.text((130, top+50), sub, font=font(20), fill=MUTED)
    footer(d); path = OUT / filename; img.save(path, "PNG", optimize=True); print("wrote", path.name); return path

def two_col_card(title, left_title, left_items, right_title, right_items, filename):
    img = Image.new("RGB", (W, H), CREAM); d = ImageDraw.Draw(img); draw_logo(d)
    d.text((48, 130), title.upper(), font=font(44, True), fill=TEAL_DARK)
    mid = W // 2
    d.rounded_rectangle((40, 220, mid-16, H-140), radius=22, fill=(255, 236, 236))
    d.rounded_rectangle((mid+16, 220, W-40, H-140), radius=22, fill=ORANGE_SOFT)
    d.rounded_rectangle((56, 240, mid-32, 300), radius=14, fill=RED)
    d.rounded_rectangle((mid+32, 240, W-56, 300), radius=14, fill=ORANGE)
    d.text((76, 254), left_title, font=font(26, True), fill=WHITE)
    d.text((mid+52, 254), right_title, font=font(26, True), fill=WHITE)
    for i, item in enumerate(left_items):
        yy = 330 + i * 70; d.ellipse((66, yy, 96, yy+30), fill=RED); d.text((112, yy+2), item, font=font(26, True), fill=INK)
    for i, item in enumerate(right_items):
        yy = 330 + i * 70; d.ellipse((mid+42, yy, mid+72, yy+30), fill=ORANGE); d.text((mid+88, yy+2), item, font=font(26, True), fill=INK)
    footer(d, "Free 60-second check — fursbliss.com/check")
    path = OUT / filename; img.save(path, "PNG", optimize=True); print("wrote", path.name); return path

def main():
    checklist_card("Senior Dog Vaccine Log Essentials", [
        ("Rabies current date", "Know the exact due window"),
        ("DHPP / core vaccines", "Keep clinic + lot notes"),
        ("Bordetella if boarded", "Facilities often require proof"),
        ("Annual bloodwork link", "Pair shots with labs"),
        ("Photo of paper records", "Backup before they fade"),
    ], "vaccine-log-essentials.png")
    checklist_card("Track These 5 Weekly For Senior Dogs", [
        ("Appetite trend", "Missed meals vs normal"),
        ("Energy on walks", "Distance + recovery time"),
        ("Breathing at rest", "Count for 30 seconds x2"),
        ("Mobility on stairs", "Hesitation is a signal"),
        ("Night restlessness", "Pacing / confusion notes"),
    ], "weekly-senior-tracking.png")
    two_col_card("Call Tonight Or Wait?", "CALL NOW",
        ["Gums pale or blue", "Won't stand at all", "Belly hard + retching", "Seizure right now", "Heavy bleeding"],
        "USUALLY MONITOR", ["One soft stool", "Mild stiffness AM", "Skipped 1 snack", "Still playful"],
        "call-tonight-or-wait.png")
    checklist_card("60-Second Senior Symptom Check", [
        ("Breathing calm at rest?", "Fast or labored needs eyes on it"),
        ("Gum color normal?", "Pale/blue is urgent"),
        ("Eating anything today?", "Timeline matters for the vet"),
        ("Pain signs?", "Limping, guarding, yelping"),
        ("Vomiting pattern?", "Once vs repeated"),
        ("Collapse or seizure?", "Call ER while someone drives"),
    ], "sixty-second-symptom-check.png", accent=ORANGE)
    checklist_card("Weekend Watch Before Monday Vet", [
        ("Note first odd symptom time", "Exact hour helps triage"),
        ("Photo anything new", "Lumps, vomit, stool"),
        ("Baseline vs today energy", "Write one honest sentence"),
        ("Meds given on schedule?", "Missed doses change the picture"),
        ("Plan Monday questions", "3 questions max, written down"),
    ], "weekend-watch-checklist.png")

if __name__ == "__main__":
    main()
