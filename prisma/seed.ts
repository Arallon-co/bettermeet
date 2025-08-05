import { PrismaClient } from '@prisma/client';
import { addDays, format } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.availability.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.poll.deleteMany();

  // Create sample polls
  const poll1 = await prisma.poll.create({
    data: {
      title: 'Team Weekly Standup',
      description: 'Weekly team standup meeting to discuss progress and blockers',
      organizerTimezone: 'America/New_York',
    },
  });

  const poll2 = await prisma.poll.create({
    data: {
      title: 'Project Kickoff Meeting',
      description: 'Initial meeting to discuss project requirements and timeline',
      organizerTimezone: 'Europe/London',
    },
  });

  // Create time slots for poll1 (next week, Monday to Friday, 9-11 AM and 2-4 PM)
  const nextMonday = addDays(new Date(), 7 - new Date().getDay() + 1);
  const timeSlots1 = [];

  for (let i = 0; i < 5; i++) {
    const date = addDays(nextMonday, i);
    
    // Morning slot
    timeSlots1.push({
      pollId: poll1.id,
      date,
      startTime: '09:00',
      endTime: '11:00',
    });

    // Afternoon slot
    timeSlots1.push({
      pollId: poll1.id,
      date,
      startTime: '14:00',
      endTime: '16:00',
    });
  }

  await prisma.timeSlot.createMany({
    data: timeSlots1,
  });

  // Create time slots for poll2 (next week, Tuesday and Wednesday, various times)
  const timeSlots2 = [
    {
      pollId: poll2.id,
      date: addDays(nextMonday, 1), // Tuesday
      startTime: '10:00',
      endTime: '12:00',
    },
    {
      pollId: poll2.id,
      date: addDays(nextMonday, 1), // Tuesday
      startTime: '15:00',
      endTime: '17:00',
    },
    {
      pollId: poll2.id,
      date: addDays(nextMonday, 2), // Wednesday
      startTime: '09:00',
      endTime: '11:00',
    },
    {
      pollId: poll2.id,
      date: addDays(nextMonday, 2), // Wednesday
      startTime: '13:00',
      endTime: '15:00',
    },
  ];

  await prisma.timeSlot.createMany({
    data: timeSlots2,
  });

  // Get created time slots
  const poll1TimeSlots = await prisma.timeSlot.findMany({
    where: { pollId: poll1.id },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  const poll2TimeSlots = await prisma.timeSlot.findMany({
    where: { pollId: poll2.id },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  // Create sample participants for poll1
  const participants1 = await Promise.all([
    prisma.participant.create({
      data: {
        pollId: poll1.id,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        timezone: 'America/New_York',
      },
    }),
    prisma.participant.create({
      data: {
        pollId: poll1.id,
        name: 'Bob Smith',
        email: 'bob@example.com',
        timezone: 'America/Los_Angeles',
      },
    }),
    prisma.participant.create({
      data: {
        pollId: poll1.id,
        name: 'Charlie Brown',
        timezone: 'Europe/London',
      },
    }),
  ]);

  // Create sample participants for poll2
  const participants2 = await Promise.all([
    prisma.participant.create({
      data: {
        pollId: poll2.id,
        name: 'Diana Prince',
        email: 'diana@example.com',
        timezone: 'Europe/London',
      },
    }),
    prisma.participant.create({
      data: {
        pollId: poll2.id,
        name: 'Ethan Hunt',
        email: 'ethan@example.com',
        timezone: 'Asia/Tokyo',
      },
    }),
  ]);

  // Create availability for poll1 participants
  const availability1 = [];

  // Alice is available for most morning slots
  for (let i = 0; i < poll1TimeSlots.length; i += 2) {
    availability1.push({
      participantId: participants1[0].id,
      timeSlotId: poll1TimeSlots[i].id,
      isAvailable: Math.random() > 0.3, // 70% chance of being available
    });
  }

  // Bob is available for most afternoon slots
  for (let i = 1; i < poll1TimeSlots.length; i += 2) {
    availability1.push({
      participantId: participants1[1].id,
      timeSlotId: poll1TimeSlots[i].id,
      isAvailable: Math.random() > 0.2, // 80% chance of being available
    });
  }

  // Charlie has mixed availability
  poll1TimeSlots.forEach((slot) => {
    availability1.push({
      participantId: participants1[2].id,
      timeSlotId: slot.id,
      isAvailable: Math.random() > 0.5, // 50% chance of being available
    });
  });

  await prisma.availability.createMany({
    data: availability1,
  });

  // Create availability for poll2 participants
  const availability2: any[] = [];

  // Diana is available for most slots
  poll2TimeSlots.forEach((slot) => {
    availability2.push({
      participantId: participants2[0].id,
      timeSlotId: slot.id,
      isAvailable: Math.random() > 0.25, // 75% chance of being available
    });
  });

  // Ethan has limited availability due to timezone
  poll2TimeSlots.forEach((slot, index) => {
    availability2.push({
      participantId: participants2[1].id,
      timeSlotId: slot.id,
      isAvailable: index < 2 ? Math.random() > 0.4 : Math.random() > 0.7, // Better availability for earlier slots
    });
  });

  await prisma.availability.createMany({
    data: availability2,
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created:`);
  console.log(`   - 2 polls`);
  console.log(`   - ${poll1TimeSlots.length + poll2TimeSlots.length} time slots`);
  console.log(`   - ${participants1.length + participants2.length} participants`);
  console.log(`   - ${availability1.length + availability2.length} availability records`);
  console.log(`\n🔗 Poll URLs:`);
  console.log(`   - Poll 1: http://localhost:3000/poll/${poll1.id}`);
  console.log(`   - Poll 2: http://localhost:3000/poll/${poll2.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });