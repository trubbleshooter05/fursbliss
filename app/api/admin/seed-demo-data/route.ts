import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email || session.user.email !== 'trubbleshooter05@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        pets: {
          where: { name: { contains: 'Luna', mode: 'insensitive' } }
        }
      }
    });

    if (!user || user.pets.length === 0) {
      return NextResponse.json({ error: 'Luna not found' }, { status: 404 });
    }

    const luna = user.pets[0];

    // Delete existing logs
    await prisma.healthLog.deleteMany({
      where: { petId: luna.id }
    });

    // Generate 30 days of demo data
    const logs = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      let energyLevel = 8;
      let symptoms: string[] = [];
      let notes: string | null = null;
      let weight = 42;
      
      // Week 1: Normal, high energy
      if (i >= 23) {
        energyLevel = 8 + Math.floor(Math.random() * 2);
        weight = 42;
      }
      // Week 2: Slight energy dip, occasional limping
      else if (i >= 16 && i < 23) {
        energyLevel = 7 + Math.floor(Math.random() * 2);
        if (i === 20 || i === 18) {
          symptoms = ['Limping'];
          notes = 'Slight limp after long walk at park';
        }
        weight = 42 + (Math.random() * 0.5);
      }
      // Week 3: Energy continues to decline, more limping
      else if (i >= 9 && i < 16) {
        energyLevel = 6 + Math.floor(Math.random() * 2);
        if (i === 13 || i === 11 || i === 10) {
          symptoms = ['Limping'];
          notes = i === 13 ? 'Limping more noticeable on stairs' : 'Still favoring left hind leg';
        }
        weight = 42.5 + (Math.random() * 0.5);
      }
      // Week 4: Energy recovering, limping resolved
      else {
        energyLevel = 7 + Math.floor(Math.random() * 2);
        if (i === 2) {
          notes = 'Started glucosamine supplement - vet recommended';
        }
        if (i === 0) {
          notes = 'Much better today! Back to normal energy';
        }
        weight = 43 + (Math.random() * 0.3);
      }
      
      const appetite = symptoms.includes('Limping') && Math.random() > 0.5 ? 'normal' : 'good';
      const mood = energyLevel >= 8 ? 'playful' : energyLevel >= 7 ? 'happy' : 'calm';
      
      logs.push({
        petId: luna.id,
        date,
        energyLevel,
        weight: parseFloat(weight.toFixed(1)),
        appetite,
        appetiteLevel: appetite === 'good' ? 8 : 7,
        mobilityLevel: symptoms.includes('Limping') ? 6 : 8,
        mood,
        symptoms: symptoms.length > 0 ? symptoms.join(', ') : null,
        notes,
        createdAt: date,
      });
    }

    await prisma.healthLog.createMany({ data: logs });

    return NextResponse.json({
      success: true,
      logsCreated: logs.length,
      message: '30 days of demo data created for Luna',
      summary: {
        energyRange: '6-9',
        weightRange: '42-43.3 lbs',
        symptomsLogged: 5,
        notesAdded: 4,
        features: [
          '4-week trend charts',
          'Flagged concern: Limping pattern',
          'Energy trend analysis',
          'Weight tracking',
          'Discussion topics ready'
        ]
      }
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Seed error:', msg);
    return NextResponse.json({ error: 'Failed to seed data', detail: msg }, { status: 500 });
  }
}
