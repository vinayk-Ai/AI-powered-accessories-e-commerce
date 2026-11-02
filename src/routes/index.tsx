import { createFileRoute, Link } from "@tanstack/react-router";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowRight, ArrowUpRight, BarChart3, NotebookPen, Package, Zap } from "lucide-react";
import { money } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import { useCountUp } from "@/lib/use-count-up";
import { Badge, Card, buttonVariants } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Byield — Business yield for your accessories shop" },
      { name: "google-site-verification", content: "oE-6FnMAg7cBN5wol4GdN2M7OCo3xLCS36sscigIly8" },
      { name: "description", content: "Byield means business yield: billing and inventory for mobile-accessories distributors in India. Bills in seconds, stock and udhaar tracked, daily profit known." },
      { property: "og:title", content: "Byield — Business yield for your accessories shop" },
      { property: "og:description", content: "Bills in seconds, stock and udhaar tracked, daily profit known. Made for mobile-accessories distributors in India." },
      { property: "og:image", content: "https://www.byield.in/og-image.png" },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Byield",
          url: "https://www.byield.in",
          logo: "https://www.byield.in/logo.svg",
          description: "Billing and inventory software for mobile accessories distributors in India.",
          founder: { "@type": "Person", name: "Vinay Kumar" },
          sameAs: ["https://www.linkedin.com/company/byield-india"],
        },
      },
    ],
  }),
  component: Landing,
});

const week = [31200, 38900, 35400, 42100, 39800, 43080, 48250].map((v, i) => ({ d: i, v }));

function Landing() {
  const { t } = useLang();
  const yieldToday = useCountUp(48250);

  const features = [
    { icon: Zap, title: t("Bills in seconds", "Secondon mein bills"), body: t("Search maal by name or SKU, pick the client, done. Retailer or wholesaler — the right rate applies itself.", "Naam ya SKU se maal dhoondo, client chuno, bas. Retailer ho ya wholesaler — rate khud lag jata hai.") },
    { icon: Package, title: t("Stock that warns you", "Maal jo khud bata de"), body: t("Every cable, cover and charger counted, with a flag on what is running low before a bill gets stuck.", "Har cable, cover aur charger gina hua, aur bill atkne se pehle bata deta hai kya kam ho raha hai.") },
    { icon: NotebookPen, title: t("Udhaar ledger", "Udhaar khata"), body: t("Who owes what, since when — one clean list instead of a notebook full of doubt.", "Kiska kitna baaki hai, kabse — notebook ke shak ke badle ek saaf list.") },
    { icon: BarChart3, title: t("Daily yield report", "Roz ka yield report"), body: t("Sales minus cost, every evening. Know what the business earned, not just what it sold.", "Shaam ko bikri aur laagat ka hisaab. Pata chale business ne kamaya kitna, sirf becha nahi.") },
  ];

  const steps = [
    { n: "1", title: t("Add your maal", "Apna maal add karo"), body: t("Cables, covers, chargers — each with its retail and wholesale rate.", "Cable, cover, charger — har cheez ke retail aur wholesale rate ke saath.") },
    { n: "2", title: t("Make the bill", "Bill banao"), body: t("Search, tap, done — print it or share it on WhatsApp.", "Dhoondo, tap karo, bas — print karo ya WhatsApp par bhejo.") },
    { n: "3", title: t("Track the paisa", "Paisa track karo"), body: t("Paid, partial or udhaar — Byield remembers so you don't have to.", "Paid, partial ya udhaar — Byield yaad rakhta hai, aapko nahi.") },
  ];

  return (
    <div className="space-y-10 animate-fade-up md:space-y-14">
      <section className="grid items-center gap-10 md:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-3 flex items-center gap-1.5">
            <img src="/logo.svg" alt="" className="size-10 shrink-0" />
            <span className="font-sans text-2xl font-semibold tracking-tight text-primary">Byield</span>
          </div>
          <Badge tone="primary">Byield = {t("Business Yield", "Business Yield")}</Badge>
          <h1 className="mt-4 max-w-xl font-serif text-[34px] leading-tight md:text-[52px]">
            {t("Know what your shop truly earns — every single day.", "Jaano aapki dukaan sach mein kya kamati hai — roz.")}
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            {t("Byield is billing and inventory for mobile-accessories distributors in India. Make a bill in seconds, keep stock and udhaar in check, and see your business yield — the profit you actually keep.", "Byield mobile-accessories distributors ke liye billing aur inventory hai. Secondon mein bill banao, maal aur udhaar control mein rakho, aur dekho apna business yield — jo munafa sach mein bacha.")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/bill" className={buttonVariants({ variant: "accent", size: "lg" })}>
              {t("Start a bill", "Bill banana shuru karo")} <ArrowRight />
            </Link>
            <Link to="/aaj" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {t("See today's dashboard", "Aaj ka dashboard dekho")}
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t("Free to try · English & Hindi · Works on any phone", "Muft try karo · English aur Hindi · Har phone par chalta hai")} ·{" "}
            <Link to="/signup" className="font-medium text-primary underline-offset-2 hover:underline">
              {t("Create account", "Account banao")}
            </Link>
          </p>
        </div>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">{t("Today's yield", "Aaj ka yield")}</p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="serif-num text-[40px] leading-none">{money(yieldToday)}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
              <ArrowUpRight className="size-3 stroke-[1.75]" /> +12%
            </span>
          </div>
          <div className="mt-4 h-20" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={week} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
                <YAxis hide domain={["dataMin - 3000", "dataMax + 2000"]} />
                <Line type="monotone" dataKey="v" stroke="currentColor" strokeWidth={1.5} dot={false} isAnimationActive={false} className="text-primary" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 border-t pt-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{t("Profit", "Munafa")}</p>
              <p className="num mt-0.5 font-medium">{money(9640)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("Udhaar pending", "Udhaar baaki")}</p>
              <p className="num mt-0.5 font-medium">{money(186000)}</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="rounded-lg hairline bg-paper px-6 py-5 md:px-8">
        <p className="font-serif text-lg md:text-xl">
          {t("Byield means business yield — not just what your shop sells, but what it keeps.", "Byield ka matlab business yield — sirf dukaan ki bikri nahi, jo haath mein bache.")}
        </p>
      </section>

      <section>
        <h2 className="font-serif text-[26px] md:text-[32px]">{t("Everything a distributor's day needs", "Distributor ke din ki har zaroorat")}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="p-5">
              <span className="grid size-10 place-items-center rounded-md bg-primary-soft text-primary"><f.icon className="size-[18px] stroke-[1.5]" /></span>
              <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-[26px] md:text-[32px]">{t("Three steps to your yield", "Teen step, aur yield aapke saamne")}</h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="rounded-lg hairline bg-card p-5">
              <span className="serif-num text-3xl text-primary">{s.n}</span>
              <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-lg bg-primary px-6 py-10 text-primary-foreground md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-[26px] md:text-[34px]">{t("Your yield, visible from day one.", "Aapka yield, pehle din se nazar.")}</h2>
            <p className="mt-2 max-w-md text-sm text-primary-foreground/70">
              {t("No setup headache. Open Byield, add your maal, and make your first bill today.", "Koi setup jhanjhat nahi. Byield kholo, maal add karo, aur aaj hi pehla bill banao.")}
            </p>
          </div>
          <Link to="/bill" className={cn(buttonVariants({ variant: "accent", size: "lg" }))}>
            {t("Make your first bill", "Pehla bill banao")} <ArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
