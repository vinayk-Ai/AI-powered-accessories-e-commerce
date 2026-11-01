import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginShop } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Byield" },
      { name: "description", content: "Log in to Byield: billing and inventory for mobile-accessories distributors in India." },
      { property: "og:title", content: "Log in — Byield" },
      { property: "og:description", content: "Bills in seconds, stock and udhaar tracked, daily profit known." },
    ],
  }),
  component: LoginPage,
});

const inputCls =
  "h-11 w-full rounded-[10px] hairline bg-card px-3.5 text-sm outline-none transition-colors duration-150 placeholder:text-muted-foreground/60 focus:border-primary";
const inputClsErr = cn(inputCls, "border-destructive focus:border-destructive");

export function LoginPage() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcome, setWelcome] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const result = await loginShop(email, password);
    setBusy(false);
    if (result.ok) setWelcome(result.account.name);
    else
      setError(
        result.error === "no-account"
          ? t("No account on this device yet — create one first.", "Is device par abhi koi account nahi — pehle banao.")
          : t("Email or password is wrong. Try again.", "Email ya password galat hai. Dobara try karo."),
      );
  }

  if (welcome) {
    return (
      <div className="mx-auto max-w-[480px] pt-10">
        <div className="animate-in fade-in zoom-in-95 rounded-lg hairline bg-card p-8 text-center duration-200">
          <span className="mx-auto grid size-14 animate-in fade-in zoom-in-50 place-items-center rounded-full bg-success-soft text-success delay-100 duration-200">
            <Check className="size-7 stroke-[2]" />
          </span>
          <h1 className="mt-5 font-serif text-[28px]">{t("Welcome back,", "Wapas aaye,")} {welcome.split(" ")[0]}!</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("Your shop is ready to bill.", "Aapki dukaan bill ke liye taiyar hai.")}</p>
          <Link to="/aaj" className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-6 w-full")}>
            {t("Go to dashboard", "Dashboard kholo")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[440px] pb-16 pt-2">
      <Link to="/" className="inline-flex animate-fade-up items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5 stroke-[1.75]" /> {t("Back to home", "Home par wapas")}
      </Link>

      <div className="mt-4 animate-fade-up">
        <h1 className="font-serif text-[30px] md:text-[36px]">{t("Log in", "Log in karo")}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("Back to your shop's yield.", "Wapas aapki dukaan ke yield par.")}</p>
      </div>

      <form noValidate onSubmit={submit} className="mt-6 grid animate-fade-up gap-4 rounded-lg hairline bg-card p-5 md:p-7">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rakesh@example.com"
            autoComplete="email" className={cn(error ? inputClsErr : inputCls)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("Password", "Password")}</span>
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" className={cn("pr-11", error ? inputClsErr : inputCls)} />
            <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground">
              {showPw ? <EyeOff className="size-4 stroke-[1.5]" /> : <Eye className="size-4 stroke-[1.5]" />}
            </button>
          </div>
        </label>

        {error && (
          <p className="animate-in fade-in slide-in-from-top-1 rounded-[10px] bg-destructive-soft px-3 py-2 text-xs text-destructive duration-150" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy || !email || !password}
          className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-1 w-full disabled:opacity-50")}>
          {busy ? (
            <><Loader2 className="animate-spin" /> {t("Logging in…", "Log in ho raha hai…")}</>
          ) : (
            t("Log in", "Log in karo")
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          {t("New to Byield?", "Byield naya hai?")}{" "}
          <Link to="/signup" className="font-medium text-primary underline-offset-2 hover:underline">
            {t("Create account", "Account banao")}
          </Link>
        </p>
      </form>
    </div>
  );
}
