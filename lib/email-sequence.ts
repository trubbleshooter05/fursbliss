import { differenceInCalendarDays } from "date-fns";

export type QuizEmailStep = {
  step: number;
  minDaysSinceSubmission: number;
  subject: string;
  buildBody: (input: {
    dogName: string;
    breed: string;
    age: number;
    score: number;
    appUrl: string;
  }) => { text: string; html: string };
};

const CTA = (label: string, href: string) =>
  `<p><a href="${href}" style="color:#0D6E6E;font-weight:600;">${label}</a></p>`;

export const quizEmailSequence: QuizEmailStep[] = [
  {
    step: 1,
    minDaysSinceSubmission: 0,
    subject: "Your Longevity Readiness Score",
    buildBody: ({ dogName, score, appUrl }) => ({
      text: `${dogName}'s readiness score is ${score}/100.\n\nView your results: ${appUrl}`,
      html: `<div style="font-family:Arial,sans-serif;color:#111827;"><h2>${dogName}'s Longevity Readiness Score: ${score}/100</h2><p>Here are your personalized recommendations.</p>${CTA(
        "View your full results",
        appUrl
      )}</div>`,
    }),
  },
  {
    step: 2,
    minDaysSinceSubmission: 2,
    subject: "What LOY-002 means for your breed",
    buildBody: ({ breed, appUrl }) => ({
      text: `What LOY-002 means for ${breed} owners.\n\nCheck eligibility: ${appUrl}/longevity-drugs`,
      html: `<div style="font-family:Arial,sans-serif;color:#111827;"><h2>What LOY-002 means for ${breed} owners</h2>${CTA(
        "Check eligibility",
        `${appUrl}/longevity-drugs`
      )}</div>`,
    }),
  },
  {
    step: 3,
    minDaysSinceSubmission: 4,
    subject: "3 supplement mistakes to avoid",
    buildBody: ({ appUrl }) => ({
      text: `Common supplement mistakes can hide interaction risks.\n\nCheck interactions: ${appUrl}/interaction-checker`,
      html: `<div style="font-family:Arial,sans-serif;color:#111827;"><h2>3 supplement mistakes to avoid</h2>${CTA(
        "Check interactions",
        `${appUrl}/interaction-checker`
      )}</div>`,
    }),
  },
  {
    step: 4,
    minDaysSinceSubmission: 7,
    subject: "Inside the 1,300-dog STAY study",
    buildBody: ({ appUrl }) => ({
      text: `1,300 dogs across 70 clinics are in the STAY study.\n\nJoin LOY-002 updates: ${appUrl}/longevity-drugs`,
      html: `<div style="font-family:Arial,sans-serif;color:#111827;"><h2>Inside the 1,300-dog STAY study</h2>${CTA(
        "Join LOY-002 updates",
        `${appUrl}/longevity-drugs`
      )}</div>`,
    }),
  },
  {
    step: 5,
    minDaysSinceSubmission: 10,
    subject: "Your next vet visit checklist",
    buildBody: ({ age, breed, appUrl }) => ({
      text: `What your ${age}-year-old ${breed}'s next vet visit should include.\n\nStart tracking: ${appUrl}/signup`,
      html: `<div style="font-family:Arial,sans-serif;color:#111827;"><h2>Your ${age}-year-old ${breed}'s next vet visit checklist</h2>${CTA(
        "Start tracking",
        `${appUrl}/signup`
      )}</div>`,
    }),
  },
  {
    step: 6,
    minDaysSinceSubmission: 14,
    subject: "Everything we built for senior dog parents",
    buildBody: ({ appUrl }) => ({
      text: `Explore interaction checks, vet reports, photo tracking, reminders, and breed intelligence.\n\nSee Premium: ${appUrl}/pricing`,
      html: `<div style="font-family:Arial,sans-serif;color:#111827;"><h2>Everything we built for senior dog parents</h2>${CTA(
        "See Premium features",
        `${appUrl}/pricing`
      )}</div>`,
    }),
  },
  {
    step: 7,
    minDaysSinceSubmission: 17,
    subject: "Try Premium free for 7 days",
    buildBody: ({ dogName, appUrl }) => ({
      text: `${dogName} is worth it. Try Premium now.\n\nStart trial: ${appUrl}/pricing`,
      html: `<div style="font-family:Arial,sans-serif;color:#111827;"><h2>${dogName} is worth it — try Premium free</h2>${CTA(
        "Start your free trial",
        `${appUrl}/pricing`
      )}</div>`,
    }),
  },
];

export function nextQuizEmailStep(input: {
  createdAt: Date;
  emailSequenceStep: number;
}) {
  const days = differenceInCalendarDays(new Date(), input.createdAt);
  return quizEmailSequence.find(
    (step) =>
      step.step === input.emailSequenceStep + 1 &&
      days >= step.minDaysSinceSubmission
  );
}

