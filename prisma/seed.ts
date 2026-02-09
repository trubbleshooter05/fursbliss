import "dotenv/config";
import bcrypt from "bcryptjs";
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

async function main() {
  const hashedPassword = await bcrypt.hash("prelmium129!", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@fursbliss.com" },
    update: {
      password: hashedPassword,
      subscriptionStatus: "premium",
      subscriptionPlan: "monthly",
      emailVerified: new Date(),
      role: "admin",
    },
    create: {
      email: "demo@fursbliss.com",
      name: "Demo User",
      password: hashedPassword,
      subscriptionStatus: "premium",
      subscriptionPlan: "monthly",
      emailVerified: new Date(),
      role: "admin",
    },
  });

  const luna = await prisma.pet.upsert({
    where: { id: "seed-pet-luna" },
    update: {},
    create: {
      id: "seed-pet-luna",
      userId: user.id,
      name: "Luna",
      breed: "Golden Retriever",
      age: 5,
      weight: 58.4,
      symptoms: ["Joint stiffness", "Low energy"],
      photoUrl:
        "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=1200&auto=format&fit=crop",
    },
  });

  const milo = await prisma.pet.upsert({
    where: { id: "seed-pet-milo" },
    update: {},
    create: {
      id: "seed-pet-milo",
      userId: user.id,
      name: "Milo",
      breed: "Tabby Cat",
      age: 3,
      weight: 11.2,
      symptoms: ["Digestive issues"],
      photoUrl:
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&auto=format&fit=crop",
    },
  });

  const logs = [
    { petId: luna.id, energyLevel: 7, mood: "Calm", appetite: "Normal", notes: "Morning walk went well.", improvements: true },
    { petId: luna.id, energyLevel: 8, mood: "Happy", appetite: "High", notes: "More playful today.", improvements: true },
    { petId: milo.id, energyLevel: 6, mood: "Tired", appetite: "Low", notes: "Ate half his meal.", improvements: false },
    { petId: milo.id, energyLevel: 7, mood: "Calm", appetite: "Normal", notes: "Digestive issues improving.", improvements: true },
  ];

  await prisma.healthLog.createMany({
    data: logs.map((log, index) => ({
      petId: log.petId,
      date: new Date(Date.now() - (logs.length - index) * 86400000),
      energyLevel: log.energyLevel,
      mood: log.mood,
      appetite: log.appetite,
      notes: log.notes,
      improvements: log.improvements,
    })),
  });

  await prisma.recommendation.create({
    data: {
      petId: luna.id,
      prompt:
        "Recommend evidence-based supplements for a 5-year-old Golden Retriever with joint stiffness and low energy.",
      response:
        "Consider omega-3 fish oil (EPA/DHA 60-75 mg/kg daily), glucosamine/chondroitin for joint support, and a canine probiotic for gut health. Add a mixed antioxidant blend (vitamin E + CoQ10) to support recovery.",
    },
  });

  await prisma.petSupplement.createMany({
    data: [
      {
        petId: luna.id,
        name: "Omega-3 Fish Oil",
        brand: "Nordic Naturals",
        dosage: "1000mg",
        frequency: "daily",
        category: "skin_coat",
        startDate: new Date(Date.now() - 14 * 86400000),
      },
      {
        petId: luna.id,
        name: "Glucosamine HCl",
        brand: "Cosequin",
        dosage: "500mg",
        frequency: "daily",
        category: "joint",
        startDate: new Date(Date.now() - 30 * 86400000),
      },
    ],
  });

  await prisma.gutHealthLog.create({
    data: {
      petId: luna.id,
      stoolQuality: 3,
      stoolNotes: "Normal consistency",
      gasLevel: 2,
      vomiting: false,
      appetiteChange: "normal",
    },
  });

  await prisma.aIInsight.create({
    data: {
      petId: luna.id,
      type: "supplement_rec",
      content:
        "Glucosamine HCl shows strong evidence for joint support in Golden Retrievers over 5.",
      prompt: "Summarize supplement insights for Luna.",
      model: "gpt-4o-mini",
    },
  });

  await prisma.longevityDrugProfile.upsert({
    where: { petId: luna.id },
    update: {
      loy002Eligible: false,
      loy002Interest: true,
      loy002Notes: "Owner interested in LOY-002 readiness.",
      onRapamycin: false,
    },
    create: {
      petId: luna.id,
      loy002Eligible: false,
      loy002Interest: true,
      loy002Notes: "Owner interested in LOY-002 readiness.",
      onRapamycin: false,
    },
  });

  await prisma.fDADrugStatus.createMany({
    data: [
      {
        drugName: "LOY-002",
        company: "Loyal",
        currentStatus: "Safety Accepted",
        statusDetail: "TAS accepted Jan 13, 2026",
        lastUpdated: new Date(),
        targetSpecies: "dog",
        estimatedApproval: "2026-2027",
        sourceUrl: "https://loyal.com",
        milestones: JSON.stringify([
          { date: "2025-02", event: "RXE Accepted" },
          { date: "2026-01", event: "TAS Accepted" },
          { date: "2026-2027", event: "Conditional Approval (est.)" },
        ]),
      },
      {
        drugName: "LOY-001",
        company: "Loyal",
        currentStatus: "In Progress",
        statusDetail: "Safety + Manufacturing underway",
        lastUpdated: new Date(),
        targetSpecies: "dog",
        estimatedApproval: "2026",
        sourceUrl: "https://loyal.com",
        milestones: JSON.stringify([
          { date: "2023-11", event: "RXE Accepted" },
          { date: "2026", event: "Conditional Approval (est.)" },
        ]),
      },
    ],
  });

  await prisma.breedProfile.createMany({
    data: [
      {
        breed: "Golden Retriever",
        species: "dog",
        averageLifespan: 12,
        seniorAgeStart: 8,
        commonHealthIssues: JSON.stringify(["Hip dysplasia", "Cancer", "Arthritis"]),
        riskTimeline: JSON.stringify([
          { age: 6, risk: "Hip dysplasia", severity: "moderate" },
          { age: 9, risk: "Arthritis", severity: "high" },
        ]),
        supplementRecs: JSON.stringify([
          { supplement: "Glucosamine", startAge: 6, reason: "Joint support" },
          { supplement: "Omega-3", startAge: 5, reason: "Inflammation support" },
        ]),
        longevityTips: JSON.stringify([
          "Maintain lean body weight",
          "Daily low-impact exercise",
        ]),
        sizeCategory: "large",
        averageWeight: "55-75 lbs",
        seoSlug: "golden-retriever-senior",
        seoTitle:
          "Golden Retriever Longevity Guide: Supplements, Health Risks & How to Extend Their Life",
        seoDescription:
          "Evidence-based longevity guidance for Golden Retrievers: supplements, health risks, and proactive tracking.",
      },
      {
        breed: "Labrador Retriever",
        species: "dog",
        averageLifespan: 12,
        seniorAgeStart: 8,
        commonHealthIssues: JSON.stringify(["Obesity", "Arthritis"]),
        riskTimeline: JSON.stringify([
          { age: 7, risk: "Weight gain", severity: "moderate" },
          { age: 9, risk: "Arthritis", severity: "high" },
        ]),
        supplementRecs: JSON.stringify([
          { supplement: "Omega-3", startAge: 5, reason: "Joint support" },
        ]),
        longevityTips: JSON.stringify([
          "Maintain daily activity",
          "Monitor calorie intake",
        ]),
        sizeCategory: "large",
        averageWeight: "55-80 lbs",
        seoSlug: "labrador-retriever-senior",
        seoTitle:
          "Labrador Retriever Longevity Guide: Supplements, Health Risks & How to Extend Their Life",
        seoDescription:
          "Longevity planning for Labradors, including supplements, risks, and tracking tips.",
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
