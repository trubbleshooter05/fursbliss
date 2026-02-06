import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const databaseFile = databaseUrl.replace("file:", "");
const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: databaseFile }),
});

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@fursbliss.com" },
    update: {},
    create: {
      email: "demo@fursbliss.com",
      name: "Demo User",
      password: hashedPassword,
      subscriptionStatus: "premium",
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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
