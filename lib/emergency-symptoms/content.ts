import type { SymptomPageDefinition } from "./types";

export const SYMPTOM_PAGE_ORDER = [
  "vomiting-yellow-foam",
  "vomiting-white-foam",
  "fever",
  "vomiting",
  "make-dog-throw-up",
  "choking",
  "ate-chocolate",
  "should-i-go-to-the-vet",
  "breathing-heavy",
  "rapid-breathing-at-rest",
  "excessive-panting-at-night",
] as const;

export type SymptomSlug = (typeof SYMPTOM_PAGE_ORDER)[number];

const pages: Record<SymptomSlug, SymptomPageDefinition> = {
  "vomiting-yellow-foam": {
    slug: "vomiting-yellow-foam",
    metaTitle: "Dog Vomiting Yellow Foam: Emergency or Wait? | FursBliss",
    metaDescription:
      "Yellow foam vomit in dogs often means bile on an empty stomach—but it can also signal illness. Learn red flags, when to call the vet, and safe next steps.",
    h1: "Dog Vomiting Yellow Foam: Should You Worry?",
    quickAnswer: {
      urgency: "monitor",
      body:
        "Yellow or foamy vomit is often bile, especially if it happens once after a long gap without food. If your dog seems otherwise steady, you may monitor closely—but repeated episodes, lethargy, or other symptoms change the picture fast.",
    },
    vetNowBullets: [
      "Repeated vomiting or unable to keep water down",
      "Bloody vomit, black stool, or severe belly pain",
      "Lethargy, collapse, pale gums, or trouble breathing",
      "Known toxin ingestion or foreign body risk",
    ],
    commonReasons: [
      "Empty stomach / bilious vomiting (especially morning)",
      "Diet change or scavenging something irritating",
      "Stomach upset from new treats or medication",
      "Underlying illness—only a vet exam can sort this out",
    ],
    nextSteps: [
      "Offer a small amount of water; avoid big meals until you talk with your vet if vomiting continues.",
      "Note timing, frequency, and anything unusual eaten in the last 24–48 hours.",
      "Call your veterinarian if it happens more than once, your gut says something’s off, or any red flag appears.",
    ],
    faqs: [
      {
        question: "Is yellow foam always bile?",
        answer:
          "Often, but not always. Color and texture alone can’t confirm the cause. Your vet may ask about timing, appetite, and other symptoms.",
      },
      {
        question: "Should I feed after yellow foam vomit?",
        answer:
          "If your dog seems normal and it was a single episode, many vets suggest a small bland meal—but follow your own vet’s advice for your dog’s conditions.",
      },
      {
        question: "When is yellow foam an emergency?",
        answer:
          "Treat it as urgent if vomiting is frequent, your dog can’t hydrate, there’s pain, weakness, breathing issues, or suspected poisoning.",
      },
    ],
    relatedSlugs: ["vomiting-white-foam", "vomiting", "should-i-go-to-the-vet"],
  },

  "vomiting-white-foam": {
    slug: "vomiting-white-foam",
    metaTitle: "Dog Vomiting White Foam: Causes & When to Call the Vet | FursBliss",
    metaDescription:
      "Dog vomiting white foam: common causes (saliva, nausea, cough-then-gag) vs ER signs. Plain-English red flags, what to do next, and a free symptom checker—informational only.",
    h1: "Dog Vomiting White Foam: What It Can Mean",
    quickAnswer: {
      urgency: "monitor",
      body:
        "Dog vomiting white foam is often foamy saliva or fluid mixed with air—common after gagging or mild nausea. One calm episode differs from repeat vomiting, breathing trouble, or a dog who looks unwell.",
    },
    vetNowBullets: [
      "Foaming at the mouth with trouble breathing, blue gums, or collapse",
      "Suspected toxin, bait, or unknown plant/fungus ingestion",
      "Bloat risk: large breed, restless, unproductive vomiting, distended belly",
      "Seizure-like activity or extreme lethargy",
    ],
    commonReasons: [
      "Nausea or mild stomach upset",
      "Kennel cough–type irritation (cough then gag)",
      "Eating grass or something irritating",
      "Heat stress or overexertion in some cases",
    ],
    nextSteps: [
      "Film a short clip if safe—cough vs true vomiting helps your vet triage.",
      "Remove food for a few hours only if your vet has previously okayed that for your dog; when unsure, call.",
      "Seek emergency care if breathing looks wrong or symptoms escalate.",
    ],
    faqs: [
      {
        question: "Is white foam rabies?",
        answer:
          "Rabies is rare in vaccinated dogs and not diagnosed from appearance alone. Sudden behavior change, fever, or neurologic signs need urgent veterinary assessment—not guessing online.",
      },
      {
        question: "Cough vs vomit—why does it matter?",
        answer:
          "Foam after coughing points toward airway irritation; vomiting foam after heaving points toward GI upset. Both can be serious depending on context.",
      },
      {
        question: "My dog gagged once and produced foam—what now?",
        answer:
          "If they returned to normal quickly, you can still call your vet for triage advice. If it repeats, worsens, or comes with distress, seek care sooner.",
      },
    ],
    relatedSlugs: ["vomiting-yellow-foam", "vomiting", "should-i-go-to-the-vet"],
  },

  fever: {
    slug: "fever",
    metaTitle: "Dog Fever Treatment: Safe Steps & When to Call the Vet | FursBliss",
    metaDescription:
      "Dog fever treatment is not a DIY project. Learn safe steps, why human pain/fever meds are dangerous, vomiting+fever cues, and when same-day vet contact is reasonable.",
    h1: "Dog Fever Treatment: What to Know Before You Act",
    quickAnswer: {
      urgency: "vet-soon",
      body:
        "Dog fever treatment starts with confirming a real fever and finding the cause—usually with your vet. Touch alone is unreliable. Call before using human medications; some are toxic to dogs.",
    },
    vetNowBullets: [
      "Collapse, seizures, difficulty breathing, or non-responsive behavior",
      "Known heatstroke exposure or hot car",
      "Severe vomiting/diarrhea with weakness",
      "Puppy under 16 weeks with lethargy and poor appetite",
    ],
    commonReasons: [
      "Infection (many types—vet testing helps find the source)",
      "Inflammation or immune-mediated illness",
      "Pain or stress can raise temperature slightly—context matters",
    ],
    nextSteps: [
      "If you can safely take a rectal temperature and it’s ~103.5°F or higher, call your vet with the number and symptoms.",
      "Offer water unless your vet has restricted fluids; avoid forcing food.",
      "Do not give human fever reducers unless your vet prescribes—some are toxic to dogs.",
      "If fever comes with vomiting, treat that combo as higher urgency and mention both on the call.",
    ],
    faqs: [
      {
        question: "How do I know my dog has a fever without a thermometer?",
        answer:
          "Warm ears or dry nose are unreliable. A rectal thermometer designed for pets is the practical home check when advised by your vet.",
      },
      {
        question: "Is 102°F a fever for dogs?",
        answer:
          "Many dogs run ~101–102.5°F at rest. Your vet can interpret a reading with symptoms and exam findings.",
      },
      {
        question: "What should I do tonight if I think my dog has a fever?",
        answer:
          "Offer water unless your vet has restricted fluids, keep your dog comfortable, and call for triage—especially if appetite drops, breathing changes, or energy is off.",
      },
    ],
    relatedSlugs: ["should-i-go-to-the-vet", "vomiting", "rapid-breathing-at-rest"],
  },

  vomiting: {
    slug: "vomiting",
    metaTitle: "Treat Dog Vomiting: Home Care Limits & When to Call the Vet | FursBliss",
    metaDescription:
      "Treat dog vomiting decisions are really about timing and red flags. Learn when same-day care is reasonable, what to track for your vet, and when to skip home experiments.",
    h1: "Treat Dog Vomiting: What to Do Tonight",
    quickAnswer: {
      urgency: "monitor",
      body:
        "One episode in an otherwise bright dog may be worth watching—but repeated vomiting, pain, or risk factors mean you should involve a veterinarian promptly. This page is not a treatment prescription.",
    },
    vetNowBullets: [
      "Cannot keep water down or vomiting is continuous",
      "Blood in vomit, black/tarry stool, or swollen painful belly",
      "Suspected toxin, foreign body, or bloat risk",
      "Extreme lethargy, pale gums, or trouble breathing",
    ],
    commonReasons: [
      "Dietary indiscretion (ate something weird)",
      "Parasites, infections, pancreatitis (needs testing)",
      "Motion sickness or stress",
    ],
    nextSteps: [
      "Pause new treats; avoid home meds unless your vet directs.",
      "Track episodes and photos—your vet can use that timeline.",
      "Call today if you’re unsure; emergency if red flags appear.",
    ],
    faqs: [
      {
        question: "Should I withhold food?",
        answer:
          "Sometimes vets recommend short fasting for stable adults—but not for puppies, diabetics, or dogs with other conditions unless your vet says so.",
      },
      {
        question: "When is vomiting an emergency?",
        answer:
          "Frequent vomiting, distress, inability to hydrate, blood, bloat signs, toxin risk, or any breathing/neurologic changes should be treated as urgent.",
      },
      {
        question: "What about diarrhea with vomiting?",
        answer:
          "The combination can dehydrate quickly—especially in puppies and seniors. Call your vet sooner rather than later if it persists, contains blood, or your dog seems weak.",
      },
    ],
    relatedSlugs: ["vomiting-yellow-foam", "vomiting-white-foam", "should-i-go-to-the-vet", "ate-chocolate"],
  },

  "make-dog-throw-up": {
    slug: "make-dog-throw-up",
    metaTitle: "How Do I Make a Dog Throw Up? Vet-Only Guidance | FursBliss",
    metaDescription:
      "How do I make a dog throw up is a high-stakes question. Learn why home induction is not a default move, what can go wrong, and what to do instead with poison control or your vet.",
    h1: "How Do I Make a Dog Throw Up? What Dog Owners Should Know",
    quickAnswer: {
      urgency: "emergency",
      body:
        "Do not induce vomiting unless a veterinarian or pet poison control tells you to—timing, substance, and your dog’s condition all matter. Wrong timing or the wrong toxin can cause more harm than good.",
    },
    vetNowBullets: [
      "Any suspected poisoning: call your vet or pet poison hotline immediately with packaging if available.",
      "If your dog is already weak, seizuring, or having trouble swallowing—do not attempt home induction.",
      "Sharp objects and some chemicals make vomiting especially dangerous.",
    ],
    commonReasons: [
      "Owners consider induction after toxin or foreign body ingestion—this needs professional triage.",
      "Some clinics induce vomiting in-clinic when appropriate and safe.",
    ],
    nextSteps: [
      "Call ASPCA Animal Poison Control or your local emergency vet line for live guidance.",
      "Keep hydrogen peroxide or home remedies out of the plan unless a professional instructs you.",
      "If choking is possible, see the choking guide—inducing vomit is not the fix.",
    ],
    faqs: [
      {
        question: "Can I use hydrogen peroxide at home?",
        answer:
          "Only if a veterinary professional specifically instructs you with the right concentration and dose for your dog’s situation—otherwise skip it.",
      },
      {
        question: "My dog ate chocolate—should I make them vomit?",
        answer:
          "See our chocolate guide and call poison control or your vet with type and amount; don’t guess based on blogs alone.",
      },
      {
        question: "My dog is choking—should I make them throw up?",
        answer:
          "No—choking is an airway problem, not a stomach-emptying problem. Use the choking guide and seek emergency veterinary help if breathing is compromised.",
      },
    ],
    relatedSlugs: ["ate-chocolate", "choking", "should-i-go-to-the-vet"],
  },

  choking: {
    slug: "choking",
    metaTitle: "Dog Choking: What to Do in the Next Few Minutes | FursBliss",
    metaDescription:
      "Dog choking what to do: tell airway distress from coughing, when to go to the ER, why vomit-induction is usually wrong, and when poisoning is a different emergency.",
    h1: "Dog Choking: What to Do",
    quickAnswer: {
      urgency: "emergency",
      body:
        "True choking blocks airflow. If your dog can’t breathe, sounds are stridorous, or gums are blueing, this is an emergency—call ahead and head to the nearest ER if safe. Do not rely on this page in place of immediate care.",
    },
    vetNowBullets: [
      "Gums blue/gray, collapse, or obvious airway obstruction",
      "Pawing at mouth with panic and inability to breathe",
      "Object visible in throat—avoid blind finger sweeps that push it deeper",
    ],
    commonReasons: [
      "Ball, chunk of food, toy fragment, or chew lodged in airway",
      "Sometimes mistaken for reverse sneeze or coughing—video helps your vet",
      "Retching right after eating something toxic can look like choking—poisoning needs a different first step than airway blockage.",
    ],
    nextSteps: [
      "If trained and appropriate for your situation, follow your veterinarian’s prior guidance—otherwise go straight to emergency care.",
      "Do not induce vomiting for choking—vomiting does not clear an airway blockage. (Inducing vomit is only for specific ingestions when a vet or poison control says so—see that guide.)",
      "If you suspect your dog swallowed something poisonous while gagging, read the chocolate/poisoning guide and call poison control or your vet with details.",
      "After any choking event, have your dog evaluated even if they seem fine.",
    ],
    faqs: [
      {
        question: "Heimlich on a dog—should I try?",
        answer:
          "Techniques differ by size and anatomy; doing the wrong maneuver can injure ribs or organs. Emergency clinics can coach by phone when possible.",
      },
      {
        question: "Is reverse sneeze choking?",
        answer:
          "Usually no—it's noisy but typically brief. If you’re unsure and your dog seems distressed, err on the side of urgent evaluation.",
      },
      {
        question: "Can I pull something out of my dog’s throat with tweezers?",
        answer:
          "Blind grabs can push objects deeper or injure the throat. If something is clearly visible and your vet has coached you before, follow that plan—otherwise prioritize professional care.",
      },
    ],
    relatedSlugs: ["make-dog-throw-up", "ate-chocolate", "should-i-go-to-the-vet", "vomiting"],
  },

  "ate-chocolate": {
    slug: "ate-chocolate",
    metaTitle: "Dog Ate Chocolate: What to Do (Size, Type & Urgency)",
    metaDescription:
      "Chocolate risk depends on dose and type. Learn what info your vet or poison hotline needs, why timing matters, and when to go straight to the ER.",
    h1: "Dog Ate Chocolate: What to Do",
    quickAnswer: {
      urgency: "emergency",
      body:
        "Call your veterinarian or pet poison control with your dog’s weight, chocolate type, and amount—don’t wait to “see what happens.” Dark/baking chocolate carries higher risk than small amounts of milk chocolate for a large dog, but only a professional should triage.",
    },
    vetNowBullets: [
      "Unknown amount of dark/baker’s chocolate, cocoa powder, or combined caffeine products",
      "Tremors, racing heart, agitation, vomiting repeatedly, or collapse",
      "Small dog with any suspicious ingestion",
    ],
    commonReasons: [
      "Theobromine/caffeine toxicity risk scales with dose and sensitivity",
      "Fat and sugar can also trigger pancreatitis separately",
    ],
    nextSteps: [
      "Gather wrappers and estimate grams/ounces.",
      "Run Check Symptoms Now and bring your answers to the call.",
      "Do not induce vomiting unless instructed by a professional.",
    ],
    faqs: [
      {
        question: "My dog ate a brownie—do I panic?",
        answer:
          "Panicking doesn’t help—calling for triage does. Share ingredients (xylitol is especially dangerous) and your dog’s size.",
      },
      {
        question: "Is white chocolate dangerous?",
        answer:
          "Usually lower risk than dark chocolate, but still not “free”—fat/sugar and other ingredients can matter. Ask a professional if a large amount was eaten.",
      },
      {
        question: "Should I drive straight to the ER before calling?",
        answer:
          "If your dog looks distressed, is seizuring, or can’t stay steady, heading in while someone else calls can be reasonable. If your dog seems stable, a quick poison-control or vet call can route you to the right level of care.",
      },
    ],
    relatedSlugs: ["make-dog-throw-up", "should-i-go-to-the-vet", "vomiting", "choking"],
  },

  "should-i-go-to-the-vet": {
    slug: "should-i-go-to-the-vet",
    metaTitle: "Should I Take My Dog to the Vet? Red Flags & What to Say | FursBliss",
    metaDescription:
      "Should I take my dog to the vet is easier to answer when you separate true emergencies from “call today” issues. Learn red flags, what to log, and how to brief your clinic.",
    h1: "Should I Take My Dog to the Vet?",
    quickAnswer: {
      urgency: "monitor",
      body:
        "If you’re asking, you’re already being a good advocate. Use red flags as your north star: breathing, consciousness, severe pain, repeated vomiting, toxin risk, and sudden weakness usually mean “call now.” Everything else still deserves a timeline—same day vs next available.",
    },
    vetNowBullets: [
      "Trouble breathing, choking, blue gums, or collapse",
      "Non-stop vomiting, retching with no production, or severe belly distension",
      "Seizures, inability to walk, sudden extreme pain",
      "Heatstroke, major trauma, or known toxin",
    ],
    commonReasons: [
      "Owners worry because symptoms are new, vague, or overlapping—that’s normal.",
      "Puppies, seniors, and dogs with chronic illness often warrant a lower threshold to call.",
    ],
    nextSteps: [
      "Run Check Symptoms Now and bring the summary to your call.",
      "Write down onset time, frequency, and anything eaten.",
      "If the clinic is closed, use the emergency line—describe red flags clearly.",
    ],
    faqs: [
      {
        question: "Telehealth vs in-person?",
        answer:
          "Telehealth can help triage stable issues; emergencies need in-person care.",
      },
      {
        question: "Am I overreacting?",
        answer:
          "Vets prefer an early call over a late one for true emergencies. If you’re unsure and it’s after hours, use an ER triage line.",
      },
      {
        question: "What info should I have ready before I call?",
        answer:
          "Onset time, frequency, last meal, anything eaten or chewed, current energy level, gum color if you can check safely, and any medications your dog takes.",
      },
    ],
    relatedSlugs: ["vomiting", "breathing-heavy", "fever", "ate-chocolate"],
  },

  "breathing-heavy": {
    slug: "breathing-heavy",
    metaTitle: "Senior Dog Breathing Heavy: When to Worry | FursBliss",
    metaDescription:
      "Senior dog breathing heavy after play can be normal. New heavy breathing at rest, blue gums, or labored effort needs a same-day vet call. Links to fast breathing at rest and night panting.",
    h1: "Senior Dog Breathing Heavy: When to Worry",
    quickAnswer: {
      urgency: "vet-soon",
      body:
        "Senior dog breathing heavy is common after heat or exercise. It is more worrying when it is new at rest, looks labored, or comes with blue-tinged gums or collapse—those patterns deserve a vet today.",
    },
    vetNowBullets: [
      "Open-mouth breathing at rest when it’s not hot and your dog wasn’t exercising",
      "Blue/gray gums, collapse, or wheezing/stridor",
      "Belly pushing hard with each breath or neck extended",
      "Pain, restlessness, or coughing fits with breathing changes",
    ],
    commonReasons: [
      "Heart disease, airway disease, pain, anemia, obesity-related strain",
      "Heat and anxiety (still worth ruling out if new)",
    ],
    nextSteps: [
      "Count breaths per minute at rest when calm; note video for your vet.",
      "Avoid strenuous exercise until evaluated if this is new.",
      "Same-day call for new resting heavy breathing in seniors.",
    ],
    faqs: [
      {
        question: "What’s a normal resting respiratory rate?",
        answer:
          "Many calm dogs are roughly in the teens–30s breaths per minute depending on size; your vet can tell you what’s normal for yours and when to worry.",
      },
      {
        question: "My old dog pants at night—is that the same as heavy breathing?",
        answer:
          "Sometimes. Night panting can be heat, anxiety, pain, or illness. New persistent night panting is worth a vet call even if days look fine—see our night panting guide for a structured checklist.",
      },
      {
        question: "Should I avoid walks until this is checked?",
        answer:
          "If breathing is new and worse at rest, skip strenuous exercise until your vet clears it—especially in seniors and brachycephalic breeds.",
      },
    ],
    relatedSlugs: ["rapid-breathing-at-rest", "excessive-panting-at-night", "should-i-go-to-the-vet"],
  },

  "rapid-breathing-at-rest": {
    slug: "rapid-breathing-at-rest",
    metaTitle: "Dog Rapid Breathing at Rest: When to Call the Vet | FursBliss",
    metaDescription:
      "Dog rapid breathing at rest is not something to ignore when it is new. Learn ER vs same-day cues, what to count for your vet, and links to heavy breathing and night panting guides.",
    h1: "Dog Rapid Breathing at Rest: What It Can Mean",
    quickAnswer: {
      urgency: "vet-soon",
      body:
        "Dog rapid breathing at rest—fast breaths when your dog is calm and not overheated—often deserves a same-day vet call when the pattern is new. Apps cannot measure oxygen or listen to the chest.",
    },
    vetNowBullets: [
      "Gums look blue/gray or your dog won’t settle",
      "Breathing rate climbing over time or effort increasing",
      "Cough, foam, fever, or belly distension alongside fast breathing",
    ],
    commonReasons: [
      "Heart or lung disease, pain, fever, stress, anemia",
    ],
    nextSteps: [
      "Avoid heat; keep your dog calm during transport if you’re heading in.",
      "Note when it started and whether cough or lethargy is present.",
      "Use Check Symptoms Now to organize details before you call.",
    ],
    faqs: [
      {
        question: "Panting vs tachypnea—what’s the difference?",
        answer:
          "Panting is often open-mouth with tongue out; rapid quiet breathing can be different. If unsure, have a professional evaluate.",
      },
      {
        question: "Should I count breaths at home?",
        answer:
          "A calm one-minute count at rest can be useful to share with your vet. Do not delay urgent care if your dog looks distressed while you measure.",
      },
      {
        question: "Can anxiety cause fast breathing at rest?",
        answer:
          "Sometimes, but you should not assume anxiety without ruling out medical causes—especially if the pattern is new.",
      },
    ],
    relatedSlugs: ["breathing-heavy", "excessive-panting-at-night", "fever", "should-i-go-to-the-vet"],
  },

  "excessive-panting-at-night": {
    slug: "excessive-panting-at-night",
    metaTitle: "Dog Excessive Panting at Night: Causes to Discuss With Your Vet",
    metaDescription:
      "Night panting can be pain, anxiety, heat, or illness. Learn non-alarmist next steps, what to log, and when an overnight ER visit is reasonable.",
    h1: "Dog Excessive Panting at Night: Should You Worry?",
    quickAnswer: {
      urgency: "monitor",
      body:
        "Night panting can be as simple as a warm room—or a sign your dog can’t get comfortable from pain, anxiety, or a medical issue. New persistent night panting deserves a vet call, even if days look okay.",
    },
    vetNowBullets: [
      "Panting with distress, purple/blue gums, or collapse",
      "Bloat risk signs in large dogs: restless, unproductive vomiting, distended belly",
      "Sudden severe panting after toxin exposure or trauma",
    ],
    commonReasons: [
      "Pain (orthopedic, abdominal), anxiety, cognitive changes in seniors",
      "Heart disease or respiratory disease",
      "Heat/humidity and obesity",
    ],
    nextSteps: [
      "Cool the room, offer water, and observe breathing rate once calm.",
      "Log nights on video—patterns help your vet.",
      "Book a non-urgent visit if it repeats without red flags; go urgent if breathing looks wrong.",
    ],
    faqs: [
      {
        question: "Should I give CBD or supplements?",
        answer:
          "Ask your vet before adding anything—some products interact with medications or mask symptoms.",
      },
      {
        question: "Is a fan or AC enough to stop night panting?",
        answer:
          "Cooling can help if heat is the trigger, but persistent panting still deserves veterinary follow-up.",
      },
      {
        question: "Could it be pain even if my dog doesn’t cry?",
        answer:
          "Yes—dogs often hide pain. Restlessness, posture changes, and sleep disruption can be subtle clues.",
      },
    ],
    relatedSlugs: ["breathing-heavy", "rapid-breathing-at-rest", "should-i-go-to-the-vet"],
  },
};

