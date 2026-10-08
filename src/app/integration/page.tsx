import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integration plan | Scooter License (PoC)",
};

const ACTORS = [
  ["Rider", "Takes the theory test, rides and shows the license QR code when stopped."],
  ["Scooter License service", "Issues licenses, stores test results and answers verification requests."],
  ["E-scooter provider", "Checks the license at ride start and reports practical test results."],
  ["eID service", "Confirms the rider's identity once at registration (one person, one license)."],
  ["Traffic authority", "Verifies licenses at roadside checks and can suspend or revoke them."],
];

const FLOWS = [
  {
    title: "1. Onboarding",
    steps: [
      "The rider opens the Scooter License web app or the onboarding screen embedded in a provider app (SDK or web view).",
      "Identity is verified via eID. The service stores only a pseudonymous identifier and a hash of the identity, never the ID scan.",
      "After the theory test, a license with status “learner” is issued. The rider links it to a provider account with an OAuth-style consent flow, so no license ID needs to be typed in.",
    ],
  },
  {
    title: "2. Ride start",
    steps: [
      "The provider app asks the service: “Is this license valid for riding?” and gets back learner, active, suspended or revoked.",
      "Learners may ride; their rides count toward the practical test. Suspended or revoked licenses block the ride.",
      "Random identity checks (selfie or eID tap) stop people from sharing an account. They run on the provider side, subject to GDPR.",
    ],
  },
  {
    title: "3. Practical test",
    steps: [
      "The provider analyzes ride telemetry on its own side (e.g. sidewalk detection, harsh braking, speeding in pedestrian zones).",
      "Only aggregated per-minute results are sent to the service: ride ID, minutes ridden, minutes passed, issue categories. No GPS tracks.",
      "The service adds up minutes across all providers. Once 120 minutes are reached with at least 90 passed, the license becomes active.",
    ],
  },
  {
    title: "4. Roadside check",
    steps: [
      "The provider app shows a QR code with a signed, short-lived token, not the raw license ID, so it can't be replayed.",
      "Officers scan it with an authority app and check the token's signature against the service's public key, plus the rider's physical ID.",
      "The authority can suspend or revoke the license. Providers are notified via webhook and block new rides.",
    ],
  },
];

const API_SKETCH = `# Provider → Scooter License service (illustrative only, not implemented)

GET  /v1/licenses/{licenseRef}/status
  → { "status": "learner" | "active" | "suspended" | "revoked",
      "practical": { "ridden": 45, "passed": 41, "required": 90, "total": 120 } }

POST /v1/licenses/{licenseRef}/rides
  { "rideId": "…", "providerId": "…", "endedAt": "…",
    "minutes": 18, "passedMinutes": 16, "issues": ["harsh_braking"] }

# Service → provider (webhook)
POST {provider}/webhooks/scooter-license
  { "event": "license.status_changed", "licenseRef": "…", "status": "suspended" }

# Authority app → service
POST /v1/verify   { "token": "<signed QR token>" }
  → { "valid": true, "status": "active", "holder": { "initials": "E.M.", "birthYear": 1990 } }`;

const POC_VS_REAL = [
  ["Identity check", "Simulated button", "eID (e.g. NFC ID card) via certified identity provider"],
  ["Storage", "Browser localStorage", "Scooter License backend with pseudonymous records"],
  ["Practical test", "“Simulate ride” buttons with random results", "Provider-side AI analysis, aggregated results via API"],
  ["QR code", "Static demo string with license ID", "Signed, short-lived token, verifiable offline"],
  ["Revocation", "Not available", "Authority portal + provider webhooks"],
];

export default function IntegrationPage() {
  return (
    <div className="flex flex-col gap-12">
      <header>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">Integration plan</h1>
        <p className="max-w-3xl text-zinc-600 dark:text-zinc-400">
          How Scooter License could work with e-scooter providers, identity services and authorities in a real
          deployment. <strong>None of this is implemented.</strong> This PoC is frontend-only and talks to no
          external system.
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Actors</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACTORS.map(([name, role]) => (
            <div key={name} className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
              <dt className="font-semibold">{name}</dt>
              <dd className="text-sm text-zinc-600 dark:text-zinc-400">{role}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Flows</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {FLOWS.map((flow) => (
            <div key={flow.title} className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900">
              <h3 className="mb-3 font-semibold">{flow.title}</h3>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
                {flow.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">API sketch</h2>
        <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-5 text-xs leading-relaxed text-zinc-100">
          <code>{API_SKETCH}</code>
        </pre>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">This PoC vs. a real deployment</h2>
        <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">Aspect</th>
                <th className="px-4 py-2 font-medium">This PoC</th>
                <th className="px-4 py-2 font-medium">Real deployment</th>
              </tr>
            </thead>
            <tbody>
              {POC_VS_REAL.map(([aspect, poc, real]) => (
                <tr key={aspect} className="border-t border-black/5 dark:border-white/5">
                  <td className="px-4 py-2 font-medium">{aspect}</td>
                  <td className="px-4 py-2">{poc}</td>
                  <td className="px-4 py-2">{real}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Open questions</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Who runs the service: a city, a national authority or an industry consortium?</li>
          <li>How are AI driving assessments audited for fairness and accuracy, and how can riders appeal them?</li>
          <li>Should a car or motorcycle license count automatically, skipping both tests?</li>
          <li>How are tourists without a compatible eID handled?</li>
          <li>How long are practical test results kept, and when are they deleted?</li>
        </ul>
      </section>
    </div>
  );
}
