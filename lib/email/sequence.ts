import {
  EmailSequenceEnrollmentStatus,
  EmailSequenceStepStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

const WELCOME_SEQUENCE_TYPE = "welcome_v1";

function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function enrollUserInWelcomeSequence(userId: string) {
  const stepDays = [0, 1, 3, 5, 7, 10];
  const existing = await prisma.emailSequenceEnrollment.findFirst({
    where: {
      userId,
      sequenceType: WELCOME_SEQUENCE_TYPE,
      status: EmailSequenceEnrollmentStatus.active,
    },
    include: {
      steps: {
        orderBy: { step: "asc" },
      },
    },
  });

  if (existing) {
    await prisma.$transaction(
      stepDays.map((step) =>
        prisma.emailSequenceStep.updateMany({
          where: {
            enrollmentId: existing.id,
            step,
            status: EmailSequenceStepStatus.pending,
          },
          data: {
            scheduledAt: addDays(existing.startedAt, step),
          },
        })
      )
    );

    const existingSteps = new Set(existing.steps.map((step) => step.step));
    const missingSteps = stepDays.filter((step) => !existingSteps.has(step));
    if (missingSteps.length > 0) {
      await prisma.emailSequenceStep.createMany({
        data: missingSteps.map((step) => ({
          enrollmentId: existing.id,
          step,
          scheduledAt: addDays(existing.startedAt, step),
          status: EmailSequenceStepStatus.pending,
        })),
      });
      await updateEnrollmentNextSendAt(existing.id);
    }
    return existing;
  }

  const startedAt = new Date();
  const enrollment = await prisma.emailSequenceEnrollment.create({
    data: {
      userId,
      sequenceType: WELCOME_SEQUENCE_TYPE,
      status: EmailSequenceEnrollmentStatus.active,
      startedAt,
      nextSendAt: startedAt,
      steps: {
        create: [
          {
            step: 0,
            scheduledAt: startedAt,
            status: EmailSequenceStepStatus.pending,
          },
          {
            step: 1,
            scheduledAt: addDays(startedAt, 1),
            status: EmailSequenceStepStatus.pending,
          },
          {
            step: 3,
            scheduledAt: addDays(startedAt, 3),
            status: EmailSequenceStepStatus.pending,
          },
          {
            step: 5,
            scheduledAt: addDays(startedAt, 5),
            status: EmailSequenceStepStatus.pending,
          },
          {
            step: 7,
            scheduledAt: addDays(startedAt, 7),
            status: EmailSequenceStepStatus.pending,
          },
          {
            step: 10,
            scheduledAt: addDays(startedAt, 10),
            status: EmailSequenceStepStatus.pending,
          },
        ],
      },
    },
    include: {
      steps: {
        orderBy: { step: "asc" },
      },
    },
  });

  return enrollment;
}

export async function getDueEmailSequenceSteps(limit = 100) {
  return prisma.emailSequenceStep.findMany({
    where: {
      status: EmailSequenceStepStatus.pending,
      scheduledAt: { lte: new Date() },
      enrollment: {
        status: EmailSequenceEnrollmentStatus.active,
        sequenceType: WELCOME_SEQUENCE_TYPE,
      },
    },
    include: {
      enrollment: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
    take: limit,
  });
}

export async function markEmailSequenceStepSent(stepId: string, resendMessageId?: string | null) {
  await prisma.emailSequenceStep.update({
    where: { id: stepId },
    data: {
      status: EmailSequenceStepStatus.sent,
      sentAt: new Date(),
      resendMessageId: resendMessageId ?? undefined,
    },
  });
}

export async function markEmailSequenceStepFailed(stepId: string) {
  await prisma.emailSequenceStep.update({
    where: { id: stepId },
    data: {
      status: EmailSequenceStepStatus.failed,
    },
  });
}

export async function markEmailSequenceStepSkipped(stepId: string) {
  await prisma.emailSequenceStep.update({
    where: { id: stepId },
    data: {
      status: EmailSequenceStepStatus.skipped,
    },
  });
}

export async function updateEnrollmentNextSendAt(enrollmentId: string) {
  const nextPending = await prisma.emailSequenceStep.findFirst({
    where: {
      enrollmentId,
      status: EmailSequenceStepStatus.pending,
    },
    orderBy: { scheduledAt: "asc" },
  });

  if (!nextPending) {
    await prisma.emailSequenceEnrollment.update({
      where: { id: enrollmentId },
      data: {
        nextSendAt: null,
        status: EmailSequenceEnrollmentStatus.completed,
        completedAt: new Date(),
      },
    });
    return;
  }

  await prisma.emailSequenceEnrollment.update({
    where: { id: enrollmentId },
    data: {
      nextSendAt: nextPending.scheduledAt,
    },
  });
}

export async function pauseEnrollmentById(enrollmentId: string) {
  await prisma.emailSequenceEnrollment.update({
    where: { id: enrollmentId },
    data: { status: EmailSequenceEnrollmentStatus.paused },
  });
}

export async function completeEnrollmentById(enrollmentId: string) {
  await prisma.$transaction([
    prisma.emailSequenceEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: EmailSequenceEnrollmentStatus.completed,
        completedAt: new Date(),
        nextSendAt: null,
      },
    }),
    prisma.emailSequenceStep.updateMany({
      where: {
        enrollmentId,
        status: EmailSequenceStepStatus.pending,
      },
      data: {
        status: EmailSequenceStepStatus.skipped,
      },
    }),
  ]);
}

export async function unsubscribeEnrollmentById(enrollmentId: string) {
  await prisma.$transaction([
    prisma.emailSequenceEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: EmailSequenceEnrollmentStatus.unsubscribed,
        completedAt: new Date(),
        nextSendAt: null,
      },
    }),
    prisma.emailSequenceStep.updateMany({
      where: {
        enrollmentId,
        status: EmailSequenceStepStatus.pending,
      },
      data: {
        status: EmailSequenceStepStatus.skipped,
      },
    }),
  ]);
}

export { WELCOME_SEQUENCE_TYPE };
