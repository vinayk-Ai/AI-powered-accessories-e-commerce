import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Minus, Plus, Trash2, ChevronDown, Check, Download, MessageCircle, ArrowRight, AlertTriangle, UserRound, X, ReceiptText } from "lucide-react";
import { business, getClients, getProducts, nextBillNo, rateFor, searchProducts, type Client, type Product } from "@/lib/api";
import { money, shortDate } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import { Badge, Button, Card, ProductThumb, Segmented } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bill")({
  head: () => ({
    meta: [
      { title: "Naya Bill — Byield" },
      { name: "description", content: "Create a GST-ready bill in seconds with live receipt preview." },
      { property: "og:title", content: "Naya Bill — Byield" },
      { property: "og:description", content: "Create a GST-ready bill in seconds with live receipt preview." },
    ],
  }),
  loader: async () => ({ clients: await getClients(), products: await getProducts(), billNo: await nextBillNo() }),
  component: NewBill,
});

type Line = { key: number; product: Product; qty: number; rate: number; disc: number };
type Pay = "Paid" | "Partial" | "Udhaar";
type Method = "Cash" | "UPI" | "Bank";
const lineTotal = (l: Line) => Math.max(0, l.qty * l.rate - l.disc);

function NewBill() {
  const { clients, products, billNo } = Route.useLoaderData();
  const { t } = useLang();
  const [client, setClient] = useState<Client | null>(clients[0] ?? null);
  const [lines, setLines] = useState<Line[]>([]);
  const [pay, setPay] = useState<Pay>("Paid");
  const [method, setMethod] = useState<Method>("UPI");
  const [partial, setPartial] = useState(0);
  const [done, setDone] = useState(false);
  const [sheet, setSheet] = useState(false);
  const keyRef = useRef(1);
  const ctype = client?.type ?? "Walk-in";

  // Re-price when client type changes
  useEffect(() => { setLines((ls) => ls.map((l) => ({ ...l, rate: rateFor(l.product, ctype) }))); }, [ctype]);

  const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const discount = lines.reduce((s, l) => s + Math.min(l.disc, l.qty * l.rate), 0);
  const total = subtotal - discount;

  const add = (p: Product) => setLines((ls) => {
    const ex = ls.find((l) => l.product.id === p.id);
    if (ex) return ls.map((l) => (l === ex ? { ...l, qty: l.qty + 1 } : l));
    return [{ key: keyRef.current++, product: p, qty: 1, rate: rateFor(p, ctype), disc: 0 }, ...ls];
  });
  const update = (key: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const reset = () => { setLines([]); setDone(false); setPay("Paid"); setPartial(0); setSheet(false); };

  if (done) return <Success billNo={billNo} client={client} lines={lines} subtotal={subtotal} discount={discount} total={total} onNext={reset} />;

  const receipt = <Receipt billNo={billNo} client={client} lines={lines} subtotal={subtotal} discount={discount} total={total} />;
  const payment = (
    <PaymentBox pay={pay} setPay={setPay} method={method} setMethod={setMethod} partial={partial} setPartial={setPartial}
      total={total} disabled={!lines.length} onSubmit={() => setDone(true)} />
  );

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="num text-sm text-muted-foreground">{billNo} · {shortDate()}</p>
          <h1 className="font-serif text-[28px] leading-tight md:text-[44px]">{t("New bill", "Naya Bill")}</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-4">
          <ClientPicker clients={clients} value={client} onChange={setClient} />
          <ProductSearch products={products} onAdd={add} />
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b px-4 py-3 text-xs text-muted-foreground sm:px-5">
              <span>{lines.length} {t("items", "items")}</span>
              <span>{ctype === "Wholesaler" ? t("Wholesale rates applied", "Wholesale rate laga hai") : t("Retail rates applied", "Retail rate laga hai")}</span>
            </div>
            {lines.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <ReceiptText className="mx-auto size-6 stroke-[1.5] text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">{t("Search a product above and press Enter to add.", "Upar maal dhoondo aur Enter dabao.")}</p>
              </div>
            ) : (
              <ul className="divide-y">
                {lines.map((l) => <LineRow key={l.key} line={l} onChange={(p) => update(l.key, p)} onRemove={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} />)}
              </ul>
            )}
          </Card>
        </div>

        <div className="hidden space-y-4 lg:block">
          <div className="sticky top-24 space-y-4">{receipt}{payment}</div>
        </div>
      </div>

      {/* Mobile sticky bar + sheet */}
      <div className="fixed inset-x-0 bottom-16 z-30 flex items-center gap-3 border-t bg-card px-4 py-3 lg:hidden md:bottom-0 md:left-16">
        <button onClick={() => setSheet(true)} className="flex-1 text-left">
          <span className="block text-xs text-muted-foreground">{t("Total · view bill", "Total · bill dekho")}</span>
          <span className="serif-num text-[28px] leading-none">{money(total)}</span>
        </button>
        <Button variant="accent" size="lg" disabled={!lines.length} onClick={() => setSheet(true)}>Bill banao</Button>
      </div>
      {sheet && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/25 animate-in fade-in duration-150" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] space-y-4 overflow-auto rounded-t-xl bg-background p-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between"><span className="text-sm font-semibold">{t("Bill preview", "Bill preview")}</span>
              <Button variant="ghost" size="icon" onClick={() => setSheet(false)} aria-label="Close"><X /></Button></div>
            {receipt}{payment}
          </div>
        </div>
      )}
    </div>
  );
}

