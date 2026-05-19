import { BarItem } from "./barBackTypes";

export const startingItems: BarItem[] = [
  {
    id: 1,
    productName: "Tito's Vodka",
    category: "Liquor",

    currentInventory: 2.5,
    targetInventory: 6,

    averageOrdered: 4,
    averageRemaining: 2,

    bottleCost: 23.75,

    bottleSize: 25.36,
    pourSize: 1.5,

    drinkCost: 1.98,
    menuPrice: 8,

    profit: 6.02,
    costPercent: 24.75,

    lastPriceReview: "2026-05-01",

    pricingAlertDismissed: false,
    inventoryReviewed: false,

    eventAddEnabled: false,
    eventAdd: 0,
  },

  {
    id: 2,
    productName: "Bud Light",
    category: "Beer",

    currentInventory: 18,
    targetInventory: 48,

    averageOrdered: 24,
    averageRemaining: 12,

    bottleCost: 1.1,

    bottleSize: 1,
    pourSize: 1,

    drinkCost: 1.1,
    menuPrice: 4,

    profit: 2.9,
    costPercent: 27.5,

    lastPriceReview: "2026-05-01",

    pricingAlertDismissed: false,
    inventoryReviewed: false,

    eventAddEnabled: false,
    eventAdd: 0,
  },
];