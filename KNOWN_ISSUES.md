# Known Issues

## Current

1. **PostgreSQL SSL warning in build logs**
   - Warning from `pg-connection-string` about future `sslmode` behavior changes.
   - Current impact: warning only, no runtime failure.
   - Follow-up: explicitly set SSL mode policy in DB URLs when standardizing envs.

2. **No persistent product analytics warehouse yet**
   - Event instrumentation is not yet wired to a dedicated analytics backend.
   - Current impact: funnel and cohort analysis require manual log review.
   - Follow-up: connect product events to PostHog/Segment or similar.

3. **ESLint bootstrap prompt on first lint run**
   - `npm run lint` prompts because the project has no committed ESLint config.
   - Current impact: lint cannot run non-interactively in CI until configured.
   - Follow-up: add a committed ESLint config with Next.js plugin.