function isSlug(s: string): s is SymptomSlug {
  return (SYMPTOM_PAGE_ORDER as readonly string[]).includes(s);
}

export function getSymptomSlugs(): SymptomSlug[] {
  return [...SYMPTOM_PAGE_ORDER];
}

export function getSymptomPage(slug: string): SymptomPageDefinition | undefined {
  if (!isSlug(slug)) return undefined;
  return pages[slug];
}

export function getAllSymptomPages(): SymptomPageDefinition[] {
  return SYMPTOM_PAGE_ORDER.map((s) => pages[s]);
}

/** Featured on /symptoms hub—high-intent batch for internal linking & SEO focus. */
export const HUB_FEATURED_EMERGENCY_SLUGS = [
  "vomiting-white-foam",
  "fever",
  "choking",
  "breathing-heavy",
  "rapid-breathing-at-rest",
] as const satisfies readonly SymptomSlug[];

export function getFeaturedEmergencySymptomPages(): SymptomPageDefinition[] {
  return HUB_FEATURED_EMERGENCY_SLUGS.map((s) => pages[s]);
}

export function getOtherEmergencySymptomPages(): SymptomPageDefinition[] {
  const featured = new Set<string>(HUB_FEATURED_EMERGENCY_SLUGS);
  return SYMPTOM_PAGE_ORDER.filter((s) => !featured.has(s)).map((s) => pages[s]);
}
