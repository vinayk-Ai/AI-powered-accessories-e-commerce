import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ReceiptText, Package, Files, BarChart3, Settings, Search, Plus, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui-kit";

type Nav = { to?: "/" | "/bill"; icon: typeof Home; en: string; hi: string };
const nav: Nav[] = [
  { to: "/", icon: Home, en: "Home", hi: "Home" },
  { to: "/bill", icon: ReceiptText, en: "New bill", hi: "Bill" },
  { icon: Package, en: "Products", hi: "Maal" },
  { icon: Files, en: "Bills", hi: "Bills" },
  { icon: BarChart3, en: "Report", hi: "Report" },
  { icon: Settings, en: "Settings", hi: "Settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { t, lang, setLang } = useLang();

  if (path === "/login" || path === "/signup") {
    return (
      <div className="min-h-screen w-full">
        <header className="border-b bg-card/80 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 md:px-8">
            <Link to="/" className="flex items-center gap-2.5 text-foreground">
              <span className="grid size-9 place-items-center rounded-md bg-primary font-serif text-xl text-primary-foreground">
                B
              </span>
              <span className="font-serif text-2xl">Byield</span>
            </Link>
            <div
              role="radiogroup"
              aria-label="Language"
              className="flex rounded-full bg-muted p-0.5 text-xs font-medium"
            >
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  role="radio"
                  aria-checked={lang === l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "rounded-full px-2.5 py-1 transition-colors duration-150",
                    lang === l ? "bg-card text-foreground hairline" : "text-muted-foreground",
                  )}
                >
                  {l === "en" ? "EN" : "Hinglish"}
                </button>
              ))}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1240px] px-4 pb-16 pt-6 md:px-8 md:pt-10">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside className="group fixed inset-y-0 left-0 z-40 hidden w-16 flex-col border-r bg-card transition-[width] duration-200 ease-out hover:w-[220px] md:flex">
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="grid size-8 shrink-0 place-items-center rounded-md bg-primary font-serif text-lg text-primary-foreground">B</div>
          <span className="font-serif text-xl opacity-0 transition-opacity duration-150 group-hover:opacity-100">Byield</span>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-3">
          {nav.map((n) => {
            const active = n.to === path;
            const inner = (
              <>
                <n.icon className="size-5 shrink-0 stroke-[1.5]" />
                <span className="truncate opacity-0 transition-opacity duration-150 group-hover:opacity-100">{t(n.en, n.hi)}</span>
                {!n.to && <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground opacity-0 group-hover:opacity-100">{t("Soon", "Jaldi")}</span>}
              </>
            );
            const cls = cn("flex h-10 items-center gap-3 rounded-md px-[10px] text-sm transition-colors duration-150 focus-ring",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground");
            return n.to ? <Link key={n.en} to={n.to} className={cls}>{inner}</Link>
              : <button key={n.en} disabled className={cn(cls, "cursor-default opacity-70 hover:bg-transparent")}>{inner}</button>;
          })}
        </nav>
      </aside>

      <div className="md:pl-16">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
          <div className="mx-auto grid min-h-16 max-w-[1240px] grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-2 px-3 py-2 sm:px-4 md:flex md:h-16 md:grid-cols-none md:gap-3 md:px-8 md:py-0">
            <div className="grid size-8 place-items-center rounded-md bg-primary font-serif text-lg text-primary-foreground md:hidden">B</div>
            <label className="col-span-2 row-start-2 flex h-10 min-w-0 items-center gap-2 rounded-md hairline bg-card px-3 text-muted-foreground focus-within:border-primary md:order-none md:col-span-1 md:row-auto md:flex-1 md:max-w-xl">
              <Search className="size-4 stroke-[1.5]" />
              <input className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder={t("Search products, bills, clients...", "Maal, bill, client dhoondo...")} />
              <kbd className="hidden rounded-sm hairline px-1.5 text-[11px] sm:block">⌘K</kbd>
            </label>
            <div className="col-start-2 row-start-1 ml-auto flex items-center gap-1.5 sm:gap-3 md:col-auto md:row-auto md:ml-auto">
              <nav aria-label="Account" className="flex items-center gap-1.5 sm:gap-2">
                <Link to="/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "px-2.5 sm:px-3")}>
                  {t("Log in", "Log in")}
                </Link>
                <Link to="/signup" className={cn(buttonVariants({ variant: "primary", size: "sm" }), "px-2.5 sm:px-3")}>
                  {t("Sign up", "Account banao")}
                </Link>
              </nav>
              <div role="radiogroup" aria-label="Language" className="flex shrink-0 rounded-full bg-muted p-0.5 text-xs font-medium">
                {(["en", "hi"] as const).map((l) => (
                  <button key={l} role="radio" aria-checked={lang === l} onClick={() => setLang(l)}
                    className={cn("rounded-full px-2.5 py-1 transition-colors duration-150", lang === l ? "bg-card text-foreground hairline" : "text-muted-foreground")}>
                    {l === "en" ? "EN" : "Hinglish"}
                  </button>
                ))}
              </div>
              <div className="hidden size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-foreground sm:grid" aria-label="Rakesh">RK</div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1240px] px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">{children}</main>
      </div>

      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t bg-card md:hidden">
        {[
          { to: "/" as const, icon: Home, l: "Home" },
          { to: "/bill" as const, icon: Plus, l: "Bill", raised: true },
          { icon: Package, l: "Maal" },
          { icon: BarChart3, l: "Report" },
          { icon: MoreHorizontal, l: t("More", "Aur") },
        ].map((n, i) => {
          const active = n.to === path;
          if (n.raised) return (
            <Link key={i} to="/bill" className="flex flex-col items-center justify-start">
              <span className="-mt-5 grid size-14 place-items-center rounded-full border-4 border-background bg-accent text-accent-foreground"><Plus className="size-6 stroke-[1.75]" /></span>
              <span className="text-[11px] font-medium">Bill</span>
            </Link>
          );
          const cls = cn("flex flex-col items-center justify-center gap-1 text-[11px]", active ? "text-primary font-medium" : "text-muted-foreground");
          const body = <><n.icon className="size-5 stroke-[1.5]" />{n.l}</>;
          return n.to ? <Link key={i} to={n.to} className={cls}>{body}</Link> : <button key={i} className={cls}>{body}</button>;
        })}
      </nav>
    </div>
  );
}
