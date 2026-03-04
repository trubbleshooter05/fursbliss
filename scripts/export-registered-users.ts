import "dotenv/config";
import { prisma } from "../lib/prisma";
import { writeFileSync } from "fs";

async function exportRegisteredUsers() {
  console.log("Fetching ALL registered users...");

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      stripeCustomerId: true,
      subscriptionStatus: true,
      pets: {
        select: {
          name: true,
          breed: true,
          age: true,
        },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Total users in database: ${allUsers.length}`);

  const unpaidUsers = allUsers.filter((u) => !u.stripeCustomerId);
  console.log(`Users who haven't paid: ${unpaidUsers.length}`);

  const recentUnpaid = unpaidUsers.filter(
    (u) => u.createdAt >= new Date("2026-02-12")
  );
  console.log(`Recent unpaid (since Feb 12): ${recentUnpaid.length}`);

  // Use ALL unpaid users for outreach (not just recent)
  const emailList = unpaidUsers.map((u) => ({
    email: u.email,
    firstName: u.name?.split(" ")[0] || "there",
    fullName: u.name || "User",
    dogName: u.pets[0]?.name || "your dog",
    dogBreed: u.pets[0]?.breed || "",
    registeredDate: u.createdAt.toISOString().split("T")[0],
    hasPet: u.pets.length > 0,
  }));

  // Save as JSON
  writeFileSync(
    "registered-users.json",
    JSON.stringify(emailList, null, 2)
  );

  // Save as CSV
  const csv = [
    "Email,First Name,Full Name,Dog Name,Dog Breed,Registered Date,Has Pet",
    ...emailList.map(
      (u) =>
        `${u.email},"${u.firstName}","${u.fullName}","${u.dogName}","${u.dogBreed}",${u.registeredDate},${u.hasPet}`
    ),
  ].join("\n");

  writeFileSync("registered-users.csv", csv);

  console.log("\n✅ Exported to:");
  console.log("  - registered-users.json");
  console.log("  - registered-users.csv");
  console.log("\nFirst 5 users:");
  console.log(JSON.stringify(emailList.slice(0, 5), null, 2));

  console.log("\n📊 Summary:");
  console.log(`Total users: ${allUsers.length}`);
  console.log(`Paid users: ${allUsers.length - unpaidUsers.length}`);
  console.log(`Unpaid users: ${unpaidUsers.length}`);
  console.log(`Users with pets: ${emailList.filter((u) => u.hasPet).length}`);

  await prisma.$disconnect();
}

exportRegisteredUsers().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
