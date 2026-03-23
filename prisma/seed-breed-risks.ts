/**
 * Seed BreedHealthRisk reference data.
 * Run: npx tsx prisma/seed-breed-risks.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  ),
});

const BREED_RISKS = [
  {
    breed: "Golden Retriever",
    condition: "Hip Dysplasia",
    riskLevel: "high",
    ageOnset: 7,
    description: "Goldens are 3x more likely to develop hip dysplasia than average breeds.",
    recommendation:
      "Discuss joint supplements (glucosamine/chondroitin) and weight management with your vet. Consider X-rays at next checkup.",
  },
  {
    breed: "Golden Retriever",
    condition: "Arthritis",
    riskLevel: "high",
    ageOnset: 8,
    description: "Over 60% of Golden Retrievers develop arthritis by age 10.",
    recommendation:
      "If mobility scores are declining, ask your vet about anti-inflammatory options, physical therapy, or LOY-002 when available.",
  },
  {
    breed: "Golden Retriever",
    condition: "Cancer",
    riskLevel: "high",
    ageOnset: 8,
    description: "Goldens have a 60% lifetime cancer risk — the highest of any breed.",
    recommendation:
      "Regular vet checkups every 6 months. Watch for unexplained lumps, weight loss, or appetite changes.",
  },
  {
    breed: "Golden Retriever",
    condition: "Heart Disease",
    riskLevel: "moderate",
    ageOnset: 9,
    description: "Subvalvular aortic stenosis occurs more frequently in Goldens.",
    recommendation: "Annual heart screening recommended for seniors. Watch for exercise intolerance or coughing.",
  },
  {
    breed: "Labrador Retriever",
    condition: "Hip Dysplasia",
    riskLevel: "high",
    ageOnset: 7,
    description: "Labs are predisposed to hip dysplasia, especially if overweight.",
    recommendation: "Maintain healthy weight. Discuss joint supplements and low-impact exercise with your vet.",
  },
  {
    breed: "Labrador Retriever",
    condition: "Obesity",
    riskLevel: "high",
    ageOnset: 5,
    description: "Labs have a gene mutation (POMC) that makes them prone to overeating.",
    recommendation: "Strict portion control. Track weight weekly. Your vet can help set a target weight.",
  },
  {
    breed: "Labrador Retriever",
    condition: "Arthritis",
    riskLevel: "high",
    ageOnset: 8,
    description: "Arthritis risk increases significantly in Labs over 8, especially if hip dysplasia is present.",
    recommendation: "If mobility declining, ask about NSAIDs, physical therapy, or joint supplements.",
  },
  {
    breed: "German Shepherd",
    condition: "Hip Dysplasia",
    riskLevel: "high",
    ageOnset: 6,
    description: "German Shepherds have one of the highest rates of hip dysplasia among all breeds.",
    recommendation: "Consider hip X-rays annually after age 6. Discuss glucosamine supplementation.",
  },
  {
    breed: "German Shepherd",
    condition: "Degenerative Myelopathy",
    riskLevel: "high",
    ageOnset: 8,
    description: "GSDs are the breed most commonly affected by degenerative myelopathy.",
    recommendation: "Watch for hind leg weakness or dragging. Early physical therapy can help maintain mobility.",
  },
  {
    breed: "German Shepherd",
    condition: "Arthritis",
    riskLevel: "high",
    ageOnset: 7,
    description: "Joint issues are very common due to breed structure.",
    recommendation: "Low-impact exercise, joint supplements, weight management. Ramps instead of stairs.",
  },
  {
    breed: "French Bulldog",
    condition: "IVDD",
    riskLevel: "high",
    ageOnset: 5,
    description: "Frenchies are prone to intervertebral disc disease due to their body structure.",
    recommendation: "Avoid jumping on/off furniture. Use ramps. Watch for back pain or reluctance to move.",
  },
  {
    breed: "French Bulldog",
    condition: "Breathing Issues",
    riskLevel: "high",
    ageOnset: 3,
    description: "Brachycephalic airway syndrome affects most French Bulldogs.",
    recommendation: "Avoid overexertion in heat. Keep weight optimal. Discuss airway assessment with vet.",
  },
  {
    breed: "Poodle",
    condition: "Hip Dysplasia",
    riskLevel: "moderate",
    ageOnset: 8,
    description: "Standard Poodles can develop hip dysplasia, though less commonly than larger breeds.",
    recommendation: "Regular exercise to maintain muscle mass. Joint supplements after age 8.",
  },
  {
    breed: "Poodle",
    condition: "Bloat (GDV)",
    riskLevel: "moderate",
    ageOnset: 7,
    description: "Deep-chested breeds like Standard Poodles are at higher bloat risk.",
    recommendation:
      "Avoid exercise right after meals. Learn the signs of bloat (distended abdomen, retching). This is an emergency.",
  },
  {
    breed: "Aussiedoodle",
    condition: "Hip Dysplasia",
    riskLevel: "moderate",
    ageOnset: 8,
    description: "Inherited from both Australian Shepherd and Poodle parent breeds.",
    recommendation: "Monitor mobility closely after age 8. Joint supplements and weight management help.",
  },
  {
    breed: "Aussiedoodle",
    condition: "Arthritis",
    riskLevel: "moderate",
    ageOnset: 9,
    description: "Mixed breed vigor helps, but joint issues still common in senior Aussiedoodles.",
    recommendation: "Daily mobility tracking helps catch early decline. Discuss anti-inflammatory options with vet.",
  },
  {
    breed: "Aussiedoodle",
    condition: "Eye Issues",
    riskLevel: "moderate",
    ageOnset: 7,
    description: "Both parent breeds carry genes for progressive retinal atrophy and cataracts.",
    recommendation: "Annual eye exams recommended. Watch for bumping into things or hesitancy in low light.",
  },
  {
    breed: "Dachshund",
    condition: "IVDD",
    riskLevel: "high",
    ageOnset: 5,
    description: "Dachshunds have the highest IVDD risk of any breed due to their long spine.",
    recommendation: "Use ramps everywhere. No jumping. If sudden back pain or paralysis, emergency vet immediately.",
  },
  {
    breed: "Boxer",
    condition: "Cancer",
    riskLevel: "high",
    ageOnset: 7,
    description: "Boxers have elevated risk for mast cell tumors, lymphoma, and brain tumors.",
    recommendation: "Check for lumps monthly. Any new lump should be evaluated by your vet promptly.",
  },
  {
    breed: "Boxer",
    condition: "Heart Disease",
    riskLevel: "high",
    ageOnset: 6,
    description: "Boxer cardiomyopathy (ARVC) is a breed-specific heart condition.",
    recommendation: "Annual cardiac screening recommended. Watch for fainting, exercise intolerance, or irregular breathing.",
  },
  {
    breed: "Beagle",
    condition: "Obesity",
    riskLevel: "high",
    ageOnset: 5,
    description: "Beagles are highly food-motivated and prone to weight gain.",
    recommendation: "Strict portion control. Daily weigh-ins help catch trends. Extra weight accelerates arthritis.",
  },
  {
    breed: "Beagle",
    condition: "Hypothyroidism",
    riskLevel: "moderate",
    ageOnset: 7,
    description: "Beagles have higher rates of thyroid dysfunction.",
    recommendation: "If energy declining despite adequate rest, ask vet to check thyroid levels.",
  },
  {
    breed: "Rottweiler",
    condition: "Osteosarcoma",
    riskLevel: "high",
    ageOnset: 7,
    description: "Rottweilers have one of the highest bone cancer rates of any breed.",
    recommendation: "Any persistent limping that doesn't resolve in a few days warrants X-rays.",
  },
  {
    breed: "Rottweiler",
    condition: "Hip Dysplasia",
    riskLevel: "high",
    ageOnset: 6,
    description: "Large frame puts significant stress on hip joints.",
    recommendation: "Weight management is critical. Joint supplements, controlled exercise, and ramps help.",
  },
  {
    breed: "Yorkshire Terrier",
    condition: "Dental Disease",
    riskLevel: "high",
    ageOnset: 5,
    description: "Small breeds are disproportionately affected by dental issues.",
    recommendation: "Daily tooth brushing or dental chews. Annual professional dental cleaning.",
  },
  {
    breed: "Yorkshire Terrier",
    condition: "Luxating Patella",
    riskLevel: "moderate",
    ageOnset: 6,
    description: "Kneecap displacement is common in Yorkies.",
    recommendation: "Watch for intermittent skipping or holding up a back leg. Surgery may be needed if severe.",
  },
  {
    breed: "Cavalier King Charles Spaniel",
    condition: "Heart Disease",
    riskLevel: "high",
    ageOnset: 5,
    description: "Nearly all Cavaliers develop mitral valve disease. It's the #1 breed health issue.",
    recommendation: "Annual cardiac screening starting at age 3. Medication can manage symptoms and slow progression.",
  },
  {
    breed: "Mixed Breed",
    condition: "Arthritis",
    riskLevel: "moderate",
    ageOnset: 9,
    description: "Arthritis affects up to 80% of dogs over 8 years old regardless of breed.",
    recommendation:
      "Track mobility daily. Joint supplements, weight management, and gentle exercise help. Ask your vet about pain management options.",
  },
  {
    breed: "Mixed Breed",
    condition: "Dental Disease",
    riskLevel: "moderate",
    ageOnset: 7,
    description: "By age 7, most dogs have some degree of dental disease.",
    recommendation: "Regular dental care including brushing and professional cleanings.",
  },
  {
    breed: "Mixed Breed",
    condition: "Obesity",
    riskLevel: "moderate",
    ageOnset: 6,
    description: "Senior dogs need fewer calories but owners often don't adjust portions.",
    recommendation: "Weigh monthly. Reduce portions 10-20% after age 8 unless vet says otherwise.",
  },
];

async function main() {
  let n = 0;
  for (const r of BREED_RISKS) {
    await prisma.breedHealthRisk.upsert({
      where: {
        breed_condition: {
          breed: r.breed,
          condition: r.condition,
        },
      },
      create: r,
      update: {
        riskLevel: r.riskLevel,
        ageOnset: r.ageOnset,
        description: r.description,
        recommendation: r.recommendation,
      },
    });
    n++;
  }
  console.log(`Seeded ${n} breed health risks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
