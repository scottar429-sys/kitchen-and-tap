"use client";

import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { BarItem } from "./barBackTypes";

type BarItemWithVendor = BarItem & {
  vendorName?: string;
};

type Props = {
  items: BarItem[];
  setItems: Dispatch<SetStateAction<BarItem[]>>;
  openCalculatorForItem: (item: BarItem) => void;
  vendorOptions: string[];
};

function money(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function getUnitLabel(item: BarItem) {
  if (item.category === "Beer") return "kegs";
  if (item.category === "Cans/Bottles") return "cases";
  return "bottles";
}

function getTargetCostPercent(item: BarItem) {
  if (item.category === "Liquor") return 22;
  if (item.category === "Wine") return 32;
  if (item.category === "Beer") return 22;
  if (item.category === "Cans/Bottles") return 28;
  return 25;
}

function suggestedTargetOnHand(item: BarItem) {
  return Math.ceil(
    Math.max(
      Number(item.averageOrdered || 0) + Number(item.averageRemaining || 0),
      0
    )
  );
}

export default function BarBackReviewView({
  items,
  setItems,
  openCalculatorForItem,
  vendorOptions,
}: Props) {
  const stats = useMemo(() => {
    const pricingAlerts = items.filter(
      (item) => item.costPercent > getTargetCostPercent(item)
    );

    const avgCostPercent =
      items.length > 0
        ? items.reduce((sum, item) => sum + item.costPercent, 0) / items.length
        : 0;

    return {
      totalItems: items.length,
      pricingAlerts: pricingAlerts.length,
      avgCostPercent,
    };
  }, [items]);

  function updateReviewField(
    id: number,
    field: "targetInventory" | "bottleCost" | "menuPrice",
    value: string
  ) {
    const numericValue = Math.max(Number(value || 0), 0);
    const today = new Date().toISOString().split("T")[0];

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) return item;

        const updatedItem = {
          ...item,
          [field]: numericValue,
          lastPriceReview:
            field === "bottleCost" || field === "menuPrice"
              ? today
              : item.lastPriceReview,
          pricingAlertDismissed:
            field === "bottleCost" || field === "menuPrice"
              ? false
              : item.pricingAlertDismissed,
        };

        const profit = updatedItem.menuPrice - updatedItem.drinkCost;

        const costPercent =
          updatedItem.menuPrice > 0
            ? (updatedItem.drinkCost / updatedItem.menuPrice) * 100
            : 0;

        return {
          ...updatedItem,
          profit,
          costPercent,
        };
      })
    );
  }

  function updateVendor(id: number, vendorName: string) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              vendorName,
            }
          : item
      )
    );
  }

  function markReviewed(id: number) {
    const today = new Date().toISOString().split("T")[0];

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              lastPriceReview: today,
              pricingAlertDismissed: false,
            }
          : item
      )
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white p-4 shadow">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
          Quarterly Review
        </p>

        <h2 className="text-2xl font-bold text-gray-900">Targets & Pricing</h2>

        <p className="mt-1 text-sm text-gray-600">
          Update target on-hand levels, vendor assignments, bottle/case/keg
          costs, menu pricing, and margin review items.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="rounded-2xl bg-white p-3 shadow md:p-4">
          <p className="text-[11px] text-gray-500 md:text-xs">Items</p>
          <p className="text-xl font-bold md:text-2xl">{stats.totalItems}</p>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow md:p-4">
          <p className="text-[11px] text-gray-500 md:text-xs">Pricing Alerts</p>
          <p className="text-xl font-bold text-red-700 md:text-2xl">
            {stats.pricingAlerts}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow md:p-4">
          <p className="text-[11px] text-gray-500 md:text-xs">Avg Cost %</p>
          <p className="text-xl font-bold md:text-2xl">
            {stats.avgCostPercent.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const vendorItem = item as BarItemWithVendor;
          const targetCost = getTargetCostPercent(item);
          const suggestedTarget = suggestedTargetOnHand(item);

          const suggestedPrice =
            item.drinkCost > 0 ? item.drinkCost / (targetCost / 100) : 0;

          const pricingAlert = item.costPercent > targetCost;

          return (
            <div
              key={item.id}
              className="flex min-h-[620px] flex-col rounded-2xl bg-white p-4 shadow"
            >
              <div className="min-h-[132px]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-gray-900">
                      {item.productName}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {item.category} • {getUnitLabel(item)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      pricingAlert
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {pricingAlert ? "Review" : "OK"}
                  </span>
                </div>

                <div className="mt-3">
                  <label className="text-[11px] font-bold uppercase text-gray-500">
                    Vendor
                  </label>

                  <select
                    value={vendorItem.vendorName || "Unassigned Vendor"}
                    onChange={(event) =>
                      updateVendor(item.id, event.target.value)
                    }
                    className="mt-1 w-full rounded-xl border bg-white p-3 text-sm"
                  >
                    <option value="Unassigned Vendor">Unassigned Vendor</option>

                    {vendorOptions
                      .filter((vendor) => vendor !== "All Vendors")
                      .map((vendor) => (
                        <option key={vendor} value={vendor}>
                          {vendor}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[11px] text-gray-500">Current</p>
                  <p className="text-lg font-bold">{item.currentInventory}</p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[11px] text-gray-500">Target</p>
                  <p className="text-lg font-bold">{item.targetInventory}</p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[11px] text-gray-500">Cost %</p>
                  <p
                    className={`text-lg font-bold ${
                      pricingAlert ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    {item.costPercent.toFixed(1)}%
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[11px] text-gray-500">Goal %</p>
                  <p className="text-lg font-bold">{targetCost}%</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
                <p className="text-[11px] font-bold uppercase text-orange-800">
                  Suggested Target
                </p>

                <p className="text-xl font-bold text-orange-900">
                  {suggestedTarget} {getUnitLabel(item)}
                </p>

                <p className="min-h-[48px] text-xs text-orange-900">
                  Best used after 90 days of uninterrupted weekly inventory and
                  ordering data.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    updateReviewField(
                      item.id,
                      "targetInventory",
                      String(suggestedTarget)
                    )
                  }
                  className="mt-2 w-full rounded-xl bg-orange-700 px-3 py-2 text-sm font-bold text-white hover:bg-orange-800"
                >
                  Use Suggested Target
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500">
                    Target On Hand
                  </label>
                  <input
                    type="number"
                    value={item.targetInventory}
                    onChange={(event) =>
                      updateReviewField(
                        item.id,
                        "targetInventory",
                        event.target.value
                      )
                    }
                    className="mt-1 w-full rounded-xl border bg-white p-3"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500">
                    Bottle / Case / Keg Cost
                  </label>
                  <input
                    type="number"
                    value={item.bottleCost}
                    onChange={(event) =>
                      updateReviewField(item.id, "bottleCost", event.target.value)
                    }
                    className="mt-1 w-full rounded-xl border bg-white p-3"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500">
                    Menu Price
                  </label>
                  <input
                    type="number"
                    value={item.menuPrice}
                    onChange={(event) =>
                      updateReviewField(item.id, "menuPrice", event.target.value)
                    }
                    className="mt-1 w-full rounded-xl border bg-white p-3"
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
                <div>
                  <p className="text-[11px] text-gray-500">Drink Cost</p>
                  <p className="font-bold">{money(item.drinkCost)}</p>
                </div>

                <div>
                  <p className="text-[11px] text-gray-500">Profit</p>
                  <p className="font-bold">{money(item.profit)}</p>
                </div>

                <div>
                  <p className="text-[11px] text-gray-500">Suggested Price</p>
                  <p className="font-bold text-orange-700">
                    {money(suggestedPrice)}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-gray-500">Last Review</p>
                  <p className="font-bold">{item.lastPriceReview || "Not set"}</p>
                </div>
              </div>

              <div className="mt-auto space-y-2 pt-3">
                <button
                  type="button"
                  onClick={() => openCalculatorForItem(item)}
                  className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white hover:bg-gray-700"
                >
                  Open Saved Calculator
                </button>

                <button
                  type="button"
                  onClick={() => markReviewed(item.id)}
                  className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-800 hover:bg-orange-100"
                >
                  Mark Pricing Reviewed
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow">
        <h3 className="text-lg font-bold text-gray-900">
          Generate Quarterly Review
        </h3>

        <p className="mt-1 text-sm text-gray-700">
          Print a review showing target levels, suggested targets, pricing alerts,
          vendor assignments, cost percentages, and margin performance.
        </p>

        <button
          type="button"
          onClick={() => window.print()}
          className="mt-4 w-full rounded-xl bg-orange-700 px-4 py-3 text-sm font-bold text-white hover:bg-orange-800"
        >
          Generate Quarterly Review PDF
        </button>
      </div>
    </div>
  );
}