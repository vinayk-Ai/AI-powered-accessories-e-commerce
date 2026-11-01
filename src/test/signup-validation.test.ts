import { describe, expect, it } from "vitest";
import { fieldError, passwordIssues, signupSchema } from "@/lib/validation";

const valid = {
  name: "Rakesh Kumar",
  phone: "9811042217",
  email: "rakesh@example.com",
  password: "Yield@2026",
  shopName: "Rakesh Mobile Accessories",
  role: "retailer" as const,
  address: "Gaffar Market, Karol Bagh",
  pincode: "110005",
  shopGstNumber: "07ABCPR4521K1Z3",
};

describe("signup validation (mirrors the backend Pydantic model)", () => {
  it("accepts a fully valid signup", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a phone not starting with 6-9 or not 10 digits", () => {
    for (const phone of ["5811042217", "981104221", "98110422171", "abcdefghij"])
      expect(fieldError("phone", phone), phone).toMatch(/10-digit/);
    expect(fieldError("phone", valid.phone)).toBeUndefined();
  });

  it("requires name, shop name, address and pincode minimums", () => {
    expect(fieldError("name", "R")).toMatch(/2 characters/);
    expect(fieldError("shopName", "R")).toMatch(/2 characters/);
    expect(fieldError("address", "Gaff")).toMatch(/5 characters/);
    expect(fieldError("pincode", "1100")).toMatch(/6-digit/);
    expect(fieldError("pincode", "11000a")).toMatch(/6-digit/);
  });

  it("rejects emails without a proper domain", () => {
    expect(fieldError("email", "rakesh@example")).toMatch(/valid email/);
    expect(fieldError("email", valid.email)).toBeUndefined();
  });

  it("rejects short passwords", () => {
    expect(fieldError("password", "Yie@1")).toMatch(/at least 8/);
  });

  it("lists every missing password character class, like the backend", () => {
    const issues = passwordIssues("abcdefgh");
    expect(issues).toEqual(["an uppercase letter", "a number", "a special character"]);
    expect(fieldError("password", "abcdefgh")).toBe("Password must contain an uppercase letter, a number and a special character");
    expect(fieldError("password", "Yield@2026")).toBeUndefined();
  });

  it("accepts only the three roles", () => {
    for (const role of ["retailer", "wholesaler", "distributor"] as const)
      expect(signupSchema.shape.role.safeParse(role).success).toBe(true);
    expect(signupSchema.shape.role.safeParse("admin").success).toBe(false);
  });

  it("makes GSTIN optional but strict when present", () => {
    expect(fieldError("shopGstNumber", "")).toBeUndefined();
    expect(fieldError("shopGstNumber", undefined)).toBeUndefined();
    expect(fieldError("shopGstNumber", "07ABCPR4521K1Z")).toMatch(/15 uppercase/);
    expect(fieldError("shopGstNumber", "07abcpr4521k1z3")).toMatch(/15 uppercase/);
    expect(fieldError("shopGstNumber", valid.shopGstNumber)).toBeUndefined();
  });
});
