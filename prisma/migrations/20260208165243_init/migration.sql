-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "password" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'free',
    "subscriptionId" TEXT,
    "subscriptionPlan" TEXT,
    "subscriptionEndsAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "referralCode" TEXT,
    "referredById" TEXT,
    "emailPreferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL DEFAULT 'dog',
    "breed" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "weight" DOUBLE PRECISION NOT NULL,
    "sex" TEXT,
    "symptoms" JSONB NOT NULL,
    "photoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthLog" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "energyLevel" INTEGER NOT NULL,
    "appetite" TEXT,
    "mood" TEXT,
    "mobilityLevel" INTEGER,
    "moodLevel" INTEGER,
    "appetiteLevel" INTEGER,
    "symptoms" TEXT,
    "notes" TEXT,
    "weight" DOUBLE PRECISION,
    "photoUrl" TEXT,
    "improvements" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightLog" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeightLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prescribedBy" TEXT,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "reason" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoseSchedule" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "supplementId" TEXT,
    "supplementName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "times" JSONB NOT NULL,
    "scheduledTime" TEXT,
    "daysOfWeek" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoseSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoLog" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "healthLogId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT,
    "caption" TEXT,
    "aiAnalysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invitedEmail" TEXT,
    "redeemedById" TEXT,
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetSupplement" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetSupplement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoseCompletion" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "DoseCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GutHealthLog" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stoolQuality" INTEGER NOT NULL,
    "stoolNotes" TEXT,
    "gasLevel" INTEGER,
    "vomiting" BOOLEAN NOT NULL DEFAULT false,
    "appetiteChange" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GutHealthLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "cached" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LongevityDrugProfile" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "loy002Eligible" BOOLEAN NOT NULL DEFAULT false,
    "loy002Interest" BOOLEAN NOT NULL DEFAULT false,
    "loy002Notes" TEXT,
    "onRapamycin" BOOLEAN NOT NULL DEFAULT false,
    "rapamycinDosage" TEXT,
    "rapamycinStartDate" TIMESTAMP(3),
    "rapamycinPrescriber" TEXT,
    "rapamycinFrequency" TEXT,
    "currentDrugs" TEXT,
    "bloodworkUploaded" BOOLEAN NOT NULL DEFAULT false,
    "lastBloodworkDate" TIMESTAMP(3),

    CONSTRAINT "LongevityDrugProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RapamycinDoseLog" (
    "id" TEXT NOT NULL,
    "drugProfileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "given" BOOLEAN NOT NULL DEFAULT true,
    "sideEffects" TEXT,
    "notes" TEXT,

    CONSTRAINT "RapamycinDoseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreedProfile" (
    "id" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "species" TEXT NOT NULL DEFAULT 'dog',
    "averageLifespan" DOUBLE PRECISION NOT NULL,
    "seniorAgeStart" INTEGER NOT NULL,
    "commonHealthIssues" TEXT NOT NULL,
    "riskTimeline" TEXT NOT NULL,
    "supplementRecs" TEXT NOT NULL,
    "longevityTips" TEXT NOT NULL,
    "sizeCategory" TEXT NOT NULL,
    "averageWeight" TEXT NOT NULL,
    "seoSlug" TEXT NOT NULL,
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreedProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FDADrugStatus" (
    "id" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "currentStatus" TEXT NOT NULL,
    "statusDetail" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "targetSpecies" TEXT NOT NULL,
    "estimatedApproval" TEXT,
    "sourceUrl" TEXT,
    "milestones" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FDADrugStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreedAggregate" (
    "id" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "totalPets" INTEGER NOT NULL DEFAULT 0,
    "avgAge" DOUBLE PRECISION,
    "topSupplements" TEXT,
    "topSymptoms" TEXT,
    "avgEnergyLevel" DOUBLE PRECISION,
    "avgMobilityLevel" DOUBLE PRECISION,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BreedAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VetShareLink" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "vetComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VetShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_subscriptionId_key" ON "User"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "LongevityDrugProfile_petId_key" ON "LongevityDrugProfile"("petId");

-- CreateIndex
CREATE UNIQUE INDEX "BreedProfile_breed_key" ON "BreedProfile"("breed");

-- CreateIndex
CREATE UNIQUE INDEX "BreedProfile_seoSlug_key" ON "BreedProfile"("seoSlug");

-- CreateIndex
CREATE UNIQUE INDEX "FDADrugStatus_drugName_key" ON "FDADrugStatus"("drugName");

-- CreateIndex
CREATE UNIQUE INDEX "BreedAggregate_breed_key" ON "BreedAggregate"("breed");

-- CreateIndex
CREATE UNIQUE INDEX "VetShareLink_token_key" ON "VetShareLink"("token");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthLog" ADD CONSTRAINT "HealthLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightLog" ADD CONSTRAINT "WeightLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoseSchedule" ADD CONSTRAINT "DoseSchedule_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoseSchedule" ADD CONSTRAINT "DoseSchedule_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "PetSupplement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoLog" ADD CONSTRAINT "PhotoLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetSupplement" ADD CONSTRAINT "PetSupplement_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoseCompletion" ADD CONSTRAINT "DoseCompletion_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "DoseSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GutHealthLog" ADD CONSTRAINT "GutHealthLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LongevityDrugProfile" ADD CONSTRAINT "LongevityDrugProfile_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RapamycinDoseLog" ADD CONSTRAINT "RapamycinDoseLog_drugProfileId_fkey" FOREIGN KEY ("drugProfileId") REFERENCES "LongevityDrugProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VetShareLink" ADD CONSTRAINT "VetShareLink_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
