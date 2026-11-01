import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { collectErrors, fieldError, passwordIssues, signupSchema, type Role } from "@/lib/validation";
import { registerShop } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { Button, buttonVariants } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Byield" },
      { name: "description", content: "Sign up for Byield: billing and inventory for mobile-accessories distributors in India." },
      { property: "og:title", content: "Create account — Byield" },
      { property: "og:description", content: "Bills in seconds, stock and udhaar tracked, daily profit known." },
    ],
  }),
  component: SignupPage,
});

const inputCls =
  "h-11 w-full rounded-[10px] hairline bg-card px-3.5 text-sm outline-none transition-colors duration-150 placeholder:text-muted-foreground/60 focus:border-primary";
const inputClsErr = cn(inputCls, "border-destructive focus:border-destructive");

function Field({
  label, error, children, delay, className,
}: {
  label: string; error?: string | undefined; children: React.ReactNode; delay: number; className?: string;
}) {
  return (
    <div className={cn("animate-fade-up", className)} style={{ animationDelay: `${delay}ms` }}>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
        {children}
      </label>
      {error && (
        <p className="mt-1 animate-in fade-in slide-in-from-top-1 text-xs text-destructive duration-150" role="alert">{error}</p>
      )}
    </div>
  );
}

const roleOptions: { v: Role; title: [string, string]; body: [string, string] }[] = [
  { v: "retailer", title: ["Retailer", "Retailer"], body: ["I sell to walk-in customers", "Main seedha customer ko bechta hoon"] },
  { v: "wholesaler", title: ["Wholesaler", "Wholesaler"], body: ["I supply bulk to retailers", "Main retailers ko bulk supply karta hoon"] },
  { v: "distributor", title: ["Distributor", "Distributor"], body: ["I distribute brands across a region", "Main brands ka distribution karta hoon"] },
];

const empty = {
  name: "", phone: "", email: "", password: "", shopName: "", role: "" as Role | "",
  address: "", pincode: "", shopGstNumber: "",
};
type FormState = typeof empty;

