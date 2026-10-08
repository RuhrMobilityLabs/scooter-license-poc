# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Scooter License is a research proof of concept for a digital e-scooter driving license. The concept is in `README.md`: an eID-verified registration, then a theory test, then a practical test in which the first 120 ride minutes are analyzed and at least 90 must pass.

Hard constraints for this PoC:
- **Frontend only, no backend.** Never integrate with a real authority, eID service or e-scooter provider API. Identity checks, ride analysis and verification are all simulated in the browser.
- The PoC banner (`PocBanner` in `src/components/site-chrome.tsx`) must stay on every page. The UI must always make clear that this is not a real license.

## Commands

```bash
npm run dev     # dev server (Turbopack) at http://localhost:3000
npm run build   # static export to ./out
npm run lint    # ESLint (eslint-config-next)
```

There is no test suite.

## Architecture

- **Next.js 16 App Router, static export** (`output: "export"` in `next.config.ts`). Anything that needs a server breaks the build: route handlers, server actions, dynamic server functions, `cacheComponents`/PPR. Pages under `src/app/` are thin server components that set `metadata` and render a client component from `src/components/`.
- **State lives in `localStorage`** through `src/lib/license.ts`. It is a small external store (key `scooter-license:v1`) read with `useLicense()`, which wraps `useSyncExternalStore`. `useLicense()` returns `undefined` during SSR and prerender, then `License | null` after hydration. Client components render nothing while the value is `undefined`, which avoids hydration mismatches. Writes go through `saveLicense` / `clearLicense`, which notify subscribers, so every component re-renders without prop drilling. If you change the `License` shape, bump the storage key or handle old data.
- **License status is derived, not stored.** `licenseStatus()` and `practicalProgress()` compute learner, active or failed from `practical.rides`, using the thresholds `PRACTICAL_TOTAL_MINUTES` and `PRACTICAL_REQUIRED_MINUTES`. `simulateRide()` stands in for the provider's AI ride analysis.
- **Wizard** (`src/components/apply-wizard.tsx`): a single client component whose step state machine goes details → identity → theory → result. The license is created and saved when a passing test is submitted. Theory questions and the pass threshold are in `src/lib/questions.ts`.
- **`/integration`** is a static page describing how providers, eID and authorities could integrate in a real deployment, including an API sketch. Keep it in sync if the concept changes. It documents ideas only; nothing there is implemented.
- Styling uses Tailwind v4 utility classes inline. Dark mode follows `prefers-color-scheme` through `dark:` variants. The QR code comes from `qrcode.react`.
