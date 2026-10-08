"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  type License,
  type LicenseStatus,
  PRACTICAL_REQUIRED_MINUTES,
  PRACTICAL_TOTAL_MINUTES,
  clearLicense,
  licenseStatus,
  practicalProgress,
  qrPayload,
  saveLicense,
  simulateRide,
  useLicense,
} from "@/lib/license";

const buttonPrimary =
  "rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40";
const buttonSecondary =
  "rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20 dark:hover:bg-white/10";

const STATUS: Record<LicenseStatus, { label: string; badge: string }> = {
  "practical-pending": { label: "Learner: practical test pending", badge: "bg-amber-300 text-amber-950" },
  active: { label: "Valid: full license", badge: "bg-emerald-300 text-emerald-950" },
  "practical-failed": { label: "Practical test not passed", badge: "bg-red-300 text-red-950" },
};

function formatDate(iso: string, timeZone?: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone });
}

export function LicenseView() {
  const license = useLicense();

  if (license === undefined) return null;

  if (!license) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-black/10 p-8 text-center dark:border-white/10">
        <h1 className="mb-2 text-2xl font-semibold">No license yet</h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Pass the theory test to get your digital e-scooter license.
        </p>
        <Link href="/apply" className={buttonPrimary}>
          Get started
        </Link>
      </div>
    );
  }

  const status = licenseStatus(license);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Your digital license</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          In practice, this card would appear in the app of any participating e-scooter provider.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <LicenseCard license={license} status={status} />
        <NextSteps license={license} status={status} />
      </div>

      <RideLog license={license} />

      <div className="border-t border-black/10 pt-6 dark:border-white/10">
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Delete the demo license from this browser?")) clearLicense();
          }}
          className="text-sm text-red-600 hover:underline dark:text-red-400"
        >
          Delete demo license
        </button>
      </div>
    </div>
  );
}

