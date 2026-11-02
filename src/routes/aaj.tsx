import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowUpRight, PackageMinus, BellRing, FilePen, Plus, X, ChevronRight } from "lucide-react";
import { getDashboard, getRecentBills, type Bill } from "@/lib/api";
import { money, longDate } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import { useCountUp } from "@/lib/use-count-up";
import { Button, Card, StatusBadge, buttonVariants } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/aaj")({
  head: () => ({
    meta: [
      { title: "Aaj — Byield" },
      { name: "description", content: "Today's sales, profit, pending udhaar and tasks at a glance." },
      { property: "og:title", content: "Aaj — Byield" },
      { property: "og:description", content: "Today's sales, profit, pending udhaar and tasks at a glance." },
    ],
  }),
  loader: async () => ({ dash: await getDashboard(), bills: await getRecentBills() }),
  component: Home,
});

function Home() {
  const { dash, bills } = Route.useLoaderData();
  const { t } = useLang();
  const sales = useCountUp(dash.todaySales);
  const [open, setOpen] = useState<Bill | null>(null);

  const tasks = [
    { icon: PackageMinus, tone: "text-warning bg-warning-soft", text: t(`${dash.tasks.lowStock} items running low`, `${dash.tasks.lowStock} items kam bache hain`), cta: "Reorder" },
    { icon: BellRing, tone: "text-destructive bg-destructive-soft", text: t(`${dash.tasks.clientsDue} clients have dues`, `${dash.tasks.clientsDue} clients ka paisa baaki`), cta: t("Send reminder", "Reminder bhejo") },
    { icon: FilePen, tone: "text-primary bg-primary-soft", text: t(`${dash.tasks.draftBills} bills are incomplete`, `${dash.tasks.draftBills} bills adhure hain`), cta: t("Finish", "Poora karo") },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{longDate()}</p>
          <h1 className="mt-1 font-serif text-[28px] leading-tight md:text-[44px]">Namaste, Rakesh ji</h1>
        </div>
        <Link to="/bill" className={cn(buttonVariants({ variant: "accent", size: "lg" }), "hidden sm:inline-flex")}>
          <Plus /> {t("New bill", "Naya Bill")}
        </Link>
      </div>

      <section className="overflow-hidden rounded-lg bg-primary text-primary-foreground">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_320px] md:p-8">
          <div>
            <p className="text-sm text-primary-foreground/70">{t("Today's sales", "Aaj ki bikri")}</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-4">
              <span className="serif-num text-[56px] leading-none md:text-[80px]">{money(sales)}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-medium text-primary-foreground">
                <ArrowUpRight className="size-3.5 stroke-[1.75]" /> +{dash.deltaPct}% {t("vs yesterday", "kal se")}
              </span>
            </div>
          </div>
          <div className="h-24 md:h-auto" aria-label="7-day sales trend">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dash.week} margin={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                <YAxis hide domain={["dataMin - 3000", "dataMax + 2000"]} />
                <Line type="monotone" dataKey="v" stroke="currentColor" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-primary-foreground/15">
          <Stat label={t("Today's profit", "Aaj ka profit")} value={money(dash.profit)} />
          <Stat label={t("Pending credit", "Baaki udhaar")} value={money(dash.pendingUdhaar)} divider />
        </div>
      </section>

      <Card>
        <h2 className="px-6 pt-5 text-base font-semibold">{t("Today's tasks", "Aaj ke kaam")}</h2>
        <ul className="mt-2 divide-y">
          {tasks.map((k) => (
            <li key={k.cta} className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6">
              <span className={cn("grid size-9 place-items-center rounded-md", k.tone)}><k.icon className="size-[18px] stroke-[1.5]" /></span>
              <span className="min-w-0 flex-1 text-sm">{k.text}</span>
              <Button size="sm" className="shrink-0">{k.cta}</Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="text-base font-semibold">{t("Recent bills", "Haal ke bills")}</h2>
          <span className="text-xs text-muted-foreground">{t("Today", "Aaj")}</span>
        </div>
        <table className="mt-3 w-full table-fixed text-sm sm:table-auto">
          <thead className="text-left text-xs text-muted-foreground">
            <tr className="border-b">
              <th className="w-[24%] px-3 py-2 font-normal sm:w-auto sm:px-6">Bill</th>
              <th className="w-[40%] px-1 py-2 font-normal sm:w-auto sm:px-2">Client</th>
              <th className="px-2 py-2 text-right font-normal">{t("Amount", "Rakam")}</th>
              <th className="hidden px-2 py-2 font-normal sm:table-cell">Status</th>
              <th className="hidden px-6 py-2 text-right font-normal sm:table-cell">{t("Time", "Samay")}</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((b) => (
              <tr key={b.no} onClick={() => setOpen(b)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setOpen(b)}
                className="cursor-pointer border-b transition-colors duration-150 last:border-0 hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none">
                  <td className="num px-3 py-3.5 text-muted-foreground sm:px-6">{b.no}</td>
                  <td className="px-1 py-3.5 font-medium sm:px-2"><span className="block truncate">{b.client}</span></td>
                <td className="num px-2 py-3.5 text-right font-medium">{money(b.amount)}</td>
                <td className="hidden px-2 py-3.5 sm:table-cell"><StatusBadge status={b.status} /></td>
                <td className="hidden px-6 py-3.5 text-right text-muted-foreground sm:table-cell">{b.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <BillDrawer bill={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function Stat({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <div className={cn("px-6 py-4 md:px-8", divider && "border-l border-primary-foreground/15")}>
      <p className="text-xs text-primary-foreground/70">{label}</p>
      <p className="num mt-1 text-lg font-medium">{value}</p>
    </div>
  );
}

function BillDrawer({ bill, onClose }: { bill: Bill | null; onClose: () => void }) {
  const { t } = useLang();
  if (!bill) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label={`Bill ${bill.no}`}>
      <div className="absolute inset-0 bg-foreground/20 animate-in fade-in duration-150" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l bg-card animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div><p className="num text-xs text-muted-foreground">{bill.no} · {bill.time}</p><p className="font-semibold">{bill.client}</p></div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X /></Button>
        </div>
        <div className="flex-1 space-y-5 overflow-auto px-6 py-5">
          <div className="flex items-center justify-between"><StatusBadge status={bill.status} /><span className="text-xs text-muted-foreground">{bill.method}</span></div>
          <ul className="divide-y text-sm">
            {bill.items.map((i) => (
              <li key={i.name} className="flex justify-between gap-4 py-3">
                <span>{i.name}<span className="num block text-xs text-muted-foreground">{i.qty} × {money(i.rate)}</span></span>
                <span className="num font-medium">{money(i.qty * i.rate)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>{t("Received", "Mila")}</span><span className="num">{money(bill.paid)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>{t("Balance", "Baaki")}</span><span className="num">{money(bill.amount - bill.paid)}</span></div>
            <div className="flex items-baseline justify-between pt-2"><span>Total</span><span className="serif-num text-[28px]">{money(bill.amount)}</span></div>
          </div>
        </div>
        <div className="border-t p-4"><Button className="w-full">{t("Open full bill", "Poora bill kholo")} <ChevronRight /></Button></div>
      </aside>
    </div>
  );
}
