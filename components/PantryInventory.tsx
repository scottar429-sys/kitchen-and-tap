"use client";

import React from "react";

export type PantryCategory =
  | "Protein"
  | "Produce"
  | "Dairy"
  | "Dry Goods"
  | "Sauce"
  | "Spice"
  | "Frozen"
  | "Other";

export type PantryUnit = "lb" | "oz" | "each" | "case" | "gallon" | "quart";

export type PantryItem = {
  id: number;
  itemName: string;
  category: PantryCategory;
  vendor: string;

  caseCost: number;
  caseSize: number;
  caseUnit: PantryUnit;

  currentInventory: number;
  targetInventory: number;
  inventoryUnit: PantryUnit;

  orderQuantity: number;
  inventoryReviewed: boolean;
};

type PantryInventoryProps = {
  items: PantryItem[];
  setItems: React.Dispatch<React.SetStateAction<PantryItem[]>>;
};

export default function PantryInventory({
  items,
  setItems,
}: PantryInventoryProps) {
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

  const autoFillSuggestedOrder = (id: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const needUnits = Math.max(
          item.targetInventory - item.currentInventory,
          0
        );

        const suggestedCases =
          needUnits > 0 && item.caseSize > 0
            ? Math.ceil(needUnits / item.caseSize)
            : 0;

        return {
          ...item,
          orderQuantity: suggestedCases,
        };
      })
    );
  };

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Pantry Inventory</h2>
          <p className="text-sm text-slate-500">
            Enter current inventory counts and review suggested order quantities.
          </p>
        </div>

        <button
          onClick={addItem}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">Category</th>
              <th className="p-3">Vendor</th>
              <th className="p-3">On Hand</th>
              <th className="p-3">Target</th>
              <th className="p-3">Need</th>
              <th className="p-3">Suggested Order</th>
              <th className="p-3">Order Qty</th>
              <th className="p-3">Projected Inventory</th>
              <th className="p-3">Status</th>
              <th className="p-3">Reviewed</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const needUnits = Math.max(
                item.targetInventory - item.currentInventory,
                0
              );

              const suggestedCases =
                needUnits > 0 && item.caseSize > 0
                  ? Math.ceil(needUnits / item.caseSize)
                  : 0;

              const suggestedUnits = suggestedCases * item.caseSize;

              const projectedInventory =
                item.currentInventory + item.orderQuantity * item.caseSize;

              const lowNeedWarning =
                needUnits > 0 && needUnits < item.caseSize * 0.25;

              const overTargetAmount =
                projectedInventory - item.targetInventory;

              const status =
                needUnits <= 0
                  ? "Stocked"
                  : lowNeedWarning
                  ? "Review"
                  : "Order";

              const statusClass =
                status === "Stocked"
                  ? "text-green-700"
                  : status === "Review"
                  ? "text-orange-700"
                  : "text-red-700";

              return (
                <tr key={item.id} className="border-t align-top">
                  <td className="p-3 font-medium text-slate-900">
                    {item.itemName}
                  </td>

                  <td className="p-3">{item.category}</td>

                  <td className="p-3">{item.vendor || "—"}</td>

                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={item.currentInventory}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "currentInventory",
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
                    {item.targetInventory} {item.inventoryUnit}
                  </td>

                  <td className="p-3 font-medium">
                    {needUnits.toFixed(1)} {item.inventoryUnit}
                  </td>

                  <td className="p-3 font-semibold">
                    {suggestedCases > 0 ? (
                      <div>
                        <div>
                          {suggestedCases} case
                          {suggestedCases > 1 ? "s" : ""}
                        </div>
                        <div className="text-xs text-slate-500">
                          {suggestedUnits.toFixed(1)} {item.inventoryUnit}
                        </div>
                      </div>
                    ) : (
                      "None"
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <input
                        type="number"
                        value={item.orderQuantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "orderQuantity",
                            Number(e.target.value)
                          )
                        }
                        className="w-24 rounded-lg border px-2 py-1"
                      />

                      <button
                        type="button"
                        onClick={() => autoFillSuggestedOrder(item.id)}
                        className="text-left text-xs font-medium text-orange-700 hover:text-orange-800"
                      >
                        Use suggested
                      </button>
                    </div>
                  </td>

                  <td className="p-3 font-medium">
                    {projectedInventory.toFixed(1)} {item.inventoryUnit}
                    {overTargetAmount > 0 ? (
                      <div className="text-xs text-slate-500">
                        +{overTargetAmount.toFixed(1)} over target
                      </div>
                    ) : null}
                  </td>

                  <td className={`p-3 font-semibold ${statusClass}`}>
                    {status}
                    {lowNeedWarning ? (
                      <div className="mt-1 max-w-36 text-xs font-normal text-slate-500">
                        Small shortage. Review before ordering full case.
                      </div>
                    ) : null}
                  </td>

                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={item.inventoryReviewed}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "inventoryReviewed",
                          e.target.checked
                        )
                      }
                    />
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
                <td colSpan={12} className="p-6 text-center text-slate-500">
                  No pantry items yet. Add your first item in Targets / Item
                  Pricing, then use this screen for weekly inventory counts.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}