export function SignupPage() {
  const { t } = useLang();
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { shopName: string }>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const blur = (key: keyof FormState) =>
    setErrors((e) => ({ ...e, [key]: fieldError(key as never, form[key]) }));

  const pwIssues = passwordIssues(form.password);
  const strength = form.password ? 4 - pwIssues.length : -1; // -1 empty, 0..4

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }
    setBusy(true);
    await registerShop(parsed.data);
    setBusy(false);
    setDone({ shopName: parsed.data.shopName });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-[560px] pt-10">
        <div className="animate-in fade-in zoom-in-95 rounded-lg hairline bg-card p-8 text-center duration-200">
          <span className="mx-auto grid size-14 animate-in fade-in zoom-in-50 place-items-center rounded-full bg-success-soft text-success delay-100 duration-200">
            <Check className="size-7 stroke-[2]" />
          </span>
          <h1 className="mt-5 font-serif text-[28px]">{t("Account created", "Account ban gaya")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(`${done.shopName} is ready. Log in to start making bills.`, `${done.shopName} taiyar hai. Log in karke bill banana shuru karo.`)}
          </p>
          <Link to="/login" className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-6 w-full")}>
            {t("Log in", "Log in karo")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] pb-16 pt-2">
      <Link to="/" className="inline-flex animate-fade-up items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5 stroke-[1.75]" /> {t("Back to home", "Home par wapas")}
      </Link>

      <div className="mt-4 animate-fade-up">
        <h1 className="font-serif text-[30px] md:text-[36px]">{t("Create your account", "Apna account banao")}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("One shop, one account. Takes under two minutes.", "Ek dukaan, ek account. Do minute se kam lagta hai.")}
        </p>
      </div>

      <form noValidate onSubmit={submit} className="mt-6 grid gap-4 rounded-lg hairline bg-card p-5 md:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Your name", "Aapka naam")} error={errors.name} delay={40}>
            <input value={form.name} onBlur={() => blur("name")} onChange={(e) => set("name", e.target.value)}
              placeholder="Rakesh Kumar" autoComplete="name" className={cn(errors.name ? inputClsErr : inputCls)} />
          </Field>
          <Field label={t("Mobile number", "Mobile number")} error={errors.phone} delay={80}>
            <input value={form.phone} onBlur={() => blur("phone")} inputMode="numeric" maxLength={10}
              onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
              placeholder="9811042217" autoComplete="tel" className={cn("num", errors.phone ? inputClsErr : inputCls)} />
          </Field>
        </div>

        <Field label="Email" error={errors.email} delay={120}>
          <input value={form.email} onBlur={() => blur("email")} onChange={(e) => set("email", e.target.value)}
            placeholder="rakesh@example.com" autoComplete="email" className={cn(errors.email ? inputClsErr : inputCls)} />
        </Field>

        <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
          <Field label={t("Password", "Password")} error={errors.password} delay={160}>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={form.password} onBlur={() => blur("password")}
                onChange={(e) => set("password", e.target.value)} placeholder="••••••••" autoComplete="new-password"
                className={cn("pr-11", errors.password ? inputClsErr : inputCls)} />
              <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground">
                {showPw ? <EyeOff className="size-4 stroke-[1.5]" /> : <Eye className="size-4 stroke-[1.5]" />}
              </button>
            </div>
          </Field>
          {form.password.length > 0 && (
            <div className="mt-2 animate-in fade-in duration-150">
              <div className="flex gap-1.5" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-200",
                    i < strength ? (strength <= 1 ? "bg-destructive" : strength === 2 ? "bg-warning" : "bg-success") : "bg-muted")} />
                ))}
              </div>
              <p className={cn("mt-1.5 text-xs", strength <= 1 ? "text-destructive" : strength === 2 ? "text-warning" : "text-success")}>
                {strength <= 1 ? t("Weak password", "Kamzor password") : strength === 2 ? t("Almost there", "Thoda aur") : t("Strong password", "Mazboot password")}
              </p>
              {pwIssues.length > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("Missing:", "Baaki hai:")} {pwIssues.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-1 border-t pt-4">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ animationDelay: "200ms" }}>
            {t("Shop details", "Dukaan ki jaankari")}
          </p>
        </div>

        <Field label={t("Shop name", "Dukaan ka naam")} error={errors.shopName} delay={220}>
          <input value={form.shopName} onBlur={() => blur("shopName")} onChange={(e) => set("shopName", e.target.value)}
            placeholder="Rakesh Mobile Accessories" autoComplete="organization" className={cn(errors.shopName ? inputClsErr : inputCls)} />
        </Field>

        <fieldset className="animate-fade-up" style={{ animationDelay: "260ms" }}>
          <legend className="mb-1.5 text-xs font-medium text-muted-foreground">{t("You are a…", "Aap hain…")}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {roleOptions.map((r) => (
              <button key={r.v} type="button" onClick={() => set("role", r.v)} aria-pressed={form.role === r.v}
                className={cn("rounded-[10px] hairline p-3 text-left transition-all duration-150",
                  form.role === r.v ? "border-primary bg-primary-soft" : "bg-background hover:bg-muted")}>
                <span className="block text-sm font-semibold">{t(r.title[0], r.title[1])}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{t(r.body[0], r.body[1])}</span>
              </button>
            ))}
          </div>
          {errors.role && <p className="mt-1 text-xs text-destructive" role="alert">{errors.role}</p>}
        </fieldset>

        <Field label={t("Shop address", "Dukaan ka pata")} error={errors.address} delay={300}>
          <input value={form.address} onBlur={() => blur("address")} onChange={(e) => set("address", e.target.value)}
            placeholder={t("Gaffar Market, Karol Bagh", "Gaffar Market, Karol Bagh")} autoComplete="street-address"
            className={cn(errors.address ? inputClsErr : inputCls)} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Pincode", "Pincode")} error={errors.pincode} delay={340}>
            <input value={form.pincode} onBlur={() => blur("pincode")} inputMode="numeric" maxLength={6}
              onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
              placeholder="110005" autoComplete="postal-code" className={cn("num", errors.pincode ? inputClsErr : inputCls)} />
          </Field>
          <Field label={t("GSTIN (optional)", "GSTIN (optional)")} error={errors.shopGstNumber} delay={380}>
            <input value={form.shopGstNumber} onBlur={() => blur("shopGstNumber")} maxLength={15}
              onChange={(e) => set("shopGstNumber", e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, ""))}
              placeholder="07ABCPR4521K1Z3" className={cn("num uppercase", errors.shopGstNumber ? inputClsErr : inputCls)} />
          </Field>
        </div>

        <Button type="submit" variant="accent" size="lg" disabled={busy} className="mt-2 w-full">
          {busy ? (
            <><Loader2 className="animate-spin" /> {t("Creating account…", "Account ban raha hai…")}</>
          ) : (
            t("Create account", "Account banao")
          )}
        </Button>
        <p className="animate-fade-up text-center text-xs text-muted-foreground" style={{ animationDelay: "420ms" }}>
          {t("Already have an account?", "Pehle se account hai?")}{" "}
          <Link to="/login" className="font-medium text-primary underline-offset-2 hover:underline">
            {t("Log in", "Log in karo")}
          </Link>
        </p>
      </form>
    </div>
  );
}
