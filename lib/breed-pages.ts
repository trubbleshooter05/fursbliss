type BreedPage = {
  slug: string;
  title: string;
  description: string;
  focus: string[];
};

const curatedBreedPages: BreedPage[] = [
  {
    slug: "golden-retriever-senior",
    title: "Senior Golden Retriever Supplements",
    description:
      "Support joints, mobility, and cognitive health for senior Golden Retrievers.",
    focus: ["Omega-3s", "Glucosamine", "Antioxidants"],
  },
  {
    slug: "german-shepherd-hip-joint",
    title: "German Shepherd Hip & Joint Support",
    description:
      "Target hip, joint, and mobility issues common in German Shepherds.",
    focus: ["Glucosamine", "Chondroitin", "MSM"],
  },
  {
    slug: "poodle-skin-coat",
    title: "Poodle Skin & Coat Essentials",
    description:
      "Support coat health and reduce itching with targeted nutrition.",
    focus: ["Omega-3s", "Biotin", "Probiotics"],
  },
  {
    slug: "labrador-retriever-senior",
    title: "Senior Labrador Longevity Guide",
    description:
      "Support weight, joints, and metabolic health in senior Labrador Retrievers.",
    focus: ["Omega-3s", "Glucosamine", "Fiber + probiotics"],
  },
  {
    slug: "french-bulldog-gut-breathing",
    title: "French Bulldog Senior Health Support",
    description:
      "Gut health, inflammation support, and respiratory-friendly conditioning for French Bulldogs.",
    focus: ["Probiotics", "Omega-3s", "Weight support"],
  },
  {
    slug: "dachshund-spine-joint",
    title: "Dachshund Spine and Joint Longevity",
    description:
      "Target spinal support and mobility maintenance in aging Dachshunds.",
    focus: ["Glucosamine", "Omega-3s", "Vitamin E"],
  },
  {
    slug: "boxer-cardiac-longevity",
    title: "Boxer Cardiac and Senior Longevity Guide",
    description:
      "Track heart and mobility changes early in senior Boxers.",
    focus: ["Omega-3s", "CoQ10", "L-carnitine"],
  },
  {
    slug: "beagle-weight-longevity",
    title: "Beagle Longevity and Weight Management",
    description:
      "Maintain lean body condition and cognitive health in senior Beagles.",
    focus: ["Fiber", "Omega-3s", "Antioxidants"],
  },
  {
    slug: "yorkie-senior-support",
    title: "Yorkshire Terrier Senior Longevity Guide",
    description:
      "Small-breed specific longevity support for skin, dental, and energy changes.",
    focus: ["Omega-3s", "Probiotics", "CoQ10"],
  },
  {
    slug: "rottweiler-joint-cardiac",
    title: "Rottweiler Joint and Cardiac Longevity Support",
    description:
      "High-impact mobility and heart-health support planning for senior Rottweilers.",
    focus: ["Glucosamine", "Omega-3s", "L-carnitine"],
  },
  {
    slug: "border-collie-cognitive-aging",
    title: "Border Collie Cognitive Aging Guide",
    description:
      "Support senior cognitive health and mobility for active Border Collies.",
    focus: ["DHA", "Antioxidants", "MCT support"],
  },
  {
    slug: "cavalier-cardiac-senior",
    title: "Cavalier King Charles Cardiac Longevity Guide",
    description:
      "Monitor heart-health signals and longevity support in senior Cavaliers.",
    focus: ["Omega-3s", "CoQ10", "Taurine"],
  },
  {
    slug: "shih-tzu-skin-gut",
    title: "Shih Tzu Skin and Gut Longevity Guide",
    description:
      "Manage chronic skin and GI sensitivities in aging Shih Tzus.",
    focus: ["Probiotics", "Omega-3s", "Digestive enzymes"],
  },
  {
    slug: "great-dane-longevity-support",
    title: "Great Dane Longevity and Mobility Guide",
    description:
      "Large-breed longevity strategy for joint, cardiac, and GI considerations.",
    focus: ["Glucosamine", "Omega-3s", "Probiotics"],
  },
  {
    slug: "mixed-breed-senior-longevity",
    title: "Mixed Breed Senior Longevity Guide",
    description:
      "Evidence-based senior support plan for mixed-breed dogs with personalized tracking.",
    focus: ["Omega-3s", "Probiotics", "Joint support"],
  },
];