function ClientPicker({ clients, value, onChange }: { clients: Client[]; value: Client | null; onChange: (c: Client | null) => void }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const list = clients.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 rounded-lg hairline bg-card px-4 py-3 text-left transition-colors duration-150 hover:border-primary/40 focus-ring">
        <span className="grid size-10 place-items-center rounded-full bg-accent-soft text-sm font-semibold">{value ? value.name.split(" ").map((w) => w[0]).slice(0, 2).join("") : <UserRound className="size-4 stroke-[1.5]" />}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-muted-foreground">Client</span>
          <span className="flex flex-wrap items-center gap-2 font-medium">{value?.name ?? "Walk-in"}
            {value && <Badge tone={value.type === "Wholesaler" ? "primary" : "neutral"}>{value.type}</Badge>}</span>
        </span>
        {value && value.pending > 0 && (
          <span className="text-right"><span className="block text-xs text-muted-foreground">{t("Pending", "Baaki")}</span><span className="num text-sm font-medium text-destructive">{money(value.pending)}</span></span>
        )}
        <ChevronDown className="size-4 stroke-[1.5] text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-lg hairline bg-popover p-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search client...", "Client dhoondo...")}
            className="mb-1 h-10 w-full rounded-md hairline bg-background px-3 text-sm outline-none focus:border-primary" />
          {[null, ...list].map((c) => (
            <button key={c?.id ?? "walk"} onClick={() => { onChange(c); setOpen(false); setQ(""); }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-muted">
              <span className="flex-1"><span className="font-medium">{c?.name ?? "Walk-in"}</span>
                <span className="block text-xs text-muted-foreground">{c ? `${c.type} · ${c.city}` : t("Counter sale, retail rates", "Counter sale, retail rate")}</span></span>
              {c && c.pending > 0 && <span className="num text-xs text-destructive">{money(c.pending)}</span>}
              {(value?.id ?? null) === (c?.id ?? null) && <Check className="size-4 stroke-[1.5] text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductSearch({ products, onAdd }: { products: Product[]; onAdd: (p: Product) => void }) {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchProducts(products, q), [products, q]);
  useEffect(() => { ref.current?.focus(); }, []);
  const pick = (p: Product) => { onAdd(p); setQ(""); setIdx(0); ref.current?.focus(); };
  return (
    <div className="relative">
      <label className="flex h-14 items-center gap-3 rounded-lg border-2 border-primary bg-card px-4">
        <Search className="size-5 stroke-[1.5] text-primary" />
        <input ref={ref} value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
            if (e.key === "Enter" && results[idx]) pick(results[idx]);
            if (e.key === "Escape") setQ("");
          }}
          placeholder={t('Type product name, e.g. "type c"', 'Maal ka naam likho, jaise "type c"')}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" />
        <kbd className="hidden rounded-sm hairline px-1.5 text-[11px] text-muted-foreground sm:block">Enter ↵</kbd>
      </label>
      {q && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-lg hairline bg-popover animate-in fade-in duration-150">
          {results.length === 0 ? <p className="px-4 py-4 text-sm text-muted-foreground">{t("No product found", "Koi maal nahi mila")}</p> :
            results.map((p, i) => (
              <button key={p.id} onMouseEnter={() => setIdx(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(p)}
                className={cn("flex w-full items-center gap-3 px-4 py-3 text-left", i === idx && "bg-muted")}>
                <ProductThumb kind={p.kind} />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className={cn("num text-xs", p.stock < 15 ? "text-warning" : "text-muted-foreground")}>{p.sku} · {p.stock} {t("in stock", "stock mein")}</span></span>
                <span className="num text-right text-sm font-medium">{money(p.retailRate)}<span className="block text-xs font-normal text-muted-foreground">WS {money(p.wholesaleRate)}</span></span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function LineRow({ line, onChange, onRemove }: { line: Line; onChange: (p: Partial<Line>) => void; onRemove: () => void }) {
  const { t } = useLang();
  const over = line.qty > line.product.stock;
  const field = "num h-9 w-full rounded-md hairline bg-background px-2 text-right text-sm outline-none focus:border-primary";
  return (
    <li className="animate-row-in px-5 py-4">
      <div className="flex items-start gap-3">
        <ProductThumb kind={line.product.kind} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{line.product.name}</p>
          <p className="num text-xs text-muted-foreground">{line.product.stock} {t("in stock", "stock mein")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove"><Trash2 className="text-muted-foreground" /></Button>
      </div>
      <div className="mt-3 grid grid-cols-2 items-end gap-3 sm:grid-cols-[auto_1fr_1fr_1fr] sm:pl-[52px]">
        <div>
          <span className="mb-1 block text-xs text-muted-foreground">Qty</span>
          <div className="flex h-9 items-center rounded-md hairline bg-background">
            <button className="grid h-full w-9 place-items-center hover:bg-muted" onClick={() => onChange({ qty: Math.max(1, line.qty - 1) })} aria-label="Decrease"><Minus className="size-3.5 stroke-[1.5]" /></button>
            <input value={line.qty} inputMode="numeric" onChange={(e) => onChange({ qty: Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1) })} className="num w-10 bg-transparent text-center text-sm outline-none" />
            <button className="grid h-full w-9 place-items-center hover:bg-muted" onClick={() => onChange({ qty: line.qty + 1 })} aria-label="Increase"><Plus className="size-3.5 stroke-[1.5]" /></button>
          </div>
        </div>
        <label><span className="mb-1 block text-xs text-muted-foreground">Rate ₹</span>
          <input className={field} inputMode="numeric" value={line.rate} onChange={(e) => onChange({ rate: Number(e.target.value.replace(/\D/g, "")) || 0 })} /></label>
        <label><span className="mb-1 block text-xs text-muted-foreground">{t("Discount ₹", "Chhoot ₹")}</span>
          <input className={field} inputMode="numeric" value={line.disc || ""} placeholder="0" onChange={(e) => onChange({ disc: Number(e.target.value.replace(/\D/g, "")) || 0 })} /></label>
        <div className="text-right"><span className="mb-1 block text-xs text-muted-foreground">Total</span><span className="num block h-9 text-base font-semibold leading-9">{money(lineTotal(line))}</span></div>
      </div>
      {over && (
        <p className="mt-3 flex items-center gap-2 rounded-md bg-warning-soft px-3 py-2 text-xs text-warning sm:ml-[52px]">
          <AlertTriangle className="size-3.5 stroke-[1.75]" />
          {t(`Only ${line.product.stock} in stock — you're billing ${line.qty}.`, `Stock mein sirf ${line.product.stock} hain — aap ${line.qty} bill kar rahe ho.`)}
        </p>
      )}
    </li>
  );
}

function Receipt({ billNo, client, lines, subtotal, discount, total }: { billNo: string; client: Client | null; lines: Line[]; subtotal: number; discount: number; total: number }) {
  const { t } = useLang();
  return (
    <div>
      <div className="rounded-t-lg hairline border-b-0 bg-paper px-6 pb-6 pt-6">
        <div className="text-center">
          <p className="font-serif text-xl">{business.name}</p>
          <p className="text-xs text-muted-foreground">{business.address}</p>
          <p className="num text-xs text-muted-foreground">GSTIN {business.gstin} · Ph {business.phone}</p>
        </div>
        <div className="num mt-5 flex justify-between border-y border-dashed py-2 text-xs text-muted-foreground">
          <span>{billNo}</span><span>{shortDate()}</span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t("Billed to", "Bill kiska")}: <span className="font-medium text-foreground">{client?.name ?? "Walk-in"}</span></p>
        <ul className="mt-3 min-h-16 space-y-2.5 text-sm">
          {lines.length === 0 && <li className="py-4 text-center text-xs text-muted-foreground">—</li>}
          {lines.map((l) => (
            <li key={l.key} className="animate-row-in flex justify-between gap-4">
              <span className="min-w-0"><span className="block truncate">{l.product.name}</span>
                <span className="num text-xs text-muted-foreground">{l.qty} × {money(l.rate)}{l.disc ? ` − ${money(l.disc)}` : ""}</span></span>
              <span className="num shrink-0">{money(lineTotal(l))}</span>
            </li>
          ))}
        </ul>
        <div className="num mt-4 space-y-1 border-t border-dashed pt-3 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>{t("Discount", "Chhoot")}</span><span>− {money(discount)}</span></div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-sm font-medium">Total</span>
          <span className="serif-num text-[44px] leading-none">{money(total)}</span>
        </div>
      </div>
      <div className="receipt-edge bg-paper" aria-hidden />
    </div>
  );
}

function PaymentBox(p: { pay: Pay; setPay: (v: Pay) => void; method: Method; setMethod: (v: Method) => void; partial: number; setPartial: (n: number) => void; total: number; disabled: boolean; onSubmit: () => void }) {
  const { t } = useLang();
  return (
    <Card className="space-y-3 p-4">
      <Segmented label="Payment status" value={p.pay} onChange={p.setPay} options={[{ v: "Paid", l: "Paid" }, { v: "Partial", l: "Partial" }, { v: "Udhaar", l: "Udhaar" }]} />
      {p.pay !== "Udhaar" && <Segmented label="Payment method" value={p.method} onChange={p.setMethod} options={[{ v: "Cash", l: "Cash" }, { v: "UPI", l: "UPI" }, { v: "Bank", l: "Bank" }]} />}
      {p.pay === "Partial" && (
        <label className="flex items-center gap-3 rounded-md hairline px-3">
          <span className="text-xs text-muted-foreground">{t("Received ₹", "Mila ₹")}</span>
          <input inputMode="numeric" value={p.partial || ""} placeholder="0" onChange={(e) => p.setPartial(Number(e.target.value.replace(/\D/g, "")) || 0)}
            className="num h-10 flex-1 bg-transparent text-right text-sm outline-none" />
          <span className="num text-xs text-destructive">{t("Due", "Baaki")} {money(Math.max(0, p.total - p.partial))}</span>
        </label>
      )}
      <Button variant="accent" size="lg" className="w-full justify-between" disabled={p.disabled} onClick={p.onSubmit}>
        <span>Bill banao</span><span className="num">{money(p.total)} →</span>
      </Button>
    </Card>
  );
}

function Success(props: { billNo: string; client: Client | null; lines: Line[]; subtotal: number; discount: number; total: number; onNext: () => void }) {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-md animate-fade-up space-y-5 py-4">
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-success-soft text-success"><Check className="size-6 stroke-[1.75]" /></span>
        <h1 className="mt-3 font-serif text-[28px]">{t("Bill created", "Bill ban gaya")}</h1>
        <p className="text-sm text-muted-foreground">{props.billNo} · {props.client?.name ?? "Walk-in"}</p>
      </div>
      <Receipt {...props} />
      <div className="grid grid-cols-2 gap-3">
        <Button><Download /> Download PDF</Button>
        <Button><MessageCircle /> WhatsApp</Button>
      </div>
      <Button variant="accent" size="lg" className="w-full" onClick={props.onNext}>{t("Next bill", "Agla bill")} <ArrowRight /></Button>
    </div>
  );
}
