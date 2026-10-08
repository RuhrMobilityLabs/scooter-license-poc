import Link from "next/link";

const STEPS = [
  {
    title: "Register",
    text: "Sign up with your government-issued ID. In this PoC, you enter dummy details and the ID check is simulated.",
  },
  {
    title: "Theory test",
    text: "Answer a short quiz about safe e-scooter riding. Pass it and you receive your license ID.",
  },
  {
    title: "Practical test",
    text: "Your first 120 minutes of rides with any participating provider are analyzed. Ride safely in at least 90 of them.",
  },
  {
    title: "Ride freely",
    text: "Once both tests are passed, your digital license is active and works with every compliant provider.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-start gap-6">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
          Research prototype
        </span>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          A digital, privacy-preserving driving license for rental e-scooters.
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Scooter License explores how cities and e-scooter providers could make sure riders know the rules,
          without paper licenses, driving schools or one provider-specific onboarding per app.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/apply"
            className="rounded-full bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700"
          >
            Get started
          </Link>
          <Link
            href="/integration"
            className="rounded-full border border-black/15 px-6 py-3 font-medium transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            How it would integrate
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="rounded-2xl border border-black/10 p-5 dark:border-white/10"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                {i + 1}
              </div>
              <h3 className="mb-1 font-semibold">{step.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["One license, every provider", "Pass once and ride with any compliant e-scooter sharing service."],
          ["Privacy first", "Providers share only per-minute pass/fail results, not your location history."],
          ["Easy to check", "Show the QR code in your provider app together with your ID if you are stopped."],
        ].map(([title, text]) => (
          <div key={title} className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900">
            <h3 className="mb-1 font-semibold">{title}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
