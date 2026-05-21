"use client";

import React, { useMemo, useState } from "react";

import PantryInventory, { PantryItem } from "./PantryInventory";
import PantryPricingView, { MenuPricingItem } from "./PantryPricingView";
import PantryTargets, {
  PantryTargets as PantryTargetsType,
} from "./PantryTargets";

import { mockPantryItems } from "./mockPantryData";

type PantryView = "inventory" | "pricing" | "targets";

const startingPantryItems: PantryItem[] = mockPantryItems;

const startingMenuItems: MenuPricingItem[] = [
  {
    id: 1,
    menuItemName: "Chicken Alfredo",
    menuPrice: 22,
    plateCost: 6.12,
    foodCostPercent: 27.8,
    profit: 15.88,
  },

  {
    id: 2,
    menuItemName: "House Burger",
    menuPrice: 18,
    plateCost: 5.9,
    foodCostPercent: 32.7,
    profit: 12.1,
  },

  {
    id: 3,
    menuItemName: "Ribeye Dinner",
    menuPrice: 38,
    plateCost: 17.5,
    foodCostPercent: 46,
    profit: 20.5,
  },
];

export default function Pantry() {
  const [activeView, setActiveView] =
    useState<PantryView>("inventory");

  const [searchTerm, setSearchTerm] = useState("");

  const [pantryItems, setPantryItems] =
    useState<PantryItem[]>(startingPantryItems);

  const [menuItems, setMenuItems] =
    useState<MenuPricingItem[]>(startingMenuItems);

  const [targets, setTargets] =
    useState<PantryTargetsType>({
      targetFoodCostPercent: 30,
      warningFoodCostPercent: 35,
      highCostFoodCostPercent: 40,
      defaultLowStockWarning: 1,
    });

  const filteredPantryItems = useMemo(() => {
    return pantryItems.filter((item) =>
      item.itemName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [pantryItems, searchTerm]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) =>
      item.menuItemName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [menuItems, searchTerm]);

  const lowStockCount = pantryItems.filter(
    (item) => item.currentInventory < item.targetInventory
  ).length;

  const totalInventoryValue = pantryItems.reduce(
    (sum, item) => {
      const costPerUnit =
        item.caseSize > 0
          ? item.caseCost / item.caseSize
          : 0;

      return sum + item.currentInventory * costPerUnit;
    },
    0
  );

  const averageFoodCost =
    menuItems.length > 0
      ? menuItems.reduce(
          (sum, item) => sum + item.foodCostPercent,
          0
        ) / menuItems.length
      : 0;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Pantry
        </h1>

        <p className="text-sm text-slate-600">
          Track pantry inventory, suggested orders,
          item pricing, and menu profitability.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">
            Inventory Value
          </p>

          <p className="text-2xl font-bold">
            ${totalInventoryValue.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">
            Items Below Target
          </p>

          <p className="text-2xl font-bold">
            {lowStockCount}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">
            Avg Food Cost
          </p>

          <p className="text-2xl font-bold">
            {averageFoodCost.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveView("inventory")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              activeView === "inventory"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Inventory
          </button>

          <button
            onClick={() => setActiveView("pricing")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              activeView === "pricing"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Pricing
          </button>

          <button
            onClick={() => setActiveView("targets")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              activeView === "targets"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Targets / Item Pricing
          </button>
        </div>

        <input
          type="text"
          placeholder={
            activeView === "pricing"
              ? "Search menu items..."
              : "Search pantry items..."
          }
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          className="w-full rounded-xl border px-4 py-2 text-sm md:w-72"
        />
      </div>

      {activeView === "inventory" ? (
        <PantryInventory
          items={filteredPantryItems}
          setItems={setPantryItems}
        />
      ) : null}

      {activeView === "pricing" ? (
        <PantryPricingView
          items={filteredMenuItems}
          setItems={setMenuItems}
          targetFoodCostPercent={
            targets.targetFoodCostPercent
          }
          warningFoodCostPercent={
            targets.warningFoodCostPercent
          }
          highCostFoodCostPercent={
            targets.highCostFoodCostPercent
          }
        />
      ) : null}

      {activeView === "targets" ? (
        <PantryTargets
          targets={targets}
          setTargets={setTargets}
          items={filteredPantryItems}
          setItems={setPantryItems}
        />
      ) : null}
    </div>
  );
}