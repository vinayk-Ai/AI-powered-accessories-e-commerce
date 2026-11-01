import { z } from "zod";

export const roles = ["retailer", "wholesaler", "distributor"] as const;
export type Role = (typeof roles)[number];

/** Mirrors the backend's password rule: length + 4 character classes. */
export function passwordIssues(password: string): string[] {
  const requirements: [string, boolean][] = [
    ["a lowercase letter", /[a-z]/.test(password)],
    ["an uppercase letter", /[A-Z]/.test(password)],
    ["a number", /\d/.test(password)],
    ["a special character", /[^a-zA-Z0-9\s]/.test(password)],
  ];
  return requirements.filter(([, ok]) => !ok).map(([label]) => label);
}

function humanList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number starting with 6-9"),
  email: z.string().trim().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((p) => passwordIssues(p).length === 0, (p) => ({
      message: `Password must contain ${humanList(passwordIssues(p))}`,
    })),
  shopName: z.string().trim().min(2, "Shop name must be at least 2 characters"),
  role: z.enum(roles, { message: "Pick a role" }),
  address: z.string().trim().min(5, "Address must be at least 5 characters"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
  shopGstNumber: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[0-9A-Z]{15}$/.test(v), "GSTIN must be 15 uppercase letters or digits")
    .optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;

/** Validate one field on its own (for blur-time feedback). */
export function fieldError<K extends keyof SignupInput>(key: K, value: unknown): string | undefined {
  const shape = signupSchema.shape as Record<K, z.ZodTypeAny>;
  const result = shape[key].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

/** Flatten a failed schema parse into { field: firstMessage }. */
export function collectErrors(error: z.ZodError): Partial<Record<keyof SignupInput, string>> {
  const out: Partial<Record<keyof SignupInput, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof SignupInput | undefined;
    if (key && out[key] === undefined) out[key] = issue.message;
  }
  return out;
}
