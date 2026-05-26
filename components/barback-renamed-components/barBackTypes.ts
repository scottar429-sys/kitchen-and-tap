export type BarView =
  | "inventory"
  | "target"
  | "pricing"
  | "import";

export type BarCategory =
  | "Liquor"
  | "Wine"
  | "Beer"
  | "Cans/Bottles";

export type CategoryFilter =
  | "All"
  | BarCategory;

export type PricingStrategy =
  | "Target Cost %"
  | "Markup %"
  | "Manual Price";

export type SortMode =
  | "Need to Order First"
  | "Pricing Review First"
  | "Needs Inventory Review"
  | "Lowest Current Inventory"
  | "Highest Cost %"
  | "Alphabetical";

export type BarItem = {
  id: number;

  productName: string;

  category: BarCategory;

  bottleCost: number;

  bottleSize: string;

  pourSize: number;

  menuPrice: number;

  drinkCost: number;

  costPercent: number;

  profit: number;

  targetInventory: number;

  currentInventory: number;

  inventoryReviewed: boolean;

  eventAddEnabled: boolean;

  eventAdd: number;

  averageOrdered: number;

  averageRemaining: number;

  lastPriceReview: string;

  pricingAlertDismissed: boolean;
};

export type ImportProduct = {
  name: string;
  category: BarCategory;
};