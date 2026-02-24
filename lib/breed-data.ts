export type LifeExpectancyRange = {
  low: number;
  mid: number;
  high: number;
};

export type BreedEntry = {
  name: string;
  size: "small" | "medium" | "large" | "giant";
};

const SMALL_RANGE = { low: 12, mid: 14, high: 16 } as const;
const MEDIUM_RANGE = { low: 10, mid: 12, high: 14 } as const;
const LARGE_RANGE = { low: 8, mid: 10, high: 12 } as const;
const GIANT_RANGE = { low: 6, mid: 8, high: 10 } as const;

function toRange(low: number, high: number): LifeExpectancyRange {
  return {
    low,
    high,
    mid: Number(((low + high) / 2).toFixed(1)),
  };
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const OVERRIDES: Record<string, LifeExpectancyRange> = {
  [normalize("Golden Retriever")]: toRange(10, 12),
  [normalize("Chihuahua")]: toRange(14, 16),
  [normalize("Great Dane")]: toRange(7, 10),
  [normalize("Bernese Mountain Dog")]: toRange(7, 10),
  [normalize("Australian Cattle Dog")]: toRange(12, 16),
  [normalize("Labrador Retriever")]: toRange(10, 12),
  [normalize("Labrador")]: toRange(10, 12),
  [normalize("Poodle")]: toRange(12, 15),
  [normalize("German Shepherd")]: toRange(9, 13),
  [normalize("Bulldog")]: toRange(8, 10),
  [normalize("Beagle")]: toRange(10, 15),
  [normalize("Boxer")]: toRange(10, 12),
  [normalize("Rottweiler")]: toRange(8, 10),
  [normalize("Dachshund")]: toRange(12, 16),
  [normalize("Shih Tzu")]: toRange(10, 18),
  [normalize("Siberian Husky")]: toRange(12, 14),
  [normalize("Husky")]: toRange(12, 14),
  [normalize("Pomeranian")]: toRange(12, 16),
  [normalize("French Bulldog")]: toRange(10, 12),
  [normalize("Border Collie")]: toRange(12, 15),
  [normalize("Cocker Spaniel")]: toRange(10, 14),
  [normalize("Cavalier King Charles Spaniel")]: toRange(9, 14),
  [normalize("Maltese")]: toRange(12, 15),
  [normalize("Yorkshire Terrier")]: toRange(11, 15),
  [normalize("Doberman Pinscher")]: toRange(10, 12),
  [normalize("Doberman")]: toRange(10, 12),
  [normalize("Mastiff")]: toRange(6, 10),
  [normalize("Saint Bernard")]: toRange(8, 10),
  [normalize("Newfoundland")]: toRange(8, 10),
  [normalize("Irish Wolfhound")]: toRange(6, 8),
};

const SMALL_BREEDS = [
  "Affenpinscher",
  "American Eskimo Dog (Miniature)",
  "American Eskimo Dog (Toy)",
  "Australian Terrier",
  "Biewer Terrier",
  "Bichon Frise",
  "Bolognese",
  "Border Terrier",
  "Boston Terrier",
  "Brussels Griffon",
  "Cairn Terrier",
  "Cavalier King Charles Spaniel",
  "Chinese Crested",
  "Chihuahua",
  "Coton de Tulear",
  "Dachshund",
  "Dandie Dinmont Terrier",
  "English Toy Spaniel",
  "Havanese",
  "Italian Greyhound",
  "Japanese Chin",
  "Lakeland Terrier",
  "Lhasa Apso",
  "Lowchen",
  "Maltese",
  "Manchester Terrier (Toy)",
  "Miniature Pinscher",
  "Miniature Schnauzer",
  "Norfolk Terrier",
  "Norwich Terrier",
  "Papillon",
  "Parson Russell Terrier",
  "Pekingese",
  "Pomeranian",
  "Poodle (Toy)",
  "Poodle (Miniature)",
  "Pug",
  "Rat Terrier",
  "Schipperke",
  "Scottish Terrier",
  "Sealyham Terrier",
  "Shih Tzu",
  "Silky Terrier",
  "Skye Terrier",
  "Toy Fox Terrier",
  "West Highland White Terrier",
  "Wire Fox Terrier",
  "Yorkshire Terrier",
  "Miniature American Shepherd",
  "Morkie",
  "Shorkie",
  "Maltipoo",
  "Yorkipoo",
  "Pomsky",
  "Puggle",
  "Cavapoo",
  "Cockapoo (Small)",
  "Aussiedoodle (Mini)",
  "Alaskan Klee Kai",
  "Biewer Yorkshire Terrier",
  "Bohemian Terrier",
  "Cesky Terrier",
  "English Cocker",
  "Japanese Spitz",
  "Lancashire Heeler",
  "Miniature Dachshund",
  "Miniature Poodle",
  "Miniature Sheepadoodle",
  "Miniature Goldendoodle",
  "Norwich Doodle",
  "Russian Toy",
  "Toy Poodle",
  "Toy Maltipoo",
  "Mixed Breed (Small)",
];

const MEDIUM_BREEDS = [
  "American Eskimo Dog (Standard)",
  "American Hairless Terrier",
  "American Staffordshire Terrier",
  "Australian Cattle Dog",
  "Australian Shepherd",
  "Basenji",
  "Basset Hound",
  "Beagle",
  "Bedlington Terrier",
  "Belgian Laekenois",
  "Brittany",
  "Bulldog",
  "Bull Terrier",
  "Cardigan Welsh Corgi",
  "Cocker Spaniel",
  "Collie",
  "Dalmatian",
  "English Cocker Spaniel",
  "English Springer Spaniel",
  "Finnish Spitz",
  "French Bulldog",
  "German Pinscher",
  "Harrier",
  "Icelandic Sheepdog",
  "Irish Terrier",
  "Keeshond",
  "Kerry Blue Terrier",
  "Lagotto Romagnolo",
  "Miniature Bull Terrier",
  "Nova Scotia Duck Tolling Retriever",
  "Pembroke Welsh Corgi",
  "Portuguese Water Dog",
  "Puli",
  "Samoyed",
  "Shetland Sheepdog",
  "Shiba Inu",
  "Soft Coated Wheaten Terrier",
  "Spanish Water Dog",
  "Standard Schnauzer",
  "Staffordshire Bull Terrier",
  "Vizsla",
  "Whippet",
  "Wirehaired Pointing Griffon",
  "Border Collie",
  "Australian Kelpie",
  "Boykin Spaniel",
  "Field Spaniel",
  "Finnish Lapphund",
  "Kooikerhondje",
  "Labradoodle",
  "Goldendoodle",
  "Bernedoodle (Mini)",
  "Aussiedoodle",
  "Sheprador",
  "Boxador",
  "Chiweenie",
  "American Water Spaniel",
  "Barbet",
  "Bluetick Coonhound",
  "English Foxhound",
  "Finnish Hound",
  "Kai Ken",
  "Karelian Bear Dog",
  "Mudi",
  "Polish Lowland Sheepdog",
  "Schapendoes",
  "Treeing Tennessee Brindle",
  "Upland Pointer",
  "Wirehaired Vizsla",
  "American Leopard Hound",
  "Bergamasco Sheepdog",
  "Mixed Breed (Medium)",
];

const LARGE_BREEDS = [
  "Airedale Terrier",
  "Akita",
  "Alaskan Malamute",
  "American Bulldog",
  "Anatolian Shepherd Dog",
  "Belgian Malinois",
  "Belgian Sheepdog",
  "Belgian Tervuren",
  "Bernese Mountain Dog",
  "Black and Tan Coonhound",
  "Bloodhound",
  "Boerboel",
  "Borzoi",
  "Boxer",
  "Briard",
  "Bullmastiff",
  "Cane Corso",
  "Chesapeake Bay Retriever",
  "Chinook",
  "Curly-Coated Retriever",
  "Doberman Pinscher",
  "English Setter",
  "Flat-Coated Retriever",
  "German Shepherd",
  "German Shorthaired Pointer",
  "German Wirehaired Pointer",
  "Golden Retriever",
  "Gordon Setter",
  "Greyhound",
  "Irish Setter",
  "Kuvasz",
  "Labrador Retriever",
  "Leonberger",
  "Newfoundland",
  "Old English Sheepdog",
  "Pointer",
  "Rhodesian Ridgeback",
  "Rottweiler",
  "Saluki",
  "Siberian Husky",
  "Spinone Italiano",
  "Standard Poodle",
  "Treeing Walker Coonhound",
  "Weimaraner",
  "American Foxhound",
  "Azawakh",
  "Black Russian Terrier",
  "Bouvier des Flandres",
  "Clumber Spaniel",
  "Dutch Shepherd",
  "English Pointer",
  "Giant Schnauzer",
  "Irish Red and White Setter",
  "Komondor (Large)",
  "Otterhound",
  "Pharaoh Hound",
  "Plott Hound",
  "Portuguese Podengo Grande",
  "Redbone Coonhound",
  "Sloughi",
  "Tornjak",
  "Xoloitzcuintli (Standard)",
  "Mixed Breed (Large)",
];

const GIANT_BREEDS = [
  "Great Dane",
  "Great Pyrenees",
  "Irish Wolfhound",
  "Mastiff",
  "Neapolitan Mastiff",
  "Saint Bernard",
  "Scottish Deerhound",
  "Tibetan Mastiff",
  "Dogue de Bordeaux",
  "English Mastiff",
  "Caucasian Shepherd",
  "Central Asian Shepherd",
  "Landseer",
  "Pyrenean Mastiff",
  "Komondor",
  "Estrela Mountain Dog",
  "Kangal Shepherd Dog",
  "Tosa Inu",
  "Boerboel (Giant)",
  "Great Swiss Mountain Dog",
  "Pyrenean Mountain Dog",
  "Spanish Mastiff",
  "Mixed Breed (Giant)",
];

function toEntries(names: string[], size: BreedEntry["size"]): BreedEntry[] {
  return names.map((name) => ({ name, size }));
}

export const BREED_DATA: BreedEntry[] = [
  ...toEntries(SMALL_BREEDS, "small"),
  ...toEntries(MEDIUM_BREEDS, "medium"),
  ...toEntries(LARGE_BREEDS, "large"),
  ...toEntries(GIANT_BREEDS, "giant"),
].sort((a, b) => a.name.localeCompare(b.name));

export const BREED_NAMES: string[] = BREED_DATA.map((entry) => entry.name);

function rangeBySize(size: BreedEntry["size"]): LifeExpectancyRange {
  if (size === "small") return { ...SMALL_RANGE };
  if (size === "medium") return { ...MEDIUM_RANGE };
  if (size === "large") return { ...LARGE_RANGE };
  return { ...GIANT_RANGE };
}

function rangeByWeight(weightLbs: number): LifeExpectancyRange {
  if (weightLbs < 20) return { ...SMALL_RANGE };
  if (weightLbs < 50) return { ...MEDIUM_RANGE };
  if (weightLbs <= 100) return { ...LARGE_RANGE };
  return { ...GIANT_RANGE };
}

export function getLifeExpectancyForBreed(
  breedName: string,
  weightLbs?: number
): LifeExpectancyRange {
  const key = normalize(breedName);
  const override = OVERRIDES[key];
  if (override) return override;

  const match = BREED_DATA.find((entry) => normalize(entry.name) === key);
  if (match) return rangeBySize(match.size);

  if (typeof weightLbs === "number" && Number.isFinite(weightLbs) && weightLbs > 0) {
    return rangeByWeight(weightLbs);
  }

  return { ...MEDIUM_RANGE };
}
