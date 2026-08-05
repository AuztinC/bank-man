import Image from "next/image";
import Link from "next/link";

const features = [
  {
    eyebrow: "One clear view",
    title: "See the whole picture",
    description:
      "Bring balances, spending, and monthly progress together without digging through disconnected screens.",
  },
  {
    eyebrow: "Plans that breathe",
    title: "Plan without pressure",
    description:
      "Build a monthly plan around real life, then adjust it as your priorities and routines change.",
  },
  {
    eyebrow: "Yours by default",
    title: "Keep every dollar private",
    description:
      "Your financial records stay isolated to your account, with security enforced where the data lives.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-line/80 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-xl bg-accent text-sm font-bold text-white shadow-sm"
            >
              BM
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Bank, Man!
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-7 text-sm font-medium text-muted md:flex"
          >
            <a className="transition hover:text-foreground" href="#why">
              Why Bank, Man?
            </a>
            <a className="transition hover:text-foreground" href="#features">
              What you&apos;ll see
            </a>
          </nav>

          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sidebar px-4 text-sm font-semibold text-white transition hover:bg-sidebar/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Open dashboard
          </Link>
        </div>
      </header>

      <main>
        <section className="overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:py-24">
            <div className="relative z-10">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                Personal finance, softened
              </p>
              <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Feel at home with your money.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
                A calmer way to understand your spending, build a plan, and make
                progress without turning your finances into another full-time
                job.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar"
                >
                  Explore the dashboard
                </Link>
                <a
                  href="#features"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface px-6 text-sm font-semibold transition hover:border-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  See how it works
                </a>
              </div>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-accent-soft/70 blur-2xl"
              />
              <div className="overflow-hidden rounded-[2rem] border border-line bg-surface p-2 shadow-[0_28px_80px_rgba(64,55,43,0.16)]">
                <Image
                  src="/images/home-hero.png"
                  alt="Person calmly reviewing a monthly plan at a sunlit table"
                  width={1536}
                  height={1024}
                  priority
                  sizes="(min-width: 1024px) 54vw, 100vw"
                  className="aspect-[4/3] w-full rounded-[1.55rem] object-cover"
                />
              </div>
              <div className="absolute -bottom-5 left-5 rounded-2xl border border-line bg-surface px-5 py-4 shadow-[0_16px_45px_rgba(64,55,43,0.14)] sm:left-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  This month
                </p>
                <p className="mt-1 text-lg font-semibold">
                  Clear, not perfect.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="why"
          aria-labelledby="why-heading"
          className="px-4 sm:px-6 lg:px-10"
        >
          <div className="mx-auto max-w-7xl rounded-3xl bg-sidebar px-6 py-8 text-white sm:px-8">
            <h2 id="why-heading" className="sr-only">
              Why Bank, Man?
            </h2>
            <div className="grid gap-6 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
              {[
                ["Private by design", "Your records stay yours."],
                ["Built for real life", "Plans can change with you."],
                ["Clear monthly planning", "Know what is left at a glance."],
              ].map(([title, description]) => (
                <div key={title} className="sm:px-6 first:sm:pl-0 last:sm:pr-0">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-white/65">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="features"
          aria-labelledby="features-heading"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-10"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              A gentler rhythm
            </p>
            <h2
              id="features-heading"
              className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl"
            >
              Useful clarity, without the noise.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className={`rounded-3xl border border-line p-6 shadow-[0_12px_40px_rgba(64,55,43,0.05)] ${
                  index === 1 ? "bg-sage-soft" : "bg-surface"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {feature.eyebrow}
                </p>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-surface-muted/60">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-10 lg:py-20">
            <div className="overflow-hidden rounded-[2rem] border border-line bg-surface p-2 shadow-[0_20px_60px_rgba(64,55,43,0.12)]">
              <Image
                src="/images/home-planning.png"
                alt="Hands making a simple monthly plan beside a laptop and coffee"
                width={1536}
                height={1024}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="aspect-[4/3] w-full rounded-[1.55rem] object-cover"
              />
            </div>

            <div className="lg:pl-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage">
                A monthly practice
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Make a plan you will actually revisit.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
                Start with the accounts and categories you already understand.
                See where the month stands, make one thoughtful adjustment, and
                get back to living.
              </p>
              <Link
                href="/dashboard"
                className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-sidebar px-6 text-sm font-semibold text-white transition hover:bg-sidebar/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Preview your workspace
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
          <div className="mx-auto max-w-5xl rounded-[2.25rem] bg-accent px-6 py-12 text-center text-white shadow-[0_24px_70px_rgba(130,70,45,0.22)] sm:px-12 sm:py-16">
            <h2 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              Your finances can feel lighter.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/75">
              Step into a workspace built to make the next decision clearer, not
              louder.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-surface px-6 text-sm font-semibold text-foreground transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar"
            >
              Open the dashboard
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <p className="font-semibold text-foreground">Bank, Man!</p>
          <p>A calmer place for the numbers that shape everyday life.</p>
        </div>
      </footer>
    </div>
  );
}
