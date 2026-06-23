"use client";

import React, { useMemo, useState } from "react";

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
export type PantryPurchaseUnit =
  | "case"
  | "bag"
  | "box"
  | "can"
  | "jug"
  | "bottle"
  | "pail"
  | "tub"
  | "each";

export type PantryItem = {
  id: number;
  itemName: string;
  category: PantryCategory;
  vendor: string;
  vendorStatus?: "active" | "inactive";

  caseCost: number;
  caseSize: number;
  caseUnit: PantryUnit;
  purchaseUnit?: PantryPurchaseUnit | string;

  currentInventory: number;
  targetInventory: number;
  inventoryUnit: PantryUnit;

  orderQuantity: number;
  inventoryReviewed: boolean;

  prepExtraEnabled?: boolean;
  prepExtra?: number;
};

type PantryInventoryProps = {
  items: PantryItem[];
  setItems: React.Dispatch<React.SetStateAction<PantryItem[]>>;
};

function formatMoney(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function pluralize(unit: string, amount: number) {
  if (amount === 1) return unit;
  if (unit === "each") return "each";
  return `${unit}s`;
}

function getPurchaseUnit(item: PantryItem) {
  return item.purchaseUnit || "case";
}

function getNeed(item: PantryItem) {
  return Math.max(Number(item.targetInventory || 0) - Number(item.currentInventory || 0), 0);
}

function getFinalNeed(item: PantryItem) {
  return getNeed(item) + (item.prepExtraEnabled ? Number(item.prepExtra || 0) : 0);
}

function countUnitMatchesPurchaseUnit(item: PantryItem) {
  return item.inventoryUnit === getPurchaseUnit(item);
}

function getSuggestedOrder(item: PantryItem) {
  const finalNeed = getFinalNeed(item);

  if (finalNeed <= 0) return 0;
  if (countUnitMatchesPurchaseUnit(item)) return Math.ceil(finalNeed);
  if (Number(item.caseSize || 0) <= 0) return 0;

  return Math.ceil(finalNeed / Number(item.caseSize || 0));
}

function getIncomingCountUnits(item: PantryItem) {
  const orderQuantity = Number(item.orderQuantity || 0);

  if (countUnitMatchesPurchaseUnit(item)) return orderQuantity;
  return orderQuantity * Number(item.caseSize || 0);
}

function getProjectedInventory(item: PantryItem) {
  return Number(item.currentInventory || 0) + getIncomingCountUnits(item);
}

function getOrderValue(item: PantryItem) {
  return Number(item.orderQuantity || 0) * Number(item.caseCost || 0);
}

function getInventoryValue(item: PantryItem, count: number) {
  if (countUnitMatchesPurchaseUnit(item)) {
    return count * Number(item.caseCost || 0);
  }

  const unitCost = Number(item.caseSize || 0) > 0 ? Number(item.caseCost || 0) / Number(item.caseSize || 0) : 0;
  return count * unitCost;
}

function getStatusClass(finalNeed: number) {
  return finalNeed <= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700";
}

export default function PantryInventory({ items, setItems }: PantryInventoryProps) {
  const [selectedVendor, setSelectedVendor] = useState("");

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

  const useSuggestedOrder = (item: PantryItem) => {
    updateItem(item.id, "orderQuantity", getSuggestedOrder(item));
  };

  const vendorOptions = useMemo(() => {
    return Array.from(
      new Set(items.map((item) => item.vendor || "Unassigned Vendor"))
    ).sort();
  }, [items]);

  React.useEffect(() => {
    if (!selectedVendor && vendorOptions.length > 0) {
      setSelectedVendor(vendorOptions[0]);
    }
  }, [selectedVendor, vendorOptions]);

  const selectedVendorItems = useMemo(() => {
    return items.filter(
      (item) => (item.vendor || "Unassigned Vendor") === selectedVendor
    );
  }, [items, selectedVendor]);

  const selectedVendorOrderItems = selectedVendorItems.filter(
    (item) => Number(item.orderQuantity || 0) > 0
  );

  const selectedVendorTotal = selectedVendorOrderItems.reduce(
    (sum, item) => sum + getOrderValue(item),
    0
  );

  const summary = {
    itemsToOrder: items.filter((item) => getFinalNeed(item) > 0).length,
    orderValue: items.reduce((sum, item) => sum + getOrderValue(item), 0),
    suggestedOrderValue: items.reduce(
      (sum, item) => sum + getSuggestedOrder(item) * Number(item.caseCost || 0),
      0
    ),
    currentInventoryValue: items.reduce(
      (sum, item) => sum + getInventoryValue(item, Number(item.currentInventory || 0)),
      0
    ),
    targetInventoryValue: items.reduce(
      (sum, item) => sum + getInventoryValue(item, Number(item.targetInventory || 0)),
      0
    ),
  };

  function createVendorPdfOrderSheet() {
    alert(
      `Future feature: create a PDF order sheet for ${selectedVendor}. This will include pantry items, order quantities, units, and estimated totals.`
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
          Pantry Inventory
        </p>

        <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
          Inventory Count & Orders
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Count what is on hand, compare it to target inventory, and create vendor orders. New products, costs, vendors, and pack sizes are managed in Inventory Catalog.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-gray-500 shadow">
          No pantry items found. Add products in Inventory Catalog first.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const need = getNeed(item);
            const finalNeed = getFinalNeed(item);
            const suggestedOrder = getSuggestedOrder(item);
            const incomingCountUnits = getIncomingCountUnits(item);
            const projectedInventory = getProjectedInventory(item);
            const purchaseUnit = getPurchaseUnit(item);
            const inactiveVendor = item.vendorStatus === "inactive";

            return (
              <article
                key={item.id}
                className={`rounded-2xl border bg-white p-5 shadow ${
                  inactiveVendor ? "border-red-200" : "border-gray-100"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold leading-tight text-gray-900">
                        {item.itemName}
                      </h3>

                      <p className="text-sm text-gray-600">
                        {item.vendor || "Unassigned Vendor"} • {item.category}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                        finalNeed
                      )}`}
                    >
                      {finalNeed > 0 ? "Needs Order" : "OK"}
                    </span>
                  </div>

                  {inactiveVendor ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
                      Vendor inactive — update this item in Inventory Catalog.
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1 rounded-xl border bg-white p-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Counted On Hand
                      </span>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.currentInventory}
                          onChange={(e) =>
                            updateItem(item.id, "currentInventory", Number(e.target.value))
                          }
                          className="min-w-0 flex-1 rounded-lg border bg-white p-2 text-lg font-bold text-gray-900 outline-none focus:border-orange-700"
                        />
                        <span className="text-sm font-semibold text-gray-600">
                          {item.inventoryUnit}
                        </span>
                      </div>
                    </label>

                    <div className="rounded-xl bg-[#f8f3ec] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Target Count
                      </p>

                      <p className="text-lg font-bold text-gray-900">
                        {item.targetInventory} {item.inventoryUnit}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#f8f3ec] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Short
                      </p>

                      <p className="text-lg font-bold text-gray-900">
                        {need.toFixed(1)} {item.inventoryUnit}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#f8f3ec] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Pack Size
                      </p>

                      <p className="text-lg font-bold text-gray-900">
                        {item.caseSize} per {purchaseUnit}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-orange-100 bg-orange-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-800">
                          Suggested Order
                        </p>

                        <p className="text-xl font-extrabold text-gray-900">
                          {suggestedOrder} {pluralize(purchaseUnit, suggestedOrder)}
                        </p>

                        <p className="text-xs text-gray-600">
                          Adds {incomingCountUnits.toFixed(1)} {item.inventoryUnit} to inventory.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => useSuggestedOrder(item)}
                        className="rounded-xl bg-orange-700 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-800"
                      >
                        Use
                      </button>
                    </div>
                  </div>

                  <label className="block space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actual Order Quantity ({purchaseUnit})
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.orderQuantity}
                      onChange={(e) =>
                        updateItem(item.id, "orderQuantity", Number(e.target.value))
                      }
                      className="w-full rounded-xl border bg-white p-3 text-lg font-bold text-gray-900 outline-none focus:border-orange-700"
                    />
                  </label>

                  <div className="rounded-xl bg-[#f8f3ec] p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Projected inventory</span>

                      <span className="font-bold text-gray-900">
                        {projectedInventory.toFixed(1)} {item.inventoryUnit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Order value</span>

                      <span className="font-bold text-gray-900">
                        {formatMoney(getOrderValue(item))}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          Event / Prep Extra
                        </p>

                        <p className="text-xs text-gray-500">
                          Adds to this order without changing the normal target count.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateItem(item.id, "prepExtraEnabled", !item.prepExtraEnabled)
                        }
                        className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                          item.prepExtraEnabled
                            ? "bg-orange-700 text-white hover:bg-orange-800"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {item.prepExtraEnabled ? "On" : "Add"}
                      </button>
                    </div>

                    {item.prepExtraEnabled ? (
                      <label className="mt-3 block space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Extra Needed ({item.inventoryUnit})
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.prepExtra || 0}
                          onChange={(e) =>
                            updateItem(item.id, "prepExtra", Number(e.target.value))
                          }
                          className="w-full rounded-xl border bg-white p-3 font-bold text-gray-900 outline-none focus:border-orange-700"
                        />
                      </label>
                    ) : null}
                  </div>

                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={item.inventoryReviewed}
                      onChange={(e) =>
                        updateItem(item.id, "inventoryReviewed", e.target.checked)
                      }
                    />
                    Count reviewed
                  </label>
                </div>
              </article>
            );
          })}

          <article className="rounded-2xl border border-orange-200 bg-white p-5 shadow">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
                  Vendor Orders
                </p>

                <h3 className="mt-1 text-xl font-bold text-gray-900">
                  Create Vendor Order Sheet
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  Select a vendor and prepare a pantry order sheet. Later this can generate a PDF to print, save, or email.
                </p>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Vendor
                </span>

                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full rounded-xl border bg-white p-3 font-semibold text-gray-900 outline-none focus:border-orange-700"
                >
                  {vendorOptions.map((vendor) => (
                    <option key={vendor} value={vendor}>
                      {vendor}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl bg-[#f8f3ec] p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Items from vendor</span>

                  <span className="font-bold text-gray-900">
                    {selectedVendorItems.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Items on this order</span>

                  <span className="font-bold text-gray-900">
                    {selectedVendorOrderItems.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estimated order total</span>

                  <span className="font-bold text-gray-900">
                    {formatMoney(selectedVendorTotal)}
                  </span>
                </div>
              </div>

              <div className="max-h-44 space-y-2 overflow-auto rounded-xl border bg-white p-3">
                {selectedVendorOrderItems.length > 0 ? (
                  selectedVendorOrderItems.map((item) => {
                    const purchaseUnit = getPurchaseUnit(item);
                    return (
                      <div
                        key={item.id}
                        className="rounded-lg bg-[#f8f3ec] p-2 text-sm"
                      >
                        <p className="font-bold text-gray-900">{item.itemName}</p>

                        <p className="text-xs text-gray-600">
                          {item.orderQuantity} {pluralize(purchaseUnit, Number(item.orderQuantity || 0))} · {formatMoney(getOrderValue(item))}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">
                    No order quantities entered for this vendor yet.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={createVendorPdfOrderSheet}
                className="w-full rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white hover:bg-orange-800"
              >
                Create Vendor PDF Order Sheet
              </button>
            </div>
          </article>
        </div>
      )}

      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="text-xl font-bold text-gray-900">
          Inventory Summary
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500">Items Needing Order</p>

            <p className="text-2xl font-bold text-gray-900">
              {summary.itemsToOrder}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500">Current Order Value</p>

            <p className="text-2xl font-bold text-gray-900">
              {formatMoney(summary.orderValue)}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500">Suggested Order Value</p>

            <p className="text-2xl font-bold text-gray-900">
              {formatMoney(summary.suggestedOrderValue)}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500">Current Inventory Value</p>

            <p className="text-2xl font-bold text-gray-900">
              {formatMoney(summary.currentInventoryValue)}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500">Target Inventory Value</p>

            <p className="text-2xl font-bold text-gray-900">
              {formatMoney(summary.targetInventoryValue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
