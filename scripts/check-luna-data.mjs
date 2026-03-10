import { prisma } from '../lib/prisma.js';

async function checkLunaData() {
  try {
    // Find Luna's pet record
    const luna = await prisma.pet.findFirst({
      where: { name: { contains: 'Luna', mode: 'insensitive' } },
      include: {
        healthLogs: {
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    });

    if (!luna) {
      console.log('❌ Luna not found in database');
      return;
    }

    console.log('\n📋 LUNA\'S PET DATA:');
    console.log('─────────────────────────────────');
    console.log(`Name: ${luna.name}`);
    console.log(`Breed: ${luna.breed}`);
    console.log(`Age: ${luna.age}`);
    console.log(`Weight: ${luna.weight}`);
    console.log(`Photo URL: ${luna.photoUrl || '(empty)'}`);
    console.log(`Created: ${luna.createdAt}`);

    console.log('\n📊 RECENT HEALTH LOGS:');
    console.log('─────────────────────────────────');
    if (luna.healthLogs.length === 0) {
      console.log('No health logs found');
    } else {
      luna.healthLogs.forEach((log, index) => {
        console.log(`\n${index + 1}. Log ID: ${log.id}`);
        console.log(`   Date (raw): ${log.date}`);
        console.log(`   Date (ISO): ${log.date.toISOString()}`);
        console.log(`   Date (local): ${log.date.toLocaleString()}`);
        console.log(`   Energy: ${log.energyLevel}`);
        console.log(`   Mood: ${log.mood || '(none)'}`);
        console.log(`   Notes: ${log.notes || '(none)'}`);
      });
    }

    // Check timezone issue
    console.log('\n🕐 TIMEZONE INFO:');
    console.log('─────────────────────────────────');
    console.log(`Server timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    console.log(`Current server time: ${new Date().toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLunaData();
