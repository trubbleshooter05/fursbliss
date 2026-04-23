export type QuickAnswerUrgency = "emergency" | "vet-soon" | "monitor" | "likely-non-urgent";

export type SymptomFaq = { question: string; answer: string };

export type SymptomPageDefinition = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  quickAnswer: {
    urgency: QuickAnswerUrgency;
    /** 2–3 short sentences, plain English */
    body: string;
  };
  vetNowBullets: string[];
  commonReasons: string[];
  nextSteps: string[];
  faqs: SymptomFaq[];
  /** Internal links for “Related symptom guides” */
  relatedSlugs: string[];
};
