"use client";

import React from "react";
import { PantryCategory, PantryItem, PantryUnit } from "./PantryInventory";

export type PantryTargets = {
  targetFoodCostPercent: number;
  warningFoodCostPercent: number;
  highCostFoodCostPercent: number;
  defaultLowStockWarning: number;
};

type PantryTargetsProps = {
  targets: PantryTargets;
  setTargets: React.Dispatch<React.SetStateAction<PantryTargets>>;
  items: PantryItem[];
  setItems: React.Dispatch<React.SetStateAction<PantryItem[]>>;
};

const categories: PantryCategory[] = [
  "Protein",
  "Produce",
  "Dairy",
  "Dry Goods",
  "Sauce",
  "Spice",
  "Frozen",
  "Other",
];

const units: PantryUnit[] = ["lb", "oz", "each", "case", "gallon", "quart"];

export default function PantryTargets({
  targets,
  setTargets,
  items,
  setItems,
}: PantryTargetsProps) {
  const updateTarget = (field: keyof PantryTargets, value: number) => {
    setTargets((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addItem = () => {
    const newItem: PantryItem = {
      id: Date.now(),
      itemName: "New Pantry Item",
      category: "Other",
      vendor: "",

      caseCost: 0,
      caseSize: 1,
      caseUnit: "each",

      currentInventory: 0,
      targetInventory: 0,
      inventoryUnit: "each",

      orderQuantity: 0,
      inventoryReviewed: false,
    };

    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (
    id: number,
    field: keyof PantryItem,
    value: string | number | boolean
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold text-slate-900">
            Food Cost Targets
          </h2>
          <p className="text-sm text-slate-500">
            These settings control menu pricing status labels.
          </p>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border p-4">
            <label className="text-sm font-medium text-slate-700">
              Target Food Cost %
            </label>
            <input
              type="number"
              value={targets.targetFoodCostPercent}
              onChange={(e) =>
                updateTarget("targetFoodCostPercent", Number(e.target.value))
              }
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="rounded-xl border p-4">
            <label className="text-sm font-medium text-slate-700">
              Warning Food Cost %
            </label>
            <input
              type="number"
              value={targets.warningFoodCostPercent}
              onChange={(e) =>
                updateTarget("warningFoodCostPercent", Number(e.target.value))
              }
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="rounded-xl border p-4">
            <label className="text-sm font-medium text-slate-700">
              High Cost Alert %
            </label>
            <input
              type="number"
              value={targets.highCostFoodCostPercent}
              onChange={(e) =>
                updateTarget("highCostFoodCostPercent", Number(e.target.value))
              }
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="rounded-xl border p-4">
            <label className="text-sm font-medium text-slate-700">
              Default Low Stock Warning
            </label>
            <input
              type="number"
              value={targets.defaultLowStockWarning}
              onChange={(e) =>
                updateTarget("defaultLowStockWarning", Number(e.target.value))
              }
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Item Pricing & Targets
            </h2>
            <p className="text-sm text-slate-500">
              Set item cost, pack size, units, and target inventory levels.
            </p>
          </div>

          <button
            onClick={addItem}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Add Pantry Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Item</th>
                <th className="p-3">Category</th>
                <th className="p-3">Vendor</th>
                <th className="p-3">Case Cost</th>
                <th className="p-3">Case Size</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Cost / Unit</th>
                <th className="p-3">Target Inventory</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => {
                const costPerUnit =
                  item.caseSize > 0 ? item.caseCost / item.caseSize : 0;

                return (
                  <tr key={item.id} className="border-t align-top">
                    <td className="p-3">
                      <input
                        value={item.itemName}
                        onChange={(e) =>
                          updateItem(item.id, "itemName", e.target.value)
                        }
                        className="w-44 rounded-lg border px-2 py-1"
                      />
                    </td>

                    <td className="p-3">
                      <select
                        value={item.category}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "category",
                            e.target.value as PantryCategory
                          )
                        }
                        className="rounded-lg border px-2 py-1"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3">
                      <input
                        value={item.vendor}
                        onChange={(e) =>
                          updateItem(item.id, "vendor", e.target.value)
                        }
                        className="w-36 rounded-lg border px-2 py-1"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        value={item.caseCost}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "caseCost",
                            Number(e.target.value)
                          )
                        }
                        className="w-24 rounded-lg border px-2 py-1"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        value={item.caseSize}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "caseSize",
                            Number(e.target.value)
                          )
                        }
                        className="w-24 rounded-lg border px-2 py-1"
                      />
                    </td>

                    <td className="p-3">
                      <select
                        value={item.caseUnit}
                        onChange={(e) => {
                          const selectedUnit = e.target.value as PantryUnit;
                          updateItem(item.id, "caseUnit", selectedUnit);
                          updateItem(item.id, "inventoryUnit", selectedUnit);
                        }}
                        className="rounded-lg border px-2 py-1"
                      >
                        {units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3 font-medium">
                      ${costPerUnit.toFixed(2)} / {item.caseUnit}
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={item.targetInventory}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "targetInventory",
                              Number(e.target.value)
                            )
                          }
                          className="w-24 rounded-lg border px-2 py-1"
                        />
                        <span className="text-xs text-slate-500">
                          {item.inventoryUnit}
                        </span>
                      </div>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}

              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500">
                    No pantry items yet. Add your first item here, then use the
                    Inventory tab for weekly counts.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}