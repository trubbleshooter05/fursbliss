import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLunaData() {
  try {
    // Find user and Luna
    const user = await prisma.user.findUnique({
      where: { email: 'trubbleshooter05@gmail.com' },
      include: {
        pets: {
          where: { name: { contains: 'Luna', mode: 'insensitive' } }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    if (user.pets.length === 0) {
      console.log('❌ Luna not found');
      return;
    }

    const luna = user.pets[0];
    console.log(`✅ Found Luna (${luna.id})`);

    // Delete existing logs for clean slate
    await prisma.healthLog.deleteMany({
      where: { petId: luna.id }
    });
    console.log('🗑️  Cleared existing logs');

    // Generate 30 days of realistic data
    const logs = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create interesting patterns:
      // - Energy declining slightly over time (showing a trend)
      // - Some intermittent limping in week 2-3
      // - Weight stable with slight increase
      
      let energyLevel = 8;
      let symptoms = [];
      let notes = null;
      let weight = 42;
      
      // Week 1 (days 0-6): Normal, high energy
      if (i >= 23) {
        energyLevel = 8 + Math.floor(Math.random() * 2); // 8-9
        weight = 42;
      }
      
      // Week 2 (days 7-13): Slight energy dip, occasional limping
      else if (i >= 16 && i < 23) {
        energyLevel = 7 + Math.floor(Math.random() * 2); // 7-8
        if (i === 20 || i === 18) {
          symptoms = ['Limping'];
          notes = 'Slight limp after long walk at park';
        }
        weight = 42 + (Math.random() * 0.5);
      }
      
      // Week 3 (days 14-20): Energy continues to decline, more limping
      else if (i >= 9 && i < 16) {
        energyLevel = 6 + Math.floor(Math.random() * 2); // 6-7
        if (i === 13 || i === 11 || i === 10) {
          symptoms = ['Limping'];
          notes = i === 13 ? 'Limping more noticeable on stairs' : 'Still favoring left hind leg';
        }
        weight = 42.5 + (Math.random() * 0.5);
      }
      
      // Week 4 (days 21-29): Energy recovering, limping resolved
      else {
        energyLevel = 7 + Math.floor(Math.random() * 2); // 7-8
        if (i === 2) {
          notes = 'Started glucosamine supplement - vet recommended';
        }
        if (i === 0) {
          notes = 'Much better today! Back to normal energy';
        }
        weight = 43 + (Math.random() * 0.3);
      }
      
      // Add some appetite variation
      const appetiteOptions = ['normal', 'good', 'excellent', 'reduced'];
      let appetite = 'good';
      if (symptoms.includes('Limping')) {
        appetite = Math.random() > 0.5 ? 'normal' : 'reduced';
      } else {
        appetite = appetiteOptions[Math.floor(Math.random() * 3)]; // bias toward good
      }
      
      // Add mood
      const moodOptions = ['happy', 'calm', 'playful', 'tired'];
      let mood = energyLevel >= 8 ? 'playful' : energyLevel >= 7 ? 'happy' : 'calm';
      
      logs.push({
        petId: luna.id,
        date: date,
        energyLevel,
        weight: parseFloat(weight.toFixed(1)),
        appetite,
        appetiteLevel: appetite === 'excellent' ? 9 : appetite === 'good' ? 8 : appetite === 'normal' ? 7 : 5,
        mobilityLevel: symptoms.includes('Limping') ? 6 : 8,
        mood,
        symptoms: symptoms.length > 0 ? symptoms.join(', ') : null,
        notes,
        stoolQuality: 'normal',
        createdAt: date,
        updatedAt: date
      });
    }

    // Insert all logs
    await prisma.healthLog.createMany({
      data: logs
    });

    console.log(`✅ Created ${logs.length} health logs for Luna`);
    console.log('\n📊 DATA SUMMARY:');
    console.log(`   Days logged: ${logs.length}`);
    console.log(`   Date range: ${logs[0].date.toLocaleDateString()} to ${logs[logs.length - 1].date.toLocaleDateString()}`);
    console.log(`   Energy range: 6-9 (shows declining then recovering trend)`);
    console.log(`   Weight range: 42-43.3 lbs (slight increase)`);
    console.log(`   Symptoms: Limping episodes in weeks 2-3 (will flag in report)`);
    console.log(`   Notes: 4 entries with context`);
    console.log('\n🎬 Your vet report will now show:');
    console.log('   ✓ 4-week trend charts');
    console.log('   ✓ Flagged concern: "Limping logged 5x in past 30 days"');
    console.log('   ✓ Energy trend: "Declined 20% week 2-3, now recovering"');
    console.log('   ✓ Weight trend: "Stable, slight gain (+2.9%)"');
    console.log('   ✓ Discussion topics: Joint health, glucosamine timing');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLunaData();
