import Link from "next/link";

export function PocBanner() {
  return (
    <div
      role="note"
      className="sticky top-0 z-50 bg-amber-400 px-4 py-2 text-center text-sm font-medium text-amber-950"
    >
      🚧 Research proof of concept. This is <strong>not</strong> a real driving license and has no legal
      validity. All data is dummy data and stays in your browser.
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          🛴 Scooter License
        </Link>
        <div className="flex gap-5 text-sm">
          <Link href="/license" className="hover:underline">
            My license
          </Link>
          <Link href="/integration" className="hover:underline">
            Integration plan
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/10 px-4 py-6 text-center text-xs text-zinc-500 dark:border-white/10">
      Scooter License by RuhrMobilityLabs (proof of concept, no real license) - 
      <a className="pl-1 text-sky-400" href="https://github.com/RuhrMobilityLabs/scooter-license">GitHub</a>
    </footer>
  );
}
