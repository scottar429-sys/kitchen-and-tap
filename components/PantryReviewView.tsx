"use client";

import React, { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { PantryCategory, PantryItem, PantryUnit } from "./PantryInventory";

export type MenuPricingItem = {
  id: number;
  menuItemName: string;
  menuPrice: number;
  plateCost: number;
  foodCostPercent: number;
  profit: number;
};

type PantryReviewTargets = {
  targetFoodCostPercent: number;
  warningFoodCostPercent: number;
  highCostFoodCostPercent: number;
  defaultLowStockWarning: number;
};

type Props = {
  targets: PantryReviewTargets;
  setTargets: Dispatch<SetStateAction<PantryReviewTargets>>;
  items: PantryItem[];
  setItems: Dispatch<SetStateAction<PantryItem[]>>;
  vendorOptions: string[];
};

const pantryCategories: PantryCategory[] = [
  "Protein",
  "Produce",
  "Dairy",
  "Dry Goods",
  "Sauce",
  "Spice",
  "Frozen",
  "Other",
];

const packUnits: PantryUnit[] = ["lb", "oz", "each", "gallon", "quart"];
const countUnits: PantryUnit[] = ["case", "each", "lb", "oz", "gallon", "quart"];

function isValidPackUnit(unit?: string) {
  return packUnits.includes(unit as PantryUnit);
}

function getPackUnit(item: PantryItem) {
  return isValidPackUnit(item.caseUnit) ? item.caseUnit : "";
}

function getPackUnitLabel(item: PantryItem) {
  const unit = getPackUnit(item);
  return unit || "Choose pack unit";
}

function money(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function costPerBaseUnit(item: PantryItem) {
  const packSize = Number(item.caseSize || 0);
  const packUnit = getPackUnit(item);
  if (packSize <= 0 || !packUnit) return 0;
  return Number(item.caseCost || 0) / packSize;
}

function neededCountUnits(item: PantryItem) {
  return Math.max(Number(item.targetInventory || 0) - Number(item.currentInventory || 0), 0);
}

function suggestedOrderCount(item: PantryItem) {
  return Math.ceil(neededCountUnits(item));
}

function unitLabel(value: number, unit: string) {
  const cleanUnit = unit || "unit";
  if (Number(value) === 1) return cleanUnit;
  if (cleanUnit === "each") return "each";
  if (cleanUnit === "case") return "cases";
  return cleanUnit;
}

export default function PantryReviewView({
  items,
  setItems,
  vendorOptions,
}: Props) {
  const [openItemId, setOpenItemId] = useState<number | null>(null);

  const stats = useMemo(() => {
    return {
      totalItems: items.length,
      inventoryValue: items.reduce(
        (sum, item) => sum + Number(item.currentInventory || 0) * Number(item.caseCost || 0),
        0
      ),
      missingVendor: items.filter(
        (item) => !item.vendor || item.vendor === "Unassigned Vendor"
      ).length,
      missingCost: items.filter((item) => Number(item.caseCost || 0) <= 0).length,
      needsUpdate: items.filter((item) => !item.inventoryReviewed).length,
    };
  }, [items]);

  function addItem() {
    const newItem: PantryItem = {
      id: Date.now(),
      itemName: "New Pantry Item",
      category: "Other",
      vendor: "Unassigned Vendor",
      vendorStatus: "active",

      // Purchase setup
      caseCost: 0,
      caseSize: 1,
      caseUnit: "each",

      // Inventory count setup
      currentInventory: 0,
      targetInventory: 0,
      inventoryUnit: "case",

      orderQuantity: 0,
      inventoryReviewed: false,
      prepExtraEnabled: false,
      prepExtra: 0,
    };

    setItems((prev) => [...prev, newItem]);
    setOpenItemId(newItem.id);
  }

  function updateItem(
    id: number,
    field: keyof PantryItem,
    value: string | number | boolean
  ) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              inventoryReviewed: false,
            }
          : item
      )
    );
  }

  function markUpdated(id: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, inventoryReviewed: true } : item
      )
    );
  }

  function deleteItem(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (openItemId === id) setOpenItemId(null);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
          Manager Setup
        </p>

        <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
          Inventory Catalog
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Add pantry products, assign vendors, set purchase costs, and define pack sizes. Inventory counts and ordering stay on the Inventory page.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500">Catalog Items</p>
          <p className="text-2xl font-bold">{stats.totalItems}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500">Inventory Value</p>
          <p className="text-2xl font-bold">{money(stats.inventoryValue)}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500">No Vendor</p>
          <p className="text-2xl font-bold text-red-700">{stats.missingVendor}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500">Missing Cost</p>
          <p className="text-2xl font-bold text-orange-700">{stats.missingCost}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500">Needs Update</p>
          <p className="text-2xl font-bold text-orange-700">{stats.needsUpdate}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
        <p className="font-extrabold">Simple setup model</p>
        <p className="mt-1">
          Example: Eggs cost $40 per case, pack size is 48 each, and inventory is counted by case. Prep Station can still use eggs as 1 each, 2 each, etc.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={addItem}
          className="rounded-xl bg-orange-700 px-5 py-3 text-sm font-bold text-white shadow hover:bg-orange-800"
        >
          + Add Catalog Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-gray-500 shadow">
          No pantry items found. Add your first catalog item to start building the pantry.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isOpen = openItemId === item.id;
            const missingVendor = !item.vendor || item.vendor === "Unassigned Vendor";
            const missingCost = Number(item.caseCost || 0) <= 0;
            const packSize = Number(item.caseSize || 0);
            const packUnit = getPackUnit(item);
            const packUnitLabel = getPackUnitLabel(item);
            const needed = neededCountUnits(item);
            const suggested = suggestedOrderCount(item);

            return (
              <div key={item.id} className="overflow-hidden rounded-2xl border bg-white shadow">
                <button
                  type="button"
                  onClick={() => setOpenItemId(isOpen ? null : item.id)}
                  className="w-full p-4 text-left hover:bg-orange-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">{item.itemName}</h3>
                      <p className="text-sm text-gray-500">
                        {item.vendor || "Unassigned Vendor"} • {item.category}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xl font-bold text-gray-500">{isOpen ? "▲" : "▼"}</span>
                      {!item.inventoryReviewed ? (
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
                          Needs Update
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                          Updated
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Purchase Cost</p>
                      <p className="font-bold">{money(item.caseCost)}</p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Pack Size</p>
                      <p className="font-bold">
                        {packSize} {packUnitLabel}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Cost / {packUnitLabel}</p>
                      <p className="font-bold">{money(costPerBaseUnit(item))}</p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Count Unit</p>
                      <p className="font-bold">{item.inventoryUnit}</p>
                    </div>

                    <div className="rounded-xl bg-red-50 p-3 text-red-800">
                      <p className="text-xs">Suggested Order</p>
                      <p className="font-bold">
                        {suggested} {unitLabel(suggested, item.inventoryUnit)}
                      </p>
                    </div>
                  </div>

                  {(missingVendor || missingCost) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {missingVendor ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                          No Vendor
                        </span>
                      ) : null}

                      {missingCost ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                          Missing Cost
                        </span>
                      ) : null}
                    </div>
                  )}
                </button>

                {isOpen ? (
                  <div className="border-t bg-white p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Item Name</label>
                        <input
                          value={item.itemName}
                          onChange={(e) => updateItem(item.id, "itemName", e.target.value)}
                          className="mt-1 w-full rounded-xl border p-3"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Category</label>
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(item.id, "category", e.target.value as PantryCategory)}
                          className="mt-1 w-full rounded-xl border bg-white p-3"
                        >
                          {pantryCategories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Vendor</label>
                        <select
                          value={item.vendor || "Unassigned Vendor"}
                          onChange={(e) => updateItem(item.id, "vendor", e.target.value)}
                          className="mt-1 w-full rounded-xl border bg-white p-3"
                        >
                          <option value="Unassigned Vendor">Unassigned Vendor</option>
                          {vendorOptions
                            .filter((vendor) => vendor !== "All Vendors")
                            .map((vendor) => (
                              <option key={vendor} value={vendor}>{vendor}</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <h4 className="font-extrabold text-gray-900">Purchase Setup</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Enter how the product is bought and priced by the vendor.
                      </p>

                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500">Purchase Cost</label>
                          <input
                            type="number"
                            value={item.caseCost}
                            onChange={(e) => updateItem(item.id, "caseCost", Math.max(Number(e.target.value || 0), 0))}
                            className="mt-1 w-full rounded-xl border bg-white p-3"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500">Pack Size</label>
                          <input
                            type="number"
                            value={item.caseSize}
                            onChange={(e) => updateItem(item.id, "caseSize", Math.max(Number(e.target.value || 0), 0))}
                            className="mt-1 w-full rounded-xl border bg-white p-3"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500">Pack Unit</label>
                          <select
                            value={packUnit}
                            onChange={(e) => updateItem(item.id, "caseUnit", e.target.value as PantryUnit)}
                            className="mt-1 w-full rounded-xl border bg-white p-3"
                          >
                            <option value="" disabled>Choose pack unit</option>
                            {packUnits.map((unit) => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl bg-white p-3 text-sm text-gray-700">
                        {packUnit ? (
                          <>
                            <span className="font-bold">Costing:</span> {money(item.caseCost)} ÷ {packSize || 0} {packUnit} = {money(costPerBaseUnit(item))} per {packUnit}
                          </>
                        ) : (
                          <span className="font-bold text-red-700">Choose a pack unit before using this item in Prep Station.</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <h4 className="font-extrabold text-gray-900">Inventory Count Setup</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Enter how the kitchen counts this item for inventory and ordering.
                      </p>

                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500">Current Count</label>
                          <input
                            type="number"
                            value={item.currentInventory}
                            onChange={(e) => updateItem(item.id, "currentInventory", Math.max(Number(e.target.value || 0), 0))}
                            className="mt-1 w-full rounded-xl border bg-white p-3"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500">Target Count</label>
                          <input
                            type="number"
                            value={item.targetInventory}
                            onChange={(e) => updateItem(item.id, "targetInventory", Math.max(Number(e.target.value || 0), 0))}
                            className="mt-1 w-full rounded-xl border bg-white p-3"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500">Count Unit</label>
                          <select
                            value={item.inventoryUnit}
                            onChange={(e) => updateItem(item.id, "inventoryUnit", e.target.value as PantryUnit)}
                            className="mt-1 w-full rounded-xl border bg-white p-3"
                          >
                            {countUnits.map((unit) => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                      <h4 className="font-extrabold text-gray-900">Ordering Snapshot</h4>

                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div>
                          <p className="text-xs text-gray-500">Needed</p>
                          <p className="text-lg font-bold">{needed} {unitLabel(needed, item.inventoryUnit)}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Suggested Order</p>
                          <p className="text-lg font-bold">{suggested} {unitLabel(suggested, item.inventoryUnit)}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Pack Size</p>
                          <p className="text-lg font-bold">{packSize || 0} {packUnitLabel}</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-white/70 p-3 text-sm font-semibold text-red-800">
                        Ordering is currently an estimate. Later, Kitchen & Tap can improve this using order history, sales patterns, events, and seasonal trends.
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => markUpdated(item.id)}
                        className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800"
                      >
                        Mark Updated
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        className="rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800"
                      >
                        Delete Item
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
