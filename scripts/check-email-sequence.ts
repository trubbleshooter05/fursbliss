#!/usr/bin/env tsx
/**
 * Check Email Sequence Status
 * 
 * Shows:
 * - Active enrollments
 * - Emails sent in last 7 days
 * - Next scheduled emails
 * - Success/failure rates
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { Pool } from '@neondatabase/serverless';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Load production env
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('📧 Email Sequence Status Report\n');

  // Active enrollments
  const activeEnrollments = await prisma.emailSequenceEnrollment.findMany({
    where: {
      status: 'active',
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      nextSendAt: 'asc',
    },
  });

  console.log(`📋 Active Enrollments: ${activeEnrollments.length}\n`);

  if (activeEnrollments.length > 0) {
    console.log('Next 10 scheduled emails:');
    for (const enrollment of activeEnrollments.slice(0, 10)) {
      const nextDate = enrollment.nextSendAt 
        ? new Date(enrollment.nextSendAt).toLocaleString() 
        : 'Not scheduled';
      console.log(`  • ${enrollment.user.email} - Next: ${nextDate} (Step ${enrollment.currentStep})`);
    }
    console.log('');
  }

  // Recent emails sent (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentSteps = await prisma.emailSequenceStep.findMany({
    where: {
      sentAt: {
        gte: sevenDaysAgo,
      },
    },
    include: {
      enrollment: {
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      sentAt: 'desc',
    },
    take: 20,
  });

  console.log(`✉️  Emails Sent (Last 7 Days): ${recentSteps.length}\n`);

  if (recentSteps.length > 0) {
    console.log('Recent emails:');
    for (const step of recentSteps) {
      const sentDate = step.sentAt ? new Date(step.sentAt).toLocaleString() : 'Unknown';
      console.log(`  • ${step.enrollment.user.email} - Step ${step.step} - ${sentDate} - ${step.status}`);
    }
    console.log('');
  }

  // Stats
  const allSteps = await prisma.emailSequenceStep.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  const sent = allSteps.filter((s) => s.status === 'sent').length;
  const failed = allSteps.filter((s) => s.status === 'failed').length;
  const skipped = allSteps.filter((s) => s.status === 'skipped').length;
  const pending = allSteps.filter((s) => s.status === 'pending').length;

  console.log('📊 Stats (Last 7 Days):');
  console.log(`  ✅ Sent: ${sent}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ⏳ Pending: ${pending}`);
  console.log('');

  // Completed enrollments
  const completedCount = await prisma.emailSequenceEnrollment.count({
    where: {
      status: 'completed',
      updatedAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  console.log(`🎉 Completed Sequences (Last 7 Days): ${completedCount}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
