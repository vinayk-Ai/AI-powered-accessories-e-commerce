// Data layer. Currently returns mock data; when VITE_API_BASE_URL is set,
// swap each function body for a fetch to `${BASE}/...`.
export const API_BASE = import.meta.env["VITE_API_BASE_URL"] as string | undefined;

export type ClientType = "Retailer" | "Wholesaler";
export type Client = { id: string; name: string; type: ClientType; city: string; pending: number };
export type ProductKind = "cable" | "cover" | "glass" | "charger" | "audio" | "power";
export type Product = {
  id: string; name: string; sku: string; kind: ProductKind;
  stock: number; retailRate: number; wholesaleRate: number;
};
export type BillStatus = "Paid" | "Partial" | "Udhaar";
export type Bill = {
  no: string; client: string; amount: number; status: BillStatus; time: string;
  items: { name: string; qty: number; rate: number }[]; paid: number; method: "Cash" | "UPI" | "Bank";
};

let products: Product[] = [
  { id: "p1", name: "Type-C Cable 1m (Fast Charge)", sku: "CBL-TC1M", kind: "cable", stock: 240, retailRate: 149, wholesaleRate: 92 },
  { id: "p7", name: "Type-C to Type-C Cable 2m", sku: "CBL-CC2M", kind: "cable", stock: 8, retailRate: 249, wholesaleRate: 168 },
  { id: "p2", name: "Silicone Back Cover - Redmi Note 12 (Black)", sku: "CVR-RN12B", kind: "cover", stock: 64, retailRate: 199, wholesaleRate: 110 },
  { id: "p3", name: "Tempered Glass - iPhone 13", sku: "TG-IP13", kind: "glass", stock: 12, retailRate: 249, wholesaleRate: 120 },
  { id: "p4", name: "20W Fast Charger (Type-C)", sku: "CHG-20W", kind: "charger", stock: 38, retailRate: 799, wholesaleRate: 540 },
  { id: "p5", name: "Wired Earphones 3.5mm (White)", sku: "EAR-35W", kind: "audio", stock: 5, retailRate: 299, wholesaleRate: 165 },
  { id: "p6", name: "10000mAh Power Bank", sku: "PB-10K", kind: "power", stock: 22, retailRate: 1299, wholesaleRate: 940 },
];

const clients: Client[] = [
  { id: "c1", name: "Sharma Mobile Zone", type: "Retailer", city: "Karol Bagh", pending: 24500 },
  { id: "c2", name: "Gupta Telecom", type: "Wholesaler", city: "Chandni Chowk", pending: 112000 },
  { id: "c3", name: "New Star Communication", type: "Retailer", city: "Laxmi Nagar", pending: 0 },
];

const bills: Bill[] = [
  { no: "B-1048", client: "Gupta Telecom", amount: 18400, status: "Partial", time: "6:42 pm", paid: 10000, method: "UPI",
    items: [{ name: "20W Fast Charger (Type-C)", qty: 20, rate: 540 }, { name: "Type-C Cable 1m (Fast Charge)", qty: 83, rate: 92 }] },
  { no: "B-1047", client: "Sharma Mobile Zone", amount: 6250, status: "Paid", time: "5:15 pm", paid: 6250, method: "Cash",
    items: [{ name: "Tempered Glass - iPhone 13", qty: 15, rate: 249 }, { name: "Silicone Back Cover - Redmi Note 12 (Black)", qty: 12, rate: 209 }] },
  { no: "B-1046", client: "Walk-in", amount: 1448, status: "Paid", time: "3:58 pm", paid: 1448, method: "UPI",
    items: [{ name: "10000mAh Power Bank", qty: 1, rate: 1299 }, { name: "Type-C Cable 1m (Fast Charge)", qty: 1, rate: 149 }] },
  { no: "B-1045", client: "New Star Communication", amount: 9870, status: "Udhaar", time: "1:20 pm", paid: 0, method: "Cash",
    items: [{ name: "Wired Earphones 3.5mm (White)", qty: 30, rate: 299 }, { name: "Type-C Cable 1m (Fast Charge)", qty: 6, rate: 149 }] },
  { no: "B-1044", client: "Sharma Mobile Zone", amount: 12282, status: "Paid", time: "11:05 am", paid: 12282, method: "Bank",
    items: [{ name: "20W Fast Charger (Type-C)", qty: 12, rate: 799 }, { name: "Tempered Glass - iPhone 13", qty: 11, rate: 249 }] },
];

export const business = { name: "Rakesh Mobile Accessories", owner: "Rakesh", address: "Gaffar Market, Karol Bagh, New Delhi", gstin: "07ABCPR4521K1Z3", phone: "+91 98110 42217" };

export async function getDashboard() {
  return {
    todaySales: 48250, deltaPct: 12, profit: 9640, pendingUdhaar: 186000,
    week: [31200, 38900, 35400, 42100, 39800, 43080, 48250].map((v, i) => ({ d: i, v })),
    tasks: { lowStock: 6, clientsDue: 4, draftBills: 2 },
  };
}
export async function getRecentBills(): Promise<Bill[]> { return bills; }
export async function getClients(): Promise<Client[]> { return clients; }
export async function getProducts(): Promise<Product[]> { return products; }

export type ProductInput = Omit<Product, "id">;
// Mock persistence: swaps for a REST call to `${API_BASE}/products` later.
export async function saveProduct(input: ProductInput & { id?: string }): Promise<Product> {
  if (input.id) {
    const updated = { ...products.find((p) => p.id === input.id), ...input } as Product;
    products = products.map((p) => (p.id === input.id ? updated : p));
    return updated;
  }
  const created = { ...input, id: `p${Date.now()}` };
  products = [created, ...products];
  return created;
}
export async function deleteProduct(id: string) {
  products = products.filter((p) => p.id !== id);
}

export type Role = "retailer" | "wholesaler" | "distributor";
export type RegisterInput = {
  name: string; phone: string; email: string; password: string;
  shopName: string; role: Role; address: string; pincode: string; shopGstNumber?: string | undefined;
};
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// Mock accounts: stored locally until the accounts API exists.
export async function registerShop(input: RegisterInput) {
  await wait(900);
  localStorage.setItem("byield-account", JSON.stringify(input));
  return { ok: true as const };
}
export async function loginShop(email: string, password: string) {
  await wait(900);
  const saved = localStorage.getItem("byield-account");
  if (!saved) return { ok: false as const, error: "no-account" as const };
  const account = JSON.parse(saved) as RegisterInput;
  if (account.email.toLowerCase() !== email.trim().toLowerCase() || account.password !== password)
    return { ok: false as const, error: "bad-credentials" as const };
  return { ok: true as const, account: { name: account.name, shopName: account.shopName, role: account.role } };
}
export async function nextBillNo() { return "B-1049"; }

export function searchProducts(list: Product[], q: string) {
  const terms = q.toLowerCase().replace(/[-]/g, " ").split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return list.filter((p) => {
    const hay = (p.name + " " + p.sku).toLowerCase().replace(/[-]/g, " ");
    return terms.every((t) => hay.includes(t));
  });
}

export function rateFor(p: Product, type: ClientType | "Walk-in") {
  return type === "Wholesaler" ? p.wholesaleRate : p.retailRate;
}
