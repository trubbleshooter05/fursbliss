type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What's included in Premium?",
    answer:
      "Premium includes daily health tracking, AI trend alerts, supplement optimization guidance, LOY-002 readiness planning, vet-ready reports, and breed-specific longevity insights.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, cancel with one click. No questions asked.",
  },
  {
    question: "What's LOY-002?",
    answer:
      "LOY-002 is a longevity drug candidate for dogs currently progressing through FDA pathways. Premium members get personalized eligibility tracking and action planning.",
  },
  {
    question: "Is my dog's data private?",
    answer: "Yes. Your data stays private and is never sold.",
  },
  {
    question: "What if I'm not satisfied?",
    answer: "Full refund within 30 days, no questions asked.",
  },
];

export function FaqSection() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <h3 className="font-display text-3xl tracking-[-0.02em] text-foreground">FAQ</h3>
      <div className="mt-4 space-y-3">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question} className="group rounded-xl border border-border bg-background p-4">
            <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-foreground">
              {item.question}
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
