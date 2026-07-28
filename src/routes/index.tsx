import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Lightbulb,
  Lock,
  MessagesSquare,
  Rocket,
  Sparkle,
  Wallet,
} from "lucide-react";

import { PaisaWiseMark, PaisaWiseWordmark } from "@/components/paisawise/brand";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const FAQ = [
  {
    q: "Is PaisaWise free?",
    a: "Yes. Open the assistant and start logging expenses — there is no paywall, no trial timer and no card required.",
  },
  {
    q: "Do I need to sign up?",
    a: "A quick sign-up with your email keeps your data safe across sessions. No OTP, no phone number, no card required.",
  },
  {
    q: "Where is my spending data stored?",
    a: "In your PaisaWise account, so it follows you across devices. You can clear your ledger or delete your account and all its data at any time.",
  },
  {
    q: "Does it understand UPI apps like GPay and PhonePe?",
    a: "It does. PaisaWise treats gpay, phonepe and paytm as the payment method, then looks for the real purpose — so 'gpay 500 rent share' is logged under Bills, not shopping.",
  },
  {
    q: "Can I paste my whole day at once?",
    a: "Absolutely. Dump one expense per line and you get a flashcard for each, plus a full category snapshot underneath.",
  },
];

const FEATURES = [
  {
    icon: MessagesSquare,
    title: "Type like you talk",
    body: "\u201c1.2k myntra shoes\u201d, \u201cauto to college 30\u201d, \u201cRs. 500 rent share\u201d — amounts anywhere, k-notation, rupee symbols. It all parses.",
  },
  {
    icon: Sparkle,
    title: "Built for India",
    body: "Auto, mess, xerox, recharge, chai, rapido, blinkit — categorised the way students actually spend, not a US budgeting app's guess.",
  },
  {
    icon: ClipboardList,
    title: "Bulk paste your day",
    body: "One expense per line. PaisaWise splits it, categorises each entry and gives you a flashcard for every one.",
  },
  {
    icon: BarChart3,
    title: "Visual snapshot",
    body: "Category bars, percentages and a running total — you see where the money leaked in one glance.",
  },
  {
    icon: Lightbulb,
    title: "Savings tips in rupees",
    body: "Not generic advice. Real numbers tied to what you actually spent, framed as things you care about.",
  },
  {
    icon: Rocket,
    title: "Student hustle nudges",
    body: "Freelancing, campus jobs, selling notes, ₹100 SIPs, student discounts — realistic ways to grow the other side of the equation.",
  },
  {
    icon: Wallet,
    title: "Running dashboard",
    body: "All-time and weekly totals per category, built up automatically from every expense you log.",
  },
  {
    icon: Lock,
    title: "Your data, your call",
    body: "Your ledger is yours. Clear it or delete your account and everything goes with it, no questions asked.",
  },
];

const CATEGORIES = [
  "🍕 Food",
  "🚗 Travel",
  "📚 Education",
  "🎬 Entertainment",
  "🛍️ Shopping",
  "📱 Bills",
  "📦 Other",
];

const DEMO_OUTPUT = `┌─────────────────────────────┐
│ 🍕 FOOD                     │
│ ₹250 · Zomato               │
│ dinner with friends         │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 🚗 TRAVEL                   │
│ ₹30 · —                     │
│ auto to college             │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 🛍️ SHOPPING                 │
│ ₹1,500 · Amazon             │
│ earphones                   │
└─────────────────────────────┘

📊 SPENDING SNAPSHOT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛍️ Shopping  ₹1,500  ███████████████  84%
🍕 Food      ₹  250  ███░░░░░░░░░░░░  14%
🚗 Travel    ₹   30  █░░░░░░░░░░░░░░   2%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Total: ₹1,780`;

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "PaisaWise — Smart Expense Assistant for Indian Students" },
      {
        name: "description",
        content:
          "PaisaWise turns casual expense notes like '250 zomato dinner' into flashcards, category charts and savings tips. Built for Indian college students.",
      },
      { property: "og:title", content: "PaisaWise — Smart Expense Assistant for Indian Students" },
      {
        property: "og:description",
        content:
          "PaisaWise turns casual expense notes like '250 zomato dinner' into flashcards, category charts and savings tips. Built for Indian college students.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "PaisaWise",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          description:
            "A smart expense assistant for Indian college students that turns plain-language spending notes into flashcards, category charts and savings tips.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-svh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <PaisaWiseWordmark markSize={32} eager />
        <nav className="flex items-center gap-1 sm:gap-3">
          <a
            href="#features"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Features
          </a>
          <a
            href="#faq"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            FAQ
          </a>
          <Button asChild size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="pw-grain relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <PaisaWiseMark size={16} eager /> For Indian college students
            </p>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
              PAISA<span className="text-brand">WISE</span>
            </h1>
            <p className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Track chai to college fees — and actually save.
            </p>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Type your spending the way you'd text a friend. PaisaWise turns it into expense
              flashcards, a category-wise snapshot and savings tips priced in real rupees.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth">
                  Start tracking free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how">See how it works</a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free forever · No card required
            </p>
          </div>

          <div className="rounded-3xl border bg-card p-4 shadow-warm">
            <div className="rounded-2xl bg-secondary p-3 font-mono text-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                You type
              </p>
              <pre className="mt-2 whitespace-pre-wrap text-foreground">
{`250 zomato dinner
30 auto college
1500 amazon earphones`}
              </pre>
            </div>
            <p className="px-1 pt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              PaisaWise replies
            </p>
            <pre className="mt-2 overflow-x-auto rounded-2xl border bg-background p-3 font-mono text-[11px] leading-snug sm:text-xs">
              {DEMO_OUTPUT}
            </pre>
            <p className="mt-3 rounded-xl bg-mint-soft px-3 py-2 text-sm text-mint-foreground">
              💡 TIP: ₹1,500 on earphones is fine if you needed them — but Croma student offers
              could've saved you ₹200–300.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-16">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
          Everything a student wallet actually needs
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Not a corporate budgeting tool with a student skin. PaisaWise is built around how hostel,
          mess and UPI spending really works.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border bg-card p-5 transition-colors hover:border-brand"
            >
              <feature.icon className="size-6 text-brand" />
              <h3 className="mt-4 font-display text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-16 border-y bg-secondary/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Three steps. That's it.</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Type it",
                body: "\u201c120 chai and snacks\u201d or paste your whole day at once. No forms, no dropdowns.",
              },
              {
                title: "Get flashcards",
                body: "Every entry comes back categorised, with the merchant, the note and a clean snapshot chart.",
              },
              {
                title: "Save more",
                body: "A tip tied to your real numbers, plus a hustle nudge when it's time to grow your income.",
              },
            ].map((step, index) => (
              <li key={step.title} className="rounded-2xl border bg-card p-6">
                <span className="font-display text-4xl font-extrabold text-brand">
                  0{index + 1}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Seven categories, sorted automatically
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <li
                  key={category}
                  className="rounded-full border bg-card px-4 py-2 text-sm font-medium"
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-16 px-5 py-16">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Questions, answered</h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQ.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left font-display text-base font-bold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="pw-grain rounded-3xl border bg-card p-10 text-center shadow-warm">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Your ₹ deserves better decisions.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Log one expense right now and see where your month is actually heading.
          </p>
          <Button asChild size="lg" className="mt-6 gap-2">
            <Link to="/auth">
              Start tracking free <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <PaisaWiseWordmark markSize={24} />
          <p>Built by Sujay Gopal · Track chai to college fees — and actually save.</p>
        </div>
      </footer>
    </div>
  );
}
