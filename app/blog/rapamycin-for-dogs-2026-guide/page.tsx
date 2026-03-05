import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { InlineEmailCapture } from "@/components/blog/inline-email-capture";
import { BlogBottomCTA } from "@/components/blog/blog-bottom-cta";

const SHARE_IMAGE_URL = "/opengraph-image";
const PUBLISHED_AT = "2026-02-20T00:00:00.000Z";
const UPDATED_AT = "2026-02-20T00:00:00.000Z";

export const metadata: Metadata = {
  title: "Rapamycin for Dogs in 2026: What Every Senior Dog Owner Should Know | FursBliss",
  description:
    "Rapamycin is already being prescribed off-label for dogs. Here's what the research shows, what it costs, the risks, and how it compares to LOY-002.",
  alternates: {
    canonical: "/blog/rapamycin-for-dogs-2026-guide",
  },
  openGraph: {
    title: "Rapamycin for Dogs in 2026: What Every Senior Dog Owner Should Know",
    description:
      "Rapamycin is already being prescribed off-label for dogs. Here's what the research shows, what it costs, the risks, and how it compares to LOY-002.",
    url: "/blog/rapamycin-for-dogs-2026-guide",
    type: "article",
    images: [SHARE_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rapamycin for Dogs in 2026: What Every Senior Dog Owner Should Know",
    description:
      "Rapamycin is already being prescribed off-label for dogs. Here's what the research shows, what it costs, the risks, and how it compares to LOY-002.",
    images: [SHARE_IMAGE_URL],
  },
};

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Rapamycin for Dogs in 2026: What Every Senior Dog Owner Should Know",
  description:
    "Rapamycin is already being prescribed off-label for dogs. Here's what the research shows, what it costs, the risks, and how it compares to LOY-002.",
  datePublished: PUBLISHED_AT,
  dateModified: UPDATED_AT,
  author: {
    "@type": "Organization",
    name: "FursBliss",
  },
  publisher: {
    "@type": "Organization",
    name: "FursBliss",
  },
  mainEntityOfPage: "https://www.fursbliss.com/blog/rapamycin-for-dogs-2026-guide",
};