const scalableBreedNames = [
  "Australian Shepherd",
  "Siberian Husky",
  "Pembroke Welsh Corgi",
  "Chihuahua",
  "Doberman Pinscher",
  "Bernese Mountain Dog",
  "Maltese",
  "Pomeranian",
  "Bichon Frise",
  "Boston Terrier",
  "Havanese",
  "Shetland Sheepdog",
  "English Springer Spaniel",
  "Brittany",
  "Miniature Schnauzer",
  "Cocker Spaniel",
  "Shiba Inu",
  "Saint Bernard",
  "Bullmastiff",
  "West Highland White Terrier",
  "Akita",
  "Newfoundland",
  "Weimaraner",
  "Vizsla",
  "Rhodesian Ridgeback",
  "Bloodhound",
  "Basenji",
  "Belgian Malinois",
  "Belgian Tervuren",
  "Belgian Sheepdog",
  "Collie",
  "Old English Sheepdog",
  "Australian Cattle Dog",
  "Miniature American Shepherd",
  "Papillon",
  "Pug",
  "Whippet",
  "Italian Greyhound",
  "Greyhound",
  "Great Pyrenees",
  "Samoyed",
  "Alaskan Malamute",
  "Dalmatian",
  "Airedale Terrier",
  "Scottish Terrier",
  "Cairn Terrier",
  "Norwich Terrier",
  "Norfolk Terrier",
  "Parson Russell Terrier",
  "Jack Russell Terrier",
  "American Staffordshire Terrier",
  "Staffordshire Bull Terrier",
  "Bull Terrier",
  "American Bulldog",
  "English Bulldog",
  "French Spaniel",
  "Irish Setter",
  "English Setter",
  "Gordon Setter",
  "Pointer",
  "German Shorthaired Pointer",
  "German Wirehaired Pointer",
  "Wirehaired Pointing Griffon",
  "Portuguese Water Dog",
  "Lagotto Romagnolo",
  "Soft Coated Wheaten Terrier",
  "Keeshond",
  "Chinese Shar-Pei",
  "Lhasa Apso",
  "Pekingese",
  "Basset Hound",
  "Treeing Walker Coonhound",
  "Bluetick Coonhound",
  "Redbone Coonhound",
  "Black and Tan Coonhound",
  "Afghan Hound",
  "Borzoi",
  "Saluki",
  "Irish Wolfhound",
  "Leonberger",
  "Kuvasz",
  "Anatolian Shepherd Dog",
  "Cane Corso",
  "Mastiff",
  "Miniature Pinscher",
  "Toy Poodle",
  "Standard Poodle",
  "Miniature Poodle",
  "Cockapoo",
  "Labradoodle",
  "Goldendoodle",
  "Schnoodle",
  "Bernedoodle",
  "Cavapoo",
  "Pomsky",
  "Aussiedoodle",
  "Morkie",
  "Shorkie",
  "Puggle",
  "Chiweenie",
  "Boxador",
  "Sheprador",
  "Yorkipoo",
  "Maltipoo",
  "Huskydoodle",
];

const curatedBreedNames = [
  "Golden Retriever",
  "German Shepherd",
  "Poodle",
  "Labrador Retriever",
  "French Bulldog",
  "Dachshund",
  "Boxer",
  "Beagle",
  "Yorkshire Terrier",
  "Rottweiler",
  "Border Collie",
  "Cavalier King Charles Spaniel",
  "Shih Tzu",
  "Great Dane",
  "Mixed Breed",
];

const focusTemplates: string[][] = [
  ["Omega-3s", "Glucosamine", "Antioxidants"],
  ["Probiotics", "Fiber", "Digestive enzymes"],
  ["DHA", "MCT support", "Antioxidants"],
  ["CoQ10", "L-carnitine", "Omega-3s"],
  ["Vitamin E", "Joint support", "Probiotics"],
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const curatedSlugs = new Set(curatedBreedPages.map((page) => page.slug));

const generatedBreedPages: BreedPage[] = scalableBreedNames
  .map((breedName, index) => {
    const slug = `${slugify(breedName)}-senior-longevity`;
    return {
      slug,
      title: `${breedName} Senior Longevity Guide`,
      description: `Evidence-informed longevity planning for senior ${breedName} dogs, including mobility, gut, metabolic, and cognitive tracking guidance.`,
      focus: focusTemplates[index % focusTemplates.length],
    };
  })
  .filter((page) => !curatedSlugs.has(page.slug));

export const breedPages: BreedPage[] = [...curatedBreedPages, ...generatedBreedPages];

export const quizBreedOptions = Array.from(
  new Set([...curatedBreedNames, ...scalableBreedNames])
).sort((a, b) => a.localeCompare(b));
