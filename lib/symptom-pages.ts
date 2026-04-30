export type SymptomUrgencyLevel = "red" | "orange" | "yellow" | "green";

export type SymptomFaq = {
  question: string;
  answer: string;
};

export type SymptomPageContent = {
  slug: string;
  h1: string;
  symptomQuestion: string;
  quickAnswer: string;
  metaBrief: string;
  urgencyLevel: SymptomUrgencyLevel;
  urgencyLabel: string;
  symptomParam: string;
  intro:
    | [string, string]
    | [string, string, string];
  commonCauses: string[];
  emergencyRedFlags: string[];
  canWaitSignals: string[];
  homeCare: string[];
  relatedSlugs: string[];
  faq: SymptomFaq[];
};

export const symptomPages: SymptomPageContent[] = [
  {
    slug: "dog-vomiting-blood",
    h1: "My Dog Is Vomiting Blood — Should I Go to the ER?",
    symptomQuestion: "Dog vomiting blood",
    quickAnswer:
      "Usually yes. Blood in vomit (bright red or dark, coffee-ground material) is an urgent sign and should be checked by a veterinarian within hours.",
    metaBrief:
      "Blood in vomit is often urgent, especially with weakness, black stool, or repeated vomiting.",
    urgencyLevel: "red",
    urgencyLabel: "High urgency in most cases",
    symptomParam: "vomiting blood",
    intro: [
      "Seeing blood in your dog's vomit is scary, and your instinct to act quickly is the right one. Blood can come from the mouth, esophagus, stomach, or upper intestines. Sometimes it appears bright red, and other times it looks dark brown like coffee grounds. Both patterns can point to irritation, ulcers, swallowed blood, toxins, or internal disease that needs prompt evaluation.",
      "If your dog is also weak, pale, breathing hard, or cannot keep water down, treat this as an emergency now. Even when your dog still seems alert, repeated vomiting with blood can lead to dehydration and rapid decline. Early treatment usually gives your veterinarian more options and can prevent a much more serious outcome overnight.",
    ],
    commonCauses: [
      "Stomach or intestinal irritation from diet changes, spoiled food, or severe inflammation",
      "Ulcers from medications (such as some pain medications) or chronic disease",
      "Swallowed blood from mouth, nose, or throat injury",
      "Toxin exposure or a foreign body irritating the digestive tract",
      "Clotting problems or serious systemic illness",
    ],
    emergencyRedFlags: [
      "Repeated vomiting with blood, especially every few minutes",
      "Pale gums, weakness, collapse, or rapid breathing",
      "Black/tarry stool, severe belly pain, or swollen abdomen",
      "Known toxin ingestion, especially rat poison or human medications",
    ],
    canWaitSignals: [
      "A single small blood streak but normal energy and hydration may allow same-day vet guidance",
      "No additional red flags while you arrange rapid veterinary follow-up",
    ],
    homeCare: [
      "Remove food for a short period unless your vet advises otherwise, but keep water available in small amounts",
      "Do not give human medications or over-the-counter stomach remedies",
      "Collect a photo of vomit and timeline details for your vet",
      "Use triage now and head to ER if symptoms worsen",
    ],
    relatedSlugs: ["dog-diarrhea-blood", "dog-not-eating", "dog-lethargic"],
    faq: [
      {
        question: "Is dark, coffee-ground vomit still blood?",
        answer: "Often yes. Dark granular vomit can indicate older digested blood and should be treated urgently.",
      },
      {
        question: "Can I monitor at home overnight?",
        answer: "If blood is recurring or your dog seems weak, do not wait. Get urgent veterinary care.",
      },
    ],
  },
  {
    slug: "dog-ate-chocolate",
    h1: "My Dog Ate Chocolate — Is It an Emergency?",
    symptomQuestion: "Dog ate chocolate",
    quickAnswer:
      "It depends on type and amount. Dark and baking chocolate are the most dangerous. Small amounts of milk chocolate may be less urgent, but quick triage is still important.",
    metaBrief:
      "Chocolate toxicity risk depends on chocolate type, dose, and dog size, and can become urgent fast.",
    urgencyLevel: "orange",
    urgencyLabel: "Urgent if moderate/high dose",
    symptomParam: "ate chocolate",
    intro: [
      "Chocolate contains theobromine and caffeine, two stimulants dogs process much more slowly than humans. That means even a snack-sized exposure can become dangerous in small dogs, while larger dogs may show milder signs from the same amount. The exact risk depends on your dog's weight, the chocolate type, and when it was eaten.",
      "Dark chocolate, baking chocolate, and cocoa powder carry the highest risk. Symptoms can include vomiting, restlessness, fast heart rate, tremors, and seizures. Because timing matters with toxin ingestion, do not wait for severe symptoms before taking action. Fast triage helps you decide whether to monitor, call your vet now, or go straight to emergency care.",
    ],
    commonCauses: [
      "Dogs finding candy, brownies, cookies, or cocoa powder left out",
      "Holiday treats and gift boxes in reach",
      "Accidental ingestion during baking",
      "Unsuspected exposure to dark chocolate products",
    ],
    emergencyRedFlags: [
      "Tremors, seizures, collapse, or extreme restlessness",
      "Rapid breathing, high heart rate, or persistent vomiting",
      "Large dose of dark/baking chocolate relative to body weight",
    ],
    canWaitSignals: [
      "Very small milk chocolate exposure with no symptoms may allow monitor + same-day vet guidance",
      "Dog remains normal in behavior, appetite, and hydration while under close observation",
    ],
    homeCare: [
      "Save packaging so your vet can estimate dose and risk quickly",
      "Call poison control or your veterinarian immediately with amount, type, and time eaten",
      "Do not induce vomiting unless a veterinarian specifically instructs you",
      "Use triage now to decide urgency based on your dog's exact situation",
    ],
    relatedSlugs: ["dog-ate-something-toxic", "dog-shaking-trembling", "dog-seizure"],
    faq: [
      {
        question: "Is white chocolate dangerous?",
        answer: "White chocolate has much lower theobromine but can still cause stomach upset and pancreatitis risk.",
      },
      {
        question: "How fast do symptoms appear?",
        answer: "Symptoms may appear within hours, which is why early triage and vet advice are important.",
      },
    ],
  },
  {
    slug: "dog-not-eating",
    h1: "My Dog Won't Eat — When Should I Worry?",
    symptomQuestion: "Dog not eating",
    quickAnswer:
      "A healthy dog skipping one meal is often okay. If your dog has not eaten in 24+ hours, or has vomiting, lethargy, or pain, contact your vet.",
    metaBrief:
      "Skipping one meal can be normal, but 24+ hours without food or additional symptoms needs veterinary attention.",
    urgencyLevel: "yellow",
    urgencyLabel: "Monitor closely, escalate with other signs",
    symptomParam: "not eating",
    intro: [
      "A sudden appetite drop can happen for simple reasons like stress, mild nausea, weather changes, or recent routine shifts. But appetite is one of the most useful health signals in dogs, so a longer refusal to eat should never be ignored. Puppies, senior dogs, and dogs with chronic disease can decline faster than healthy adults.",
      "The key is context: how long your dog has refused food, whether water intake changed, and what other signs are present. If appetite loss comes with vomiting, diarrhea, pain, weakness, or behavior changes, it is more likely to need urgent care. Triage helps you sort normal short-term appetite variation from situations that need same-day veterinary evaluation.",
    ],
    commonCauses: [
      "Mild stomach upset or dietary change",
      "Dental pain, oral injury, or gum disease",
      "Stress, travel, boarding, or household change",
      "Underlying infection, pain, or metabolic illness",
      "Nausea from medications or toxin exposure",
    ],
    emergencyRedFlags: [
      "No eating for 24+ hours plus vomiting, diarrhea, or lethargy",
      "Pale gums, weakness, dehydration, or collapse",
      "Bloated/painful abdomen or repeated retching",
    ],
    canWaitSignals: [
      "Skipped one meal but normal energy, hydration, and bathroom habits",
      "Eating returns quickly and no other concerning signs appear",
    ],
    homeCare: [
      "Offer fresh water and a bland vet-approved option",
      "Track food intake, vomiting, stool, and energy every few hours",
      "Avoid table scraps or frequent food switching",
      "Use triage to check if your dog's full symptom picture needs urgent care",
    ],
    relatedSlugs: ["dog-lethargic", "dog-vomiting-blood", "dog-diarrhea-blood"],
    faq: [
      {
        question: "How long can a dog safely go without food?",
        answer: "It varies, but 24 hours without eating is a practical threshold for veterinary guidance in most dogs.",
      },
      {
        question: "Should I force-feed my dog?",
        answer: "No. Force-feeding can worsen stress or aspiration risk. Get professional guidance first.",
      },
    ],
  },
  {
    slug: "dog-limping",
    h1: "My Dog Is Limping — ER or Wait?",
    symptomQuestion: "Dog limping",
    quickAnswer:
      "If your dog can bear some weight, a regular vet visit is often appropriate. No weight-bearing, severe pain, or visible deformity should be treated as urgent.",
    metaBrief:
      "Mild limping can often wait for routine care, but non-weight-bearing or severe pain needs urgent evaluation.",
    urgencyLevel: "yellow",
    urgencyLabel: "Often same-day or next-day vet care",
    symptomParam: "limping",
    intro: [
      "Limping is one of the most common reasons dog owners seek urgent advice. It can come from a paw injury, strained muscle, torn nail, soft-tissue sprain, joint flare, or more serious fracture or ligament injury. The fastest way to sort urgency is to observe weight-bearing, pain level, and whether swelling or deformity is present.",
      "If your dog refuses to use the limb, cries when touched, or appears unstable, treat it as urgent. If limping is mild and your dog remains comfortable, eating, and alert, a regular vet visit is often safe. Triage helps combine mobility signs with your dog's overall condition so you can avoid both delayed care and unnecessary ER trips.",
    ],
    commonCauses: [
      "Paw pad injury, thorn, or torn nail",
      "Sprain/strain after play or jumping",
      "Arthritis flare, especially in older dogs",
      "Ligament injury or fracture",
      "Hip, knee, or spinal discomfort",
    ],
    emergencyRedFlags: [
      "No weight-bearing or sudden severe pain",
      "Visible deformity, major swelling, or open wound",
      "Limping with lethargy, fever, or breathing distress",
    ],
    canWaitSignals: [
      "Mild limp, still bearing weight, and comfortable at rest",
      "No significant swelling or worsening over short observation period",
    ],
    homeCare: [
      "Restrict activity and leash-walk only until veterinary guidance",
      "Check paw pads and nails gently for visible injury",
      "Use cool compress briefly if swelling is mild",
      "Do not give human pain medication",
    ],
    relatedSlugs: ["dog-lethargic", "dog-swollen-belly", "dog-shaking-trembling"],
    faq: [
      {
        question: "Can I wait a few days if limping improves?",
        answer: "If improvement is steady and your dog stays comfortable, routine vet follow-up may be reasonable.",
      },
      {
        question: "Should I massage the leg?",
        answer: "Avoid deep manipulation. Rest and professional assessment are safer for unknown injuries.",
      },
    ],
  },
  {
    slug: "dog-diarrhea-blood",
    h1: "My Dog Has Bloody Diarrhea — Is This an Emergency?",
    symptomQuestion: "Dog bloody diarrhea",
    quickAnswer:
      "Bloody diarrhea with vomiting, lethargy, or pale gums can be an emergency. Small streaks of blood with normal behavior may still need a vet visit within 24 hours.",
    metaBrief:
      "Bloody diarrhea ranges from mild irritation to emergency illness, depending on hydration and other symptoms.",
    urgencyLevel: "orange",
    urgencyLabel: "Urgent with systemic symptoms",
    symptomParam: "bloody diarrhea",
    intro: [
      "Blood in stool is alarming and can come from irritation in the lower intestine, infections, parasites, dietary indiscretion, stress colitis, toxin exposure, or more serious disease. Bright red blood often points to lower GI irritation, while dark stool can suggest bleeding higher in the tract. The amount of blood does not always predict severity.",
      "Your dog's overall condition matters most. If bloody diarrhea appears with repeated vomiting, weakness, pale gums, dehydration, or refusal to drink, urgent care is needed. If your dog is otherwise bright and hydrated, same-day or next-day vet care may be appropriate. Triage helps you quickly decide where your dog falls on that urgency spectrum.",
    ],
    commonCauses: [
      "Dietary upset, abrupt food changes, or garbage ingestion",
      "Parasites, bacterial overgrowth, or viral illness",
      "Stress colitis or inflammatory GI flare",
      "Toxin ingestion or medication-related GI irritation",
      "More serious intestinal disease requiring diagnostics",
    ],
    emergencyRedFlags: [
      "Bloody diarrhea plus vomiting or inability to keep water down",
      "Pale gums, weakness, rapid breathing, or collapse",
      "Large blood volume, black stool, or severe abdominal pain",
    ],
    canWaitSignals: [
      "Small blood streaks with normal energy and hydration",
      "Single episode and quick return to normal stool/behavior",
    ],
    homeCare: [
      "Offer water frequently in small amounts",
      "Track stool frequency, color, and associated symptoms",
      "Avoid new treats, fatty foods, and human medications",
      "Use triage to determine if your dog's signs have crossed into urgent territory",
    ],
    relatedSlugs: ["dog-vomiting-blood", "dog-not-eating", "dog-lethargic"],
    faq: [
      {
        question: "Can stress cause bloody diarrhea in dogs?",
        answer: "Yes, stress colitis can cause blood and mucus, but serious causes must still be ruled out.",
      },
      {
        question: "Is a small amount of blood still concerning?",
        answer: "Yes. Even small amounts need context-based triage and often prompt vet follow-up.",
      },
    ],
  },
  {
    slug: "dog-breathing-heavy",
    h1: "My Dog Is Breathing Hard — Should I Go to the Vet?",
    symptomQuestion: "Dog breathing heavy",
    quickAnswer:
      "Labored breathing, blue/purple gums, or open-mouth breathing at rest is an emergency. Panting after exercise or heat can be normal if it resolves quickly.",
    metaBrief:
      "Heavy breathing can be normal after exertion, but labored breathing at rest is often an emergency.",
    urgencyLevel: "orange",
    urgencyLabel: "Emergency if breathing effort is high",
    symptomParam: "breathing hard",
    intro: [
      "Breathing changes are one of the most important warning signs in dogs. Panting from heat, excitement, or exercise can be normal, but visible effort at rest is different. If your dog is using belly muscles to breathe, extending their neck, or cannot settle, treat this as potentially urgent while you assess other signs.",
      "Color and behavior matter. Blue, gray, or very pale gums, collapse, severe anxiety, or inability to lie down comfortably can signal dangerous oxygen problems. Because respiratory issues can worsen quickly, use triage immediately and prepare for urgent transport if red flags appear.",
    ],
    commonCauses: [
      "Heat and exertion with delayed cool-down",
      "Pain, stress, or fever",
      "Airway inflammation, infection, or heart/lung disease",
      "Allergic reactions or toxin exposure",
      "Brachycephalic airway strain in short-nosed breeds",
    ],
    emergencyRedFlags: [
      "Open-mouth breathing at rest or obvious respiratory effort",
      "Blue/purple gums, collapse, or confusion",
      "Breathing distress with persistent coughing or weakness",
    ],
    canWaitSignals: [
      "Panting after exercise that resolves with rest and cooling",
      "Normal gum color and behavior once calm",
    ],
    homeCare: [
      "Move to a cool, quiet, well-ventilated area",
      "Limit activity and reduce stress",
      "Observe gum color and breathing rate at rest",
      "Use triage immediately if breathing does not normalize quickly",
    ],
    relatedSlugs: ["dog-coughing", "dog-lethargic", "dog-hit-by-car"],
    faq: [
      {
        question: "How do I know if breathing is labored?",
        answer: "Look for strong belly effort, flared nostrils, neck extension, or inability to rest comfortably.",
      },
      {
        question: "Should I wait overnight?",
        answer: "Not if breathing remains difficult at rest. Respiratory distress should be evaluated urgently.",
      },
    ],
  },
  {
    slug: "dog-shaking-trembling",
    h1: "My Dog Is Shaking and Trembling — What Does It Mean?",
    symptomQuestion: "Dog shaking and trembling",
    quickAnswer:
      "Shaking can be caused by cold, fear, pain, nausea, or toxins. If it comes with vomiting, seizures, weakness, or trouble walking, treat as urgent.",
    metaBrief:
      "Shaking ranges from mild stress to emergency toxin or neurologic events depending on companion symptoms.",
    urgencyLevel: "yellow",
    urgencyLabel: "Context determines urgency",
    symptomParam: "shaking trembling",
    intro: [
      "Shaking is a broad symptom and can have both mild and serious causes. Dogs may tremble when cold, anxious, or excited, but they can also shake from pain, nausea, metabolic disease, toxin exposure, or neurologic issues. The safest approach is to assess the whole picture instead of the shaking alone.",
      "Focus on what else is happening: appetite, walking ability, breathing, gum color, and whether episodes are getting worse. If shaking appears with vomiting, disorientation, collapse, or seizure activity, urgent care is warranted. Triage helps separate common stress-related tremors from symptoms that need immediate veterinary attention.",
    ],
    commonCauses: [
      "Cold exposure or anxiety/fear response",
      "Pain from injury, GI upset, or musculoskeletal strain",
      "Nausea, toxin ingestion, or medication reaction",
      "Neurologic or metabolic disorders",
      "Age-related tremor syndromes in some dogs",
    ],
    emergencyRedFlags: [
      "Shaking with seizure, collapse, or inability to stand",
      "Persistent vomiting, severe lethargy, or breathing difficulty",
      "Known toxin exposure with worsening neurologic signs",
    ],
    canWaitSignals: [
      "Brief trembling after stress with full return to normal",
      "Normal appetite, gait, and behavior after observation",
    ],
    homeCare: [
      "Keep your dog warm, calm, and in a quiet environment",
      "Remove possible toxin access and note recent exposures",
      "Record episode length and associated symptoms for your vet",
      "Run triage if signs persist beyond a short period",
    ],
    relatedSlugs: ["dog-seizure", "dog-ate-something-toxic", "dog-lethargic"],
    faq: [
      {
        question: "Can anxiety alone cause shaking?",
        answer: "Yes, but repeated or severe episodes still need evaluation to rule out medical causes.",
      },
      {
        question: "What if shaking stops before I reach the vet?",
        answer: "You should still document and discuss it, especially if episodes recur or worsen.",
      },
    ],
  },
  {
    slug: "dog-ate-something-toxic",
    h1: "My Dog Ate Something They Shouldn't Have — What Do I Do?",
    symptomQuestion: "Dog ate something toxic",
    quickAnswer:
      "Call ASPCA Poison Control (888-426-4435) or run triage immediately. Time is critical with toxin ingestion.",
    metaBrief:
      "Toxin exposures can escalate quickly, and immediate guidance improves outcomes.",
    urgencyLevel: "red",
    urgencyLabel: "Time-sensitive emergency risk",
    symptomParam: "ate something toxic",
    intro: [
      "When a dog eats something toxic, fast action is often the difference between simple treatment and life-threatening complications. Many common items in homes are risky, including human medications, xylitol gum, rodenticides, grapes/raisins, cannabis products, cleaning agents, and some plants. Symptoms may start mild and worsen over hours.",
      "Do not wait for severe signs. Contact poison support and your veterinarian right away with product details and estimated amount. Never induce vomiting unless a professional instructs you, because some substances can cause more injury coming back up. Use triage now to decide if emergency transport is needed immediately.",
    ],
    commonCauses: [
      "Human foods (xylitol products, grapes/raisins, onions, chocolate)",
      "Human medications and supplements",
      "Rodenticides, cleaners, and household chemicals",
      "Cannabis and nicotine products",
      "Toxic plants and lawn/garden products",
    ],
    emergencyRedFlags: [
      "Seizure, collapse, severe tremors, or breathing difficulty",
      "Persistent vomiting/diarrhea or altered mental status",
      "Known ingestion of high-risk toxins (xylitol, rodenticide, meds)",
    ],
    canWaitSignals: [
      "Only if poison experts advise home monitoring after risk review",
      "No symptoms plus low-risk exposure confirmed by professional guidance",
    ],
    homeCare: [
      "Remove remaining toxin source from your dog's reach",
      "Keep packaging/photo for exact ingredient and dose details",
      "Call poison control and your vet immediately",
      "Use triage while preparing for transport if advised",
    ],
    relatedSlugs: ["dog-ate-chocolate", "dog-shaking-trembling", "dog-seizure"],
    faq: [
      {
        question: "Should I make my dog vomit right away?",
        answer: "Not unless a veterinary professional tells you to. Some substances make induced vomiting dangerous.",
      },
      {
        question: "What number should I call first?",
        answer: "ASPCA Animal Poison Control: 888-426-4435, plus your local veterinarian.",
      },
    ],
  },
  {
    slug: "dog-swollen-belly",
    h1: "My Dog's Stomach Is Swollen and Hard — Is This Bloat?",
    symptomQuestion: "Dog swollen hard belly",
    quickAnswer:
      "It can be. Swollen hard belly plus retching without vomiting and restlessness can indicate GDV (bloat), a life-threatening emergency. Go now.",
    metaBrief:
      "A hard swollen belly with unproductive retching is an ER emergency due to possible GDV.",
    urgencyLevel: "red",
    urgencyLabel: "Emergency now risk",
    symptomParam: "swollen hard belly",
    intro: [
      "A suddenly swollen, tight abdomen is a high-risk sign in dogs, especially deep-chested breeds. One of the most dangerous causes is GDV (gastric dilatation-volvulus), where the stomach fills with gas and can twist. This can rapidly impair blood flow and become fatal without immediate treatment.",
      "Classic warning signs include pacing, distress, repeated retching without producing vomit, drooling, and a hard enlarged belly. Even if symptoms seem to fluctuate, do not wait at home. Immediate emergency veterinary care is the safest path whenever bloat is suspected.",
    ],
    commonCauses: [
      "Gastric dilatation-volvulus (GDV/bloat)",
      "Gas accumulation and severe GI distention",
      "Fluid buildup, bleeding, or organ enlargement",
      "Intestinal obstruction and severe GI disease",
    ],
    emergencyRedFlags: [
      "Retching without vomit plus distended hard abdomen",
      "Restlessness, drooling, weakness, or collapse",
      "Rapid breathing, pale gums, or shock signs",
    ],
    canWaitSignals: [
      "There are very few safe wait scenarios with a hard swollen belly",
      "If swelling is clearly mild and transient, still seek same-day veterinary advice",
    ],
    homeCare: [
      "Do not give food, water boluses, or human medications",
      "Keep your dog as calm and still as possible",
      "Leave immediately for emergency veterinary care",
      "Use triage while in transit if needed for guidance",
    ],
    relatedSlugs: ["dog-cant-pee", "dog-vomiting-blood", "dog-hit-by-car"],
    faq: [
      {
        question: "Can bloat resolve on its own?",
        answer: "True GDV is an emergency and does not safely resolve without immediate veterinary intervention.",
      },
      {
        question: "Which dogs are at higher risk?",
        answer: "Large, deep-chested breeds are generally at higher risk, but any dog can be affected.",
      },
    ],
  },
  {
    slug: "dog-seizure",
    h1: "My Dog Just Had a Seizure — What Should I Do?",
    symptomQuestion: "Dog seizure what to do",
    quickAnswer:
      "A single seizure under 2 minutes that resolves may need vet follow-up within 24 hours. Multiple seizures, 5+ minute seizures, or poor recovery are emergencies.",
    metaBrief:
      "Seizure timing and recovery determine urgency; prolonged or repeated seizures are emergencies.",
    urgencyLevel: "orange",
    urgencyLabel: "Emergency if prolonged/repeated",
    symptomParam: "seizure",
    intro: [
      "Watching your dog seize is frightening, but your first priority is safety and timing. Move objects away, keep your dog from stairs, and avoid placing hands near the mouth. Most seizures are brief, but duration matters greatly: prolonged or repeated episodes can overheat the body and cause life-threatening complications.",
      "After the event, your dog may seem confused or temporarily unsteady. If recovery is quick and complete after one short seizure, same-day or next-day vet care is still important. If seizures cluster, last 5 minutes or longer, or your dog does not return to baseline, seek emergency care immediately.",
    ],
    commonCauses: [
      "Idiopathic epilepsy",
      "Toxin exposure or medication reaction",
      "Metabolic disease (e.g., low blood sugar, liver disease)",
      "Inflammatory, infectious, or structural brain disease",
    ],
    emergencyRedFlags: [
      "Seizure lasting 5 minutes or longer",
      "Two or more seizures close together",
      "Persistent disorientation, collapse, or breathing issues after seizure",
    ],
    canWaitSignals: [
      "Single brief seizure (<2 minutes) with full recovery",
      "No additional neurologic or systemic warning signs",
    ],
    homeCare: [
      "Time the seizure and record video if safe",
      "Keep lights/noise low during recovery period",
      "Offer water only when fully alert and coordinated",
      "Use triage to decide urgency based on event pattern",
    ],
    relatedSlugs: ["dog-shaking-trembling", "dog-ate-something-toxic", "dog-lethargic"],
    faq: [
      {
        question: "Should I hold my dog's tongue during a seizure?",
        answer: "No. Keep hands away from the mouth and focus on preventing injury around the dog.",
      },
      {
        question: "Can one seizure still be serious?",
        answer: "Yes. Even one seizure should be discussed with your veterinarian promptly.",
      },
    ],
  },
  {
    slug: "dog-eye-swollen",
    h1: "My Dog's Eye Is Swollen or Red — Do I Need the Vet?",
    symptomQuestion: "Dog eye swollen or red",
    quickAnswer:
      "Swelling, squinting, discharge, or visible injury usually needs a vet within 24 hours. Sudden bulging or eye protrusion is an emergency.",
    metaBrief:
      "Most swollen or painful eye issues need prompt vet care to protect vision.",
    urgencyLevel: "yellow",
    urgencyLabel: "Prompt care protects vision",
    symptomParam: "eye swollen red",
    intro: [
      "Eye problems can worsen quickly and may become painful before obvious structural changes appear. A red or swollen eye can result from allergy, irritation, scratch, foreign material, eyelid issues, infection, glaucoma, or trauma. Because vision can be affected, even seemingly small eye changes deserve prompt attention.",
      "If your dog is squinting, pawing at the face, producing thick discharge, or keeping the eye closed, avoid delay. Sudden bulging, severe trauma, or an eye that appears pushed forward is an emergency. Triage helps you decide whether to seek urgent care now or same-day outpatient evaluation.",
    ],
    commonCauses: [
      "Corneal scratch or foreign material in the eye",
      "Conjunctivitis, allergy, or irritation",
      "Eyelid/eyelash abnormalities causing chronic irritation",
      "Glaucoma or pressure-related eye disease",
      "Blunt trauma to the face or eye",
    ],
    emergencyRedFlags: [
      "Sudden eye bulging, severe trauma, or obvious globe displacement",
      "Severe pain, persistent closed eye, or neurologic changes",
      "Rapidly worsening swelling with lethargy or fever",
    ],
    canWaitSignals: [
      "Mild redness without pain and normal behavior while arranging prompt vet care",
      "No vision changes and no progression over short observation window",
    ],
    homeCare: [
      "Prevent rubbing by using a cone if available",
      "Do not use human eye drops unless your vet approves",
      "Gently clean discharge around eye with saline and gauze only",
      "Use triage and seek prompt care if signs persist",
    ],
    relatedSlugs: ["dog-lethargic", "dog-hit-by-car", "dog-shaking-trembling"],
    faq: [
      {
        question: "Can an eye scratch heal on its own?",
        answer: "Some minor injuries do, but untreated corneal damage can worsen quickly and threaten vision.",
      },
      {
        question: "Is eye redness ever normal?",
        answer: "Brief mild irritation can occur, but persistent redness or pain should be checked by a vet.",
      },
    ],
  },
  {
    slug: "dog-cant-pee",
    h1: "My Dog Is Straining to Urinate — Is This Serious?",
    symptomQuestion: "Dog straining to urinate",
    quickAnswer:
      "Yes, it can be serious. Straining with little or no urine for 12+ hours is urgent, especially in male dogs where blockage can become life-threatening.",
    metaBrief:
      "Urinary straining with little output can signal dangerous blockage and needs urgent evaluation.",
    urgencyLevel: "orange",
    urgencyLabel: "Urgent, especially in males",
    symptomParam: "cant pee straining",
    intro: [
      "Urination problems can progress quickly from discomfort to life-threatening emergency. Dogs that repeatedly posture to urinate but produce only drips, or no urine at all, may have bladder inflammation, stones, urethral obstruction, or severe urinary tract disease. Male dogs are at especially high risk of complete blockage.",
      "A blocked urinary tract can cause toxin buildup, severe pain, electrolyte imbalance, and collapse. If your dog is straining repeatedly without output, do not wait overnight. Triage can help guide urgency, but persistent no-urine episodes should be treated as urgent veterinary situations.",
    ],
    commonCauses: [
      "Urinary tract infection or inflammation",
      "Bladder stones or urethral obstruction",
      "Prostate disease (in male dogs)",
      "Urinary tract trauma or neurologic dysfunction",
    ],
    emergencyRedFlags: [
      "Repeated straining with no urine output",
      "Painful abdomen, vocalizing, or restlessness",
      "Vomiting, lethargy, or weakness with urinary signs",
    ],
    canWaitSignals: [
      "Mild increase in frequency but still passing normal urine may allow same-day vet care",
      "No pain signs while arranging prompt evaluation",
    ],
    homeCare: [
      "Track timing and amount of urine attempts",
      "Provide access to fresh water",
      "Do not give pain meds or antibiotics without veterinary guidance",
      "Use triage immediately and seek urgent care if output remains low",
    ],
    relatedSlugs: ["dog-lethargic", "dog-swollen-belly", "dog-diarrhea-blood"],
    faq: [
      {
        question: "How long is too long without urinating?",
        answer: "If your dog is straining and not producing urine, urgent care is recommended right away.",
      },
      {
        question: "Can this wait until morning?",
        answer: "Not safely if no urine is being passed. Blockage can become life-threatening quickly.",
      },
    ],
  },
  {
    slug: "dog-coughing",
    h1: "My Dog Won't Stop Coughing — When Is It an Emergency?",
    symptomQuestion: "Dog coughing emergency",
    quickAnswer:
      "Occasional cough is often not urgent. Persistent coughing with breathing distress, blue gums, collapse, or extreme fatigue is an emergency.",
    metaBrief:
      "Coughing urgency depends on breathing effort, gum color, and overall condition.",
    urgencyLevel: "yellow",
    urgencyLabel: "Monitor vs emergency based on breathing",
    symptomParam: "coughing",
    intro: [
      "Coughing can sound dramatic yet come from very different causes, from mild kennel cough to airway disease, heart conditions, aspiration, or pneumonia. The biggest urgency clue is not just how often your dog coughs, but how your dog breathes between coughing episodes and whether normal activity remains possible.",
      "If coughing is mild and your dog otherwise acts normal, same-day to next-day care is often reasonable. But coughing with labored breathing, weak collapse episodes, blue gums, or inability to rest comfortably should be treated as an emergency. Triage helps you quickly assess where your dog falls.",
    ],
    commonCauses: [
      "Upper airway irritation or infectious tracheobronchitis",
      "Allergic/inflammatory airway disease",
      "Heart-related pulmonary congestion",
      "Aspiration or lower respiratory infection",
      "Tracheal collapse in predisposed breeds",
    ],
    emergencyRedFlags: [
      "Breathing distress between coughing episodes",
      "Blue/gray gums, collapse, or severe weakness",
      "Coughing blood or rapidly worsening signs",
    ],
    canWaitSignals: [
      "Intermittent mild cough with normal energy and breathing",
      "No fever, appetite loss, or respiratory effort increase",
    ],
    homeCare: [
      "Use a harness instead of neck pressure from a collar",
      "Limit intense exercise until evaluated",
      "Keep indoor air humidified and avoid smoke exposure",
      "Use triage if cough persists or breathing changes",
    ],
    relatedSlugs: ["dog-breathing-heavy", "dog-lethargic", "dog-not-eating"],
    faq: [
      {
        question: "Is kennel cough always mild?",
        answer: "Often mild, but some dogs can develop complications and need prompt veterinary care.",
      },
      {
        question: "Can I give human cough medicine?",
        answer: "No. Many human medications are unsafe for dogs unless prescribed by a veterinarian.",
      },
    ],
  },
  {
    slug: "dog-lethargic",
    h1: "My Dog Is Suddenly Lethargic and Won't Move — Should I Worry?",
    symptomQuestion: "Dog suddenly lethargic",
    quickAnswer:
      "Sudden lethargy with pale gums, cold extremities, breathing issues, or inability to stand is an emergency. Mild sluggishness for one day can sometimes be monitored closely.",
    metaBrief:
      "Sudden lethargy can signal serious illness, especially with gum color, breathing, or mobility changes.",
    urgencyLevel: "orange",
    urgencyLabel: "Urgent if sudden and severe",
    symptomParam: "lethargic wont move",
    intro: [
      "Lethargy is not a diagnosis, but it is a major warning signal that your dog's body may be under stress. Dogs become lethargic with pain, fever, dehydration, infection, blood loss, toxin exposure, metabolic disease, or heart and respiratory problems. Sudden onset is generally more concerning than a mild gradual slowdown.",
      "Check simple markers right away: gum color, breathing effort, response to your voice, and ability to stand or walk. If your dog appears weak, unresponsive, or distressed, seek urgent care now. If signs are mild and your dog still drinks and responds normally, close monitoring with triage can help guide next steps.",
    ],
    commonCauses: [
      "Pain, fever, or systemic infection",
      "Dehydration or gastrointestinal illness",
      "Metabolic disorders (low blood sugar, endocrine disease)",
      "Toxin exposure or medication effects",
      "Cardiac, respiratory, or internal bleeding conditions",
    ],
    emergencyRedFlags: [
      "Pale gums, collapse, or inability to stand",
      "Breathing hard, cold extremities, or confusion",
      "Lethargy with vomiting blood, bloody diarrhea, or seizures",
    ],
    canWaitSignals: [
      "Mild temporary low energy with normal appetite and hydration",
      "No worsening signs over short observation period",
    ],
    homeCare: [
      "Encourage hydration and quiet rest in a comfortable area",
      "Track temperature, appetite, urination, and stool changes",
      "Avoid strenuous activity and unfamiliar foods",
      "Use triage promptly if lethargy persists or worsens",
    ],
    relatedSlugs: ["dog-not-eating", "dog-diarrhea-blood", "dog-breathing-heavy"],
    faq: [
      {
        question: "How long should I monitor lethargy at home?",
        answer: "Only briefly if signs are mild. Sudden severe lethargy should be assessed urgently.",
      },
      {
        question: "Can weather changes cause lethargy?",
        answer: "Sometimes, but persistent or severe lethargy should never be dismissed as weather alone.",
      },
    ],
  },
  {
    slug: "dog-hit-by-car",
    h1: "My Dog Was Hit by a Car — What Do I Do Right Now?",
    symptomQuestion: "Dog hit by car what to do",
    quickAnswer:
      "Go to the ER immediately, even if your dog seems okay. Internal injuries may not be visible. Keep your dog still and warm during transport.",
    metaBrief:
      "Any vehicle impact is an emergency because internal injuries can be hidden at first.",
    urgencyLevel: "red",
    urgencyLabel: "Emergency now",
    symptomParam: "hit by car trauma",
    intro: [
      "Being hit by a car is always an emergency scenario in dogs, even when your dog can stand or walk afterward. Internal bleeding, chest trauma, lung injury, and shock can progress quickly and may not be obvious in the first minutes. What looks like a 'lucky escape' can change rapidly without warning.",
      "Your goal is rapid, calm transport and minimal movement. Keep your dog warm, avoid unnecessary handling, and head to emergency veterinary care immediately. Triage can support urgency decisions, but trauma from vehicle impact should be treated as ER-level by default.",
    ],
    commonCauses: [
      "Blunt-force trauma to chest, abdomen, spine, and limbs",
      "Internal bleeding without visible external wounds",
      "Fractures, soft tissue injury, and pain shock",
      "Lung bruising or breathing compromise",
    ],
    emergencyRedFlags: [
      "Any loss of consciousness, breathing difficulty, or collapse",
      "Pale gums, weakness, or inability to rise",
      "Visible fractures, bleeding, or severe pain",
    ],
    canWaitSignals: [
      "Vehicle-impact trauma should not be managed as wait-and-see",
      "Even if stable, immediate veterinary assessment is recommended",
    ],
    homeCare: [
      "Move your dog carefully onto a stable surface for transport",
      "Keep your dog warm and as still as possible",
      "Do not offer food/medications during emergency transport",
      "Go directly to ER and call ahead if possible",
    ],
    relatedSlugs: ["dog-breathing-heavy", "dog-lethargic", "dog-swollen-belly"],
    faq: [
      {
        question: "My dog seems normal now. Do I still need ER?",
        answer: "Yes. Internal injuries can be delayed and life-threatening despite a normal early appearance.",
      },
      {
        question: "Should I wait for my regular vet to open?",
        answer: "No. Trauma after a car strike should be evaluated in emergency care immediately.",
      },
    ],
  },
  {
    slug: "puppy-wont-stop-biting",
    h1: "My Puppy Won't Stop Biting Me — Is This Normal or a Problem?",
    symptomQuestion: "Puppy won't stop biting",
    quickAnswer:
      "Most puppy biting is normal teething and play behavior, but hard biting that escalates, breaks skin, or comes with fear, guarding, or sudden behavior change deserves veterinary or trainer guidance.",
    metaBrief:
      "Puppy biting is often normal, but intensity, context, and sudden changes determine whether you should seek help.",
    urgencyLevel: "green",
    urgencyLabel: "Usually behavior support, urgent only with injury or sudden change",
    symptomParam: "puppy biting",
    intro: [
      "Puppies explore with their mouths, especially during teething and high-energy play. That does not make the biting pleasant, but it usually means your puppy needs clearer outlets, rest, and consistent redirection rather than punishment. The pattern matters: when it happens, how hard the bites are, and whether your puppy can calm down.",
      "Biting that suddenly appears in a previously gentle puppy, happens when touched, or comes with growling over food, toys, or resting spots can point to pain, fear, or resource guarding. Track episodes and context so you can separate normal puppy chaos from a behavior or health issue that needs professional help.",
    ],
    commonCauses: [
      "Teething discomfort and normal mouthy play",
      "Overtiredness, overstimulation, or too little nap structure",
      "Insufficient chew outlets or inconsistent redirection",
      "Fear, handling sensitivity, or resource guarding",
      "Pain or illness causing sudden irritability",
    ],
    emergencyRedFlags: [
      "Bites break skin repeatedly or target faces/hands with escalating force",
      "Sudden biting paired with yelping, limping, fever, or refusal to eat",
      "Guarding food, toys, or resting spaces with stiff posture and growling",
    ],
    canWaitSignals: [
      "Soft play biting during predictable high-energy times",
      "Puppy redirects to toys and settles after rest or a calmer routine",
    ],
    homeCare: [
      "Offer appropriate chews and redirect before your puppy gets frantic",
      "Add enforced naps when biting spikes late in play sessions",
      "Track triggers, time of day, bite intensity, and calming response",
      "Ask your vet or a positive-reinforcement trainer if biting escalates",
    ],
    relatedSlugs: ["dog-not-eating", "dog-lethargic", "dog-limping"],
    faq: [
      {
        question: "Will puppy biting go away on its own?",
        answer: "It often improves with maturity, but consistent redirection, sleep, and chew outlets make a major difference.",
      },
      {
        question: "Can pain make a puppy bite more?",
        answer: "Yes. Sudden irritability, handling sensitivity, or biting with other symptoms should be discussed with a veterinarian.",
      },
    ],
  },
  {
    slug: "worried-my-dad-is-going-to-let-my-cat-outside",
    h1: "My Indoor Cat Might Be Let Outside — How Dangerous Is It?",
    symptomQuestion: "Indoor cat might get outside",
    quickAnswer:
      "An indoor cat getting outside can become urgent if they are lost, injured, exposed to toxins, or unvaccinated. Prevention matters, and a quick plan helps you act fast if they slip out.",
    metaBrief:
      "Indoor cats can face injury, parasites, toxins, and getting lost if they are suddenly let outside.",
    urgencyLevel: "yellow",
    urgencyLabel: "Prevent now, escalate quickly if your cat escapes",
    symptomParam: "cat outside risk",
    intro: [
      "If your cat is normally indoors, being let outside is not a harmless change of scenery. Indoor cats may panic, hide, run into roads, fight with other animals, or be exposed to parasites and toxins they have never encountered. The risk is higher for kittens, senior cats, anxious cats, and cats without up-to-date vaccines or microchip details.",
      "The money-saving move is prevention: clear household rules, door routines, microchip registration, and a current photo. If your cat does get out, fast action in the first few hours matters. A health and safety log also helps you brief a vet if your cat returns with a wound, limp, coughing, vomiting, or behavior change.",
    ],
    commonCauses: [
      "A family member believes cats should be allowed outdoors without understanding indoor-cat risk",
      "Doors, windows, balconies, or garages left open during busy household moments",
      "Unclear pet-care rules when someone else watches the cat",
      "Curiosity, stress, or mating behavior in unspayed/unneutered cats",
    ],
    emergencyRedFlags: [
      "Cat returns limping, bleeding, breathing strangely, drooling, vomiting, or hiding in pain",
      "Possible car strike, dog attack, toxin exposure, or fight wound",
      "Cat is missing overnight, very young, senior, sick, or not vaccinated",
    ],
    canWaitSignals: [
      "Cat never got outside and you are setting prevention rules now",
      "Cat briefly stepped out but returned immediately and is acting completely normal",
    ],
    homeCare: [
      "Make a written indoor-only rule and post it near doors used by guests or family",
      "Check window screens, balcony access, and garage doors",
      "Confirm microchip registration, collar ID, vaccine status, and a recent clear photo",
      "Use FursBliss to log any symptoms if your cat returns after being outside",
    ],
    relatedSlugs: ["what-does-this-mean-for-my-cats-health-and-how-can", "dog-ate-something-toxic", "dog-limping"],
    faq: [
      {
        question: "Should an indoor cat be allowed outside sometimes?",
        answer: "Only with a controlled plan, such as a secure harness or catio. Sudden unsupervised outdoor access is much riskier.",
      },
      {
        question: "What should I do first if my cat gets out?",
        answer: "Search nearby hiding places calmly, put food and familiar scent items near the door, alert neighbors, and watch for injury when they return.",
      },
    ],
  },
  {
    slug: "advice-on-my-puppy",
    h1: "I Need Advice on My Puppy — What Signs Should I Not Ignore?",
    symptomQuestion: "Puppy advice and warning signs",
    quickAnswer:
      "Puppies can change quickly. Low energy, repeated vomiting or diarrhea, trouble breathing, not eating, pale gums, or possible toxin exposure should be treated as urgent.",
    metaBrief:
      "Puppies can decline faster than adult dogs, so warning signs deserve quicker triage.",
    urgencyLevel: "yellow",
    urgencyLabel: "Puppies need quicker escalation than adult dogs",
    symptomParam: "puppy warning signs",
    intro: [
      "New puppy questions are often messy because normal puppy behavior and early illness can look similar at first. Napping, chewing, and accidents may be normal. But puppies have less reserve than adult dogs, so dehydration, parasites, toxins, infections, and low blood sugar can become serious quickly.",
      "Instead of guessing from one behavior, look at the cluster: appetite, water intake, energy, breathing, stool, vomiting, gum color, and whether your puppy can settle. FursBliss is useful here because a simple daily log makes patterns obvious and gives your vet a clearer timeline if something changes.",
    ],
    commonCauses: [
      "Normal adjustment, teething, sleep disruption, or training confusion",
      "Diet change, parasites, or mild stomach upset",
      "Vaccine reactions, respiratory infection, or contagious puppy illness",
      "Toxin exposure, swallowed objects, or injury during play",
    ],
    emergencyRedFlags: [
      "Repeated vomiting or diarrhea, especially with low energy",
      "Not eating, weakness, shaking, pale gums, or collapse",
      "Trouble breathing, blue gums, suspected toxin, or swallowed object",
      "Very young or not fully vaccinated puppy with fever, cough, or severe lethargy",
    ],
    canWaitSignals: [
      "Puppy is eating, drinking, playful, breathing normally, and symptoms are mild",
      "A behavior issue is predictable and improves with rest, routine, or redirection",
    ],
    homeCare: [
      "Track meals, water, stool, vomiting, sleep, and energy for 24 hours",
      "Keep the puppy away from unsafe chews, plants, medications, and dropped food",
      "Call your vet sooner than you would for an adult dog if symptoms cluster",
      "Use the checker to organize symptoms before calling your vet",
    ],
    relatedSlugs: ["puppy-wont-stop-biting", "dog-not-eating", "dog-diarrhea-blood"],
    faq: [
      {
        question: "When should I call the vet for a puppy?",
        answer: "Call quickly for vomiting, diarrhea, low energy, not eating, breathing changes, toxin risk, or anything that feels sudden and unusual.",
      },
      {
        question: "Is it okay to wait overnight?",
        answer: "If a puppy has low energy, repeated GI signs, or breathing issues, do not wait overnight. Puppies can decline quickly.",
      },
    ],
  },
  {
    slug: "what-does-this-mean-for-my-cats-health-and-how-can",
    h1: "What Does This Mean for My Cat's Health — and How Can I Fix It?",
    symptomQuestion: "Cat health warning signs",
    quickAnswer:
      "A single odd behavior may be minor, but appetite changes, hiding, breathing changes, vomiting, diarrhea, limping, straining to pee, or sudden behavior shifts should be triaged promptly.",
    metaBrief:
      "Cat health clues are often subtle, so behavior, appetite, litter box, and breathing changes matter.",
    urgencyLevel: "yellow",
    urgencyLabel: "Watch patterns closely, urgent with red flags",
    symptomParam: "cat health signs",
    intro: [
      "Cats are talented at hiding discomfort, which makes vague questions like “what does this mean?” surprisingly important. Small changes in appetite, grooming, hiding, litter box habits, or breathing can be early signs of pain, urinary problems, stomach upset, stress, dental disease, or infection.",
      "The fastest way to make the question useful is to turn it into a timeline: what changed, when it started, whether eating and litter box habits changed, and whether your cat is hiding or acting painful. That turns a confusing moment into something a vet can actually use.",
    ],
    commonCauses: [
      "Stress, household change, or conflict with another pet",
      "Dental pain, nausea, parasites, or mild infection",
      "Urinary discomfort, constipation, or digestive upset",
      "Injury, arthritis, toxin exposure, or a hidden wound",
    ],
    emergencyRedFlags: [
      "Straining to pee, crying in the litter box, or no urine output",
      "Open-mouth breathing, collapse, pale/blue gums, or severe weakness",
      "Repeated vomiting, not eating, major hiding, or sudden severe pain",
      "Possible toxin exposure, fall, fight wound, or car strike",
    ],
    canWaitSignals: [
      "A mild behavior change with normal appetite, breathing, and litter box use",
      "Symptoms improve quickly and do not repeat while you monitor closely",
    ],
    homeCare: [
      "Write down appetite, water intake, litter box output, vomiting, and hiding",
      "Take photos or short videos of visible symptoms for your vet",
      "Keep food, medication, plants, and cleaners out of reach",
      "Use FursBliss to keep a concise symptom log before calling your vet",
    ],
    relatedSlugs: ["worried-my-dad-is-going-to-let-my-cat-outside", "dog-not-eating", "dog-ate-something-toxic"],
    faq: [
      {
        question: "What cat symptom is most urgent?",
        answer: "Trouble breathing and urinary blockage signs are emergencies. Repeated vomiting, collapse, and not eating are also serious.",
      },
      {
        question: "Why does my cat hide when sick?",
        answer: "Hiding is a common cat response to pain, stress, or illness, so pair it with appetite, litter box, and breathing changes.",
      },
    ],
  },
  {
    slug: "dog-kennel-cough-care",
    h1: "How Can I Help a Dog With Kennel Cough?",
    symptomQuestion: "Dog kennel cough care",
    quickAnswer:
      "Mild kennel-cough-like signs often need rest, isolation from other dogs, and veterinary guidance. Trouble breathing, fever, lethargy, or poor appetite should be checked promptly.",
    metaBrief:
      "Kennel cough can be mild, but breathing changes, fever, and low energy raise urgency.",
    urgencyLevel: "yellow",
    urgencyLabel: "Monitor closely, vet soon if worsening",
    symptomParam: "kennel cough",
    intro: [
      "Kennel cough is a common shorthand for infectious respiratory disease in dogs. It can sound dramatic: dry honking cough, gagging after excitement, or coughing after leash pressure. Many cases are mild, but some dogs develop pneumonia or more serious respiratory illness, especially puppies, seniors, and dogs with heart or airway problems.",
      "The safest approach is to reduce irritation, avoid exposing other dogs, and watch for systemic signs. If your dog is breathing harder than normal, seems weak, has a fever, or stops eating, do not treat it as a routine cough. A quick symptom log helps your vet understand timing and severity.",
    ],
    commonCauses: [
      "Exposure to infectious respiratory pathogens at boarding, daycare, grooming, or dog parks",
      "Airway irritation from pulling on a collar, smoke, dust, or dry air",
      "Underlying respiratory or heart disease that makes coughing more concerning",
    ],
    emergencyRedFlags: [
      "Labored breathing, blue/pale gums, or collapse",
      "Cough with fever, marked lethargy, or refusal to eat",
      "Puppy, senior dog, or immune-compromised dog with worsening cough",
    ],
    canWaitSignals: [
      "Occasional dry cough with normal energy, appetite, and breathing",
      "Symptoms are not worsening while you arrange routine veterinary advice",
    ],
    homeCare: [
      "Use a harness instead of collar pressure and keep activity calm",
      "Keep your dog away from other dogs until your vet clears them",
      "Avoid smoke, fragrance, and dusty rooms",
      "Track cough frequency, appetite, temperature, and breathing effort",
    ],
    relatedSlugs: ["dog-breathing-heavy", "dog-lethargic", "dog-not-eating"],
    faq: [
      {
        question: "Can kennel cough become serious?",
        answer: "Yes. Most cases are mild, but pneumonia and breathing problems can occur, especially in higher-risk dogs.",
      },
      {
        question: "Should I give cough medicine?",
        answer: "Only if your veterinarian recommends it. Human cough medicines can be unsafe for dogs.",
      },
    ],
  },
];

export const symptomPageMap = Object.fromEntries(symptomPages.map((page) => [page.slug, page])) as Record<
  string,
  SymptomPageContent
>;