export default function RapamycinForDogsGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 md:py-14">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ARTICLE_JSON_LD),
          }}
        />
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Blog - Feb 20, 2026
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            Rapamycin for Dogs in 2026: What Every Senior Dog Owner Should Know
          </h1>
          <p className="text-muted-foreground">
            Rapamycin is already being prescribed off-label by some veterinarians. Here's what 
            the science shows, what it costs, and what you need to consider before asking your vet.
          </p>
        </div>

        <Card className="mt-8 rounded-2xl border-border bg-card">
          <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Disclaimer:</strong> FursBliss provides educational 
              information only. We are not veterinarians. This post synthesizes publicly available 
              research and does not constitute medical advice. Always consult a licensed veterinarian 
              before starting, stopping, or changing any medication or supplement for your dog.
            </p>
          </CardContent>
        </Card>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">
            What is rapamycin and how does it work in dogs?
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Rapamycin (also called sirolimus) is an FDA-approved drug in humans, originally used 
              as an immunosuppressant after organ transplants. In lower doses, it's being studied 
              for its potential to extend healthspan and lifespan by targeting a cellular pathway 
              called mTOR (mechanistic target of rapamycin).
            </p>
            <p>
              <strong className="text-foreground">mTOR inhibition:</strong> The mTOR pathway regulates 
              cell growth, metabolism, and aging. When overactive, it's linked to accelerated aging, 
              inflammation, and age-related diseases. Rapamycin "dials down" mTOR activity, mimicking 
              some benefits of caloric restriction without requiring your dog to eat less.
            </p>
            <p>
              <strong className="text-foreground">Immune modulation:</strong> At the doses being studied 
              for longevity (much lower than transplant doses), rapamycin may improve immune function 
              in aging dogs rather than suppress it. Early research suggests it can help "reset" the 
              aging immune system.
            </p>
            <p>
              In lab studies, rapamycin extended lifespan in mice by 9-14%. The question for dog 
              owners: does it translate to companion animals?
            </p>
          </div>
        </section>

        {/* Inline email capture after first major section */}
        <InlineEmailCapture slug="rapamycin-for-dogs-2026-guide" />

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">
            The Dog Aging Project TRIAD trial — what we know so far
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              The largest rapamycin study in dogs is the <strong className="text-foreground">TRIAD 
              (Test of Rapamycin in Aging Dogs)</strong> trial, run by the University of Washington's 
              Dog Aging Project. It's funded by a $7 million NIH grant and aims to enroll 580 dogs 
              aged 7+ years, weighing 44+ pounds.
            </p>
            <p>
              <strong className="text-foreground">Current status (Feb 2026):</strong> Over 180 dogs 
              enrolled so far. The trial is ongoing, with results expected by 2029.
            </p>
            <p>
              <strong className="text-foreground">What they're measuring:</strong> The trial tracks 
              cardiac function, cognitive performance, immune markers, and overall healthspan. Unlike 
              pharmaceutical trials, TRIAD is a research study — not an FDA approval pathway.
            </p>
            <p>
              <strong className="text-foreground">Prior research:</strong> A 2016 pilot study at Texas 
              A&M showed that 10 weeks of rapamycin improved heart function in middle-aged dogs. 
              A 2017 follow-up found no significant side effects in dogs given low-dose rapamycin 
              for 10 weeks.
            </p>
            <p>
              The Dog Aging Project also runs an open observational study where owners can report 
              their dogs' experience with rapamycin prescribed by their own vet. This data feeds 
              into the broader research effort.
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">
            Off-label prescribing — yes, your vet can prescribe it now
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Here's what many senior dog owners don't realize: <strong className="text-foreground">
              rapamycin is already available</strong>. It's an FDA-approved drug for humans, which 
              means veterinarians can legally prescribe it "off-label" for dogs.
            </p>
            <p>
              <strong className="text-foreground">Off-label use</strong> means using an approved drug 
              for a purpose not listed on the official label. It's common in veterinary medicine — 
              many drugs used daily in vet clinics are human medications prescribed off-label.
            </p>
            <p>
              Some progressive veterinarians are already prescribing rapamycin for healthy aging in 
              senior dogs, typically starting around age 7-10. Others are waiting for more data before 
              recommending it outside of clinical trials.
            </p>
            <p>
              <strong className="text-foreground">The catch:</strong> Because it's not officially 
              approved for longevity in dogs, insurance won't cover it, and dosing protocols vary 
              between vets. You're relying on your vet's judgment and emerging research, not 
              standardized guidelines.
            </p>
            <p>
              If you're interested, the conversation typically starts with: "I've been reading about 
              the Dog Aging Project's rapamycin research. Is this something you'd consider for 
              [dog name] given their age and health status?"
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">
            Dosing, cost, and side effects reported in dogs
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Typical dosing (based on TRIAD and off-label use):</strong>
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>
                <strong className="text-foreground">Weekly dosing:</strong> Most protocols use once-weekly 
                dosing rather than daily. Common range: 0.05-0.15 mg/kg body weight per week.
              </li>
              <li>
                <strong className="text-foreground">Example:</strong> A 50-pound (22.7 kg) dog might 
                receive 1-3 mg of rapamycin once per week.
              </li>
              <li>
                <strong className="text-foreground">Adjustment period:</strong> Vets often start at 
                the lower end and adjust based on bloodwork and response.
              </li>
            </ul>
            <p className="mt-3">
              <strong className="text-foreground">Cost:</strong>
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>
                Generic rapamycin (sirolimus): approximately $30-80/month for a 50-pound dog, depending 
                on dose and pharmacy.
              </li>
              <li>
                Add vet visit costs for initial consultation, baseline bloodwork, and periodic monitoring 
                (typically every 3-6 months).
              </li>
              <li>
                Total first-year cost estimate: $800-1,500 including monitoring.
              </li>
            </ul>
            <p className="mt-3">
              <strong className="text-foreground">Reported side effects (from TRIAD and observational data):</strong>
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>
                <strong className="text-foreground">Diarrhea:</strong> The most common side effect, 
                typically mild and temporary. Usually resolves within the first few weeks or with 
                dose adjustment.
              </li>
              <li>
                <strong className="text-foreground">Decreased appetite:</strong> Some dogs eat less 
                initially. Monitoring weight is important.
              </li>
              <li>
                <strong className="text-foreground">Elevated cholesterol/triglycerides:</strong> Can 
                occur but is usually manageable. Bloodwork monitoring catches this early.
              </li>
              <li>
                <strong className="text-foreground">Rare: delayed wound healing or increased infection 
                risk</strong> (more common at immunosuppressive doses, less common at longevity doses).
              </li>
            </ul>
            <p className="mt-3">
              Most dogs tolerate low-dose rapamycin well. The Dog Aging Project's pilot studies reported 
              a low discontinuation rate due to side effects.
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">
            How rapamycin compares to LOY-002
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              LOY-002 and rapamycin are often mentioned together, but they're fundamentally different 
              approaches to dog longevity. Here's how they compare:
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[740px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-3 text-left font-semibold text-foreground">Category</th>
                  <th className="px-3 py-3 text-left font-semibold text-foreground">LOY-002</th>
                  <th className="px-3 py-3 text-left font-semibold text-foreground">Rapamycin</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/70">
                  <td className="px-3 py-3 text-foreground">Mechanism</td>
                  <td className="px-3 py-3 text-muted-foreground">Caloric restriction mimetic (single metabolic target)</td>
                  <td className="px-3 py-3 text-muted-foreground">mTOR inhibitor (broad cellular pathway)</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-3 py-3 text-foreground">Availability</td>
                  <td className="px-3 py-3 text-muted-foreground">Not yet approved (conditional approval possible 2026-2027)</td>
                  <td className="px-3 py-3 text-muted-foreground">Available now via off-label prescription</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-3 py-3 text-foreground">Evidence level</td>
                  <td className="px-3 py-3 text-muted-foreground">1,300-dog trial in progress; 2 of 3 FDA requirements met</td>
                  <td className="px-3 py-3 text-muted-foreground">580-dog TRIAD trial ongoing; decades of human data; pilot dog studies positive</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-3 py-3 text-foreground">Dosing</td>
                  <td className="px-3 py-3 text-muted-foreground">Daily pill (expected)</td>
                  <td className="px-3 py-3 text-muted-foreground">Weekly pill</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-3 py-3 text-foreground">Regulatory path</td>
                  <td className="px-3 py-3 text-muted-foreground">FDA conditional approval pathway</td>
                  <td className="px-3 py-3 text-muted-foreground">Off-label use of approved human drug</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-3 py-3 text-foreground">Estimated cost</td>
                  <td className="px-3 py-3 text-muted-foreground">Unknown (likely $50-150/month based on Loyal's pricing model)</td>
                  <td className="px-3 py-3 text-muted-foreground">$30-80/month (generic rapamycin)</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-3 py-3 text-foreground">Age eligibility</td>
                  <td className="px-3 py-3 text-muted-foreground">10+ years, 14+ lbs</td>
                  <td className="px-3 py-3 text-muted-foreground">Typically 7+ years, 44+ lbs (TRIAD criteria; off-label varies)</td>
                </tr>
                <tr className="border-b border-border/70 last:border-b-0">
                  <td className="px-3 py-3 text-foreground">Key advantage</td>
                  <td className="px-3 py-3 text-muted-foreground">Purpose-built for dogs; standardized protocol when approved</td>
                  <td className="px-3 py-3 text-muted-foreground">Available now; decades of safety data in humans; lower cost</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>
              For a deeper comparison, see our full side-by-side analysis:{" "}
              <Link href="/blog/loy-002-vs-rapamycin-triad-2026-update" className="text-emerald-700 hover:underline">
                LOY-002 vs Rapamycin: Two Paths to Dog Longevity
              </Link>.
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">
            Should you ask your vet about rapamycin?
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">The balanced take:</strong> Rapamycin shows genuine 
              promise, but we're still in the "promising but early" phase for dogs.
            </p>
            <p>
              <strong className="text-foreground">Consider asking your vet if:</strong>
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Your dog is 7+ years old and in generally good health</li>
              <li>You're willing to commit to regular bloodwork monitoring</li>
              <li>Your vet is familiar with the Dog Aging Project research and comfortable with off-label prescribing</li>
              <li>You understand this is not a "proven" longevity drug yet — it's an informed bet based on early evidence</li>
              <li>You can afford $800-1,500/year including monitoring costs</li>
            </ul>
            <p className="mt-3">
              <strong className="text-foreground">Wait for more data if:</strong>
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Your dog has pre-existing immune issues, wound healing problems, or chronic infections</li>
              <li>You prefer standardized, FDA-approved protocols (LOY-002 may arrive within 1-2 years)</li>
              <li>Your vet isn't comfortable prescribing it off-label yet</li>
              <li>You want to see the full TRIAD trial results before committing</li>
            </ul>
            <p className="mt-3">
              There's no "wrong" choice here. Some owners are comfortable being early adopters based on 
              existing evidence. Others prefer to wait for definitive results. Both are rational positions.
            </p>
            <p>
              <strong className="text-foreground">What you can do now:</strong> Track your dog's baseline 
              health data (weight, energy, symptoms) so you have a clear picture if and when you start 
              any longevity intervention. Whether it's rapamycin, LOY-002, or something else, having 
              before/after data makes the difference between guessing and knowing.
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">
            How FursBliss tracks supplement and drug interactions
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              If you do start rapamycin (or any longevity drug), tracking interactions with other 
              medications and supplements becomes critical. Rapamycin can interact with certain drugs, 
              including some antibiotics, antifungals, and supplements like St. John's Wort.
            </p>
            <p>
              FursBliss includes an interaction checker for logged medications and supplements. You can:
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Log all medications and supplements your dog takes</li>
              <li>Get flagged warnings for known interactions</li>
              <li>Share a clean medication list with your vet before appointments</li>
              <li>Track which combination works (or doesn't work) over time</li>
            </ul>
            <p className="mt-3">
              Our interaction checker cross-references the veterinary drug database and flags combinations 
              that require vet review. It's not a replacement for veterinary judgment — it's a safety net 
              to ensure nothing gets missed.
            </p>
            <p>
              <Link href="/pets" className="text-emerald-700 hover:underline">
                Try the interaction checker
              </Link>{" "}
              or see breed-specific health tracking for{" "}
              <Link href="/breeds/golden-retriever" className="text-emerald-700 hover:underline">
                Golden Retrievers
              </Link>,{" "}
              <Link href="/breeds/labrador-retriever" className="text-emerald-700 hover:underline">
                Labrador Retrievers
              </Link>,{" "}
              <Link href="/breeds/german-shepherd" className="text-emerald-700 hover:underline">
                German Shepherds
              </Link>, and{" "}
              <Link href="/breeds" className="text-emerald-700 hover:underline">
                100+ other breeds
              </Link>.
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">
            The bottom line
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Rapamycin is the most accessible dog longevity option available today. It has decades of 
              human safety data, promising early results in dogs, and a major NIH-funded trial underway.
            </p>
            <p>
              It's also still experimental for longevity purposes. The TRIAD trial won't conclude until 
              2029. Off-label use means you're making a decision with incomplete data — but with more 
              evidence than we've ever had before.
            </p>
            <p>
              If your dog is entering their senior years, the smartest first step isn't choosing a drug. 
              It's establishing baseline health data. Track their weight, energy, symptoms, and vet visits 
              now so you have a clear "before" picture for any intervention you consider later.
            </p>
            <p>
              The goal isn't just more years. It's more good years.
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-2 text-xs text-muted-foreground">
          <p>Sources:</p>
          <ul className="space-y-1">
            <li>- Dog Aging Project: TRIAD trial methodology (GeroScience, 2024)</li>
            <li>- Texas A&M College of Veterinary Medicine: rapamycin cardiac function study (2016)</li>
            <li>- University of Washington: Dog Aging Project enrollment and research updates</li>
            <li>- NIH: TRIAD trial grant announcement and study parameters</li>
            <li>- Kaeberlein Lab: rapamycin dosing protocols and observational data</li>
          </ul>
        </section>

        {/* Inline email capture for LOY-002 updates */}
        <div className="mt-10">
          <InlineEmailCapture slug="rapamycin-for-dogs-2026-guide" />
        </div>

        {/* Bottom of post CTA */}
        <BlogBottomCTA slug="rapamycin-for-dogs-2026-guide" />
      </main>
      <SiteFooter />
    </div>
  );
}
