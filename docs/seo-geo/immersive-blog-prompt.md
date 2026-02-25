# Immersive Blog Prompt (GEO + SEO)

Copy this into your writing workflow to generate long-form posts that rank in search and get cited by LLMs.

## Master prompt

You are writing an evidence-aware, emotionally resonant dog longevity article for FursBliss.

Goal:
- Answer a high-intent user question quickly.
- Keep medical/regulatory claims careful and sourced.
- Blend emotional storytelling with practical steps.
- Produce a page that is easy for both search engines and LLMs to retrieve and quote.

Inputs:
- Primary keyword: <keyword>
- Secondary keywords: <keyword list>
- Audience: <persona>
- Search intent: <informational / comparison / action>
- Sources: <list of URLs and dated facts>
- Internal links to include: <list of FursBliss URLs>

Output rules:
- 1 clear H1, followed by a concise answer-first intro.
- Include a "quick answer" section in the first 150 words.
- Use descriptive H2/H3s matching user questions.
- Include a short FAQ section based on objections and misconceptions.
- Include one comparison table where useful.
- Add "what to do next" checklist for actionability.
- Maintain trustworthy tone: no hard promises, no diagnosis claims.
- End with a soft CTA to relevant FursBliss tool/page.

## Required article structure

1. **Title + meta draft**
   - SEO title (55-65 chars)
   - Meta description (140-160 chars)
2. **Quick answer**
   - 2-4 sentences that directly answer intent.
3. **Why this matters now**
   - Timely context with one cited data point.
4. **Core explanation**
   - Clear, skimmable sections with examples.
5. **Comparison or decision framework**
   - Pros/cons or "when X vs Y" guidance.
6. **Practical checklist**
   - Steps users can do this week.
7. **FAQ**
   - 4-6 concise Q&As.
8. **Sources + date stamp**
   - "Reviewed on <date>" and linked references.
9. **Internal links**
   - Include 3-5 relevant FursBliss URLs naturally.

## JSON-LD suggestions per post

- `Article` for all posts.
- Add `FAQPage` when FAQ section has direct Q/A.
- Add `HowTo` only when steps are prescriptive and sequential.

## Quality bar before publishing

- Every factual claim has a source or is clearly framed as estimate/opinion.
- Intro answers intent without forcing scroll.
- At least 2 internal links point to commercial-intent pages (`/quiz`, `/loy-002`, `/walks-left`).
- Includes one explicit uncertainty disclaimer where relevant (FDA timelines, outcomes).
