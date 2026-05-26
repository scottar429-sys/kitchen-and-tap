export type VendorCategory = "Pantry" | "Bar" | "Both";

export type Vendor = {
  id: string;
  vendorNumber: string;
  name: string;
  category: VendorCategory;
  phone: string;
  email?: string;
  website?: string;
  contactName?: string;
  customerNumber?: string;
  minimumOrder?: string;
  orderDays: string[];
  deliveryDays: string[];
  notes?: string;
  active: boolean;
};

export const mockVendors: Vendor[] = [
  {
    id: "vendor-001",
    vendorNumber: "V-001",
    name: "Sysco",
    category: "Pantry",
    phone: "555-555-0101",
    email: "orders@syscoexample.com",
    website: "https://www.sysco.com",
    contactName: "Sales Rep",
    customerNumber: "123456",
    minimumOrder: "500",
    orderDays: ["Monday", "Thursday"],
    deliveryDays: ["Tuesday", "Friday"],
    notes: "Primary food vendor.",
    active: true,
  },
  {
    id: "vendor-002",
    vendorNumber: "V-002",
    name: "Southern Glazer's",
    category: "Bar",
    phone: "555-555-0202",
    email: "rep@example.com",
    website: "https://www.southernglazers.com",
    contactName: "Liquor Rep",
    customerNumber: "BAR-78910",
    minimumOrder: "300",
    orderDays: ["Tuesday"],
    deliveryDays: ["Thursday"],
    notes: "Liquor, wine, and bar inventory.",
    active: true,
  },
  {
    id: "vendor-003",
    vendorNumber: "V-003",
    name: "Local Produce Co.",
    category: "Pantry",
    phone: "555-555-0303",
    contactName: "Produce Rep",
    customerNumber: "PROD-222",
    minimumOrder: "150",
    orderDays: ["Monday", "Wednesday", "Friday"],
    deliveryDays: ["Tuesday", "Thursday", "Saturday"],
    notes: "Fresh produce vendor.",
    active: true,
  },
];