function LicenseCard({ license, status }: { license: License; status: LicenseStatus }) {
  const { ridden, passed } = practicalProgress(license);
  return (
    <article
      aria-label="Digital e-scooter license"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-900 p-6 text-white shadow-xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 right-0 rotate-12 text-[7rem] font-black uppercase tracking-tighter text-white/10 select-none"
      >
        Demo
      </div>
      <header className="relative mb-5 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/70">E-scooter operator license</p>
          <p className="text-xl font-semibold">🛴 Scooter License</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS[status].badge}`}>
          {STATUS[status].label}
        </span>
      </header>

      <div className="relative flex flex-col gap-5 sm:flex-row">
        <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div className="col-span-2">
            <dt className="text-xs uppercase tracking-wide text-white/60">Holder</dt>
            <dd className="text-lg font-semibold">
              {license.holder.firstName} {license.holder.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-white/60">Date of birth</dt>
            {/* Date-only value parses as UTC midnight; format in UTC so it doesn't shift a day. */}
            <dd>{formatDate(license.holder.dateOfBirth, "UTC")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-white/60">Issued</dt>
            <dd>{formatDate(license.issuedAt)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs uppercase tracking-wide text-white/60">License ID</dt>
            <dd className="font-mono text-base tracking-wider">{license.id}</dd>
          </div>
        </dl>
        <div className="self-start rounded-xl bg-white p-2">
          <QRCodeSVG value={qrPayload(license)} size={112} level="M" />
        </div>
      </div>

      <ul className="relative mt-6 flex flex-col gap-2 border-t border-white/20 pt-4 text-sm">
        <li className="flex flex-wrap justify-between gap-x-3">
          <span>✅ Theory test</span>
          <span className="font-medium">
            Passed ({license.theory.score}/{license.theory.total})
          </span>
        </li>
        <li className="flex flex-wrap justify-between gap-x-3">
          <span>{status === "active" ? "✅" : status === "practical-failed" ? "❌" : "⏳"} Practical test</span>
          <span className="font-medium">
            {status === "active" ? "Passed" : status === "practical-failed" ? "Not passed" : "Pending"} ({passed}/
            {PRACTICAL_REQUIRED_MINUTES} safe min, {ridden}/{PRACTICAL_TOTAL_MINUTES} ridden)
          </span>
        </li>
      </ul>
      <p className="relative mt-4 text-[11px] text-white/60">
        Demo only. Not a valid driving license.
      </p>
    </article>
  );
}

function NextSteps({ license, status }: { license: License; status: LicenseStatus }) {
  const { ridden, passed } = practicalProgress(license);
  const remaining = PRACTICAL_TOTAL_MINUTES - ridden;

  const ride = (risky: boolean) => {
    const r = simulateRide(license, risky);
    saveLicense({ ...license, practical: { rides: [...license.practical.rides, r] } });
  };

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-black/10 p-6 dark:border-white/10">
      {status === "practical-pending" && (
        <>
          <h2 className="text-xl font-semibold">Next: take a few rides 🛴</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            You passed the theory test and may now ride as a learner. To complete your license, ride with any
            participating provider. Your first {PRACTICAL_TOTAL_MINUTES} minutes are analyzed automatically; you need
            to ride safely in at least {PRACTICAL_REQUIRED_MINUTES} of them.
          </p>
        </>
      )}
      {status === "active" && (
        <>
          <h2 className="text-xl font-semibold">🎉 You&apos;re fully licensed</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            You passed both tests. Your license is active with every participating provider. Ride safely!
          </p>
        </>
      )}
      {status === "practical-failed" && (
        <>
          <h2 className="text-xl font-semibold">Practical test not passed</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            You rode safely in only {passed} of {PRACTICAL_TOTAL_MINUTES} minutes ({PRACTICAL_REQUIRED_MINUTES}{" "}
            required). In a real system, you might be asked to take a refresher course before retrying.
          </p>
        </>
      )}

      <div>
        <div className="mb-1.5 flex justify-between text-sm">
          <span>Practical test progress</span>
          <span className="text-zinc-500">
            {ridden}/{PRACTICAL_TOTAL_MINUTES} min
          </span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="absolute inset-y-0 left-0 bg-red-400"
            style={{ width: `${(ridden / PRACTICAL_TOTAL_MINUTES) * 100}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-emerald-600"
            style={{ width: `${(passed / PRACTICAL_TOTAL_MINUTES) * 100}%` }}
          />
          <div
            className="absolute inset-y-0 w-0.5 bg-zinc-900 dark:bg-white"
            style={{ left: `${(PRACTICAL_REQUIRED_MINUTES / PRACTICAL_TOTAL_MINUTES) * 100}%` }}
            title={`${PRACTICAL_REQUIRED_MINUTES} min required`}
          />
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">
          Green: safe minutes · Red: minutes with issues · Line: {PRACTICAL_REQUIRED_MINUTES} min pass mark
        </p>
      </div>

      <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
        <p className="mb-3 text-sm font-medium">Demo: simulate provider ride data</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => ride(false)} disabled={remaining <= 0} className={buttonPrimary}>
            Simulate safe ride
          </button>
          <button type="button" onClick={() => ride(true)} disabled={remaining <= 0} className={buttonSecondary}>
            Simulate risky ride
          </button>
          {license.practical.rides.length > 0 && (
            <button
              type="button"
              onClick={() => saveLicense({ ...license, practical: { rides: [] } })}
              className={buttonSecondary}
            >
              Reset rides
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function RideLog({ license }: { license: License }) {
  const rides = license.practical.rides;
  if (rides.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">Analyzed rides</h2>
      <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Duration</th>
              <th className="px-4 py-2 font-medium">Safe minutes</th>
              <th className="px-4 py-2 font-medium">Issues detected</th>
            </tr>
          </thead>
          <tbody>
            {rides.map((r, i) => (
              <tr key={r.at + i} className="border-t border-black/5 dark:border-white/5">
                <td className="px-4 py-2 tabular-nums">{i + 1}</td>
                <td className="px-4 py-2 tabular-nums">{r.minutes} min</td>
                <td className="px-4 py-2 tabular-nums">{r.passedMinutes} min</td>
                <td className="px-4 py-2">{r.issues.length ? r.issues.join(", ") : "None"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
