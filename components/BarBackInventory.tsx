"use client";

import { useEffect, useMemo, useState } from "react";

import type { BarItem } from "./barBackTypes";

type BarItemWithVendor = BarItem & {
  vendorId?: string;
  vendorName?: string;
  vendorStatus?: "active" | "inactive";
  vendorOrderDays?: string[];
  orderUnit?: "single" | "bottle" | "case" | "keg" | "custom";
  caseSize?: number;
};

type BarBackInventoryProps = {
  items?: BarItem[];
  updateCurrentInventory: (id: number, value: string) => void;
  toggleEventAdd: (id: number) => void;
  updateEventAdd: (id: number, value: string) => void;
  baseNeed: (item: BarItem) => number;
  finalOrder: (item: BarItem) => number;
  getOrderStyle: (orderQty: number) => string;
  openCalculatorForItem: (item: BarItem) => void;
  openBulkImport?: () => void;
};

function formatMoney(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function getVendorName(item: BarItem) {
  const vendorItem = item as BarItemWithVendor;
  return vendorItem.vendorName || "Unassigned Vendor";
}

function isInactiveVendor(item: BarItem) {
  const vendorItem = item as BarItemWithVendor;
  return vendorItem.vendorStatus === "inactive";
}

function getPackSize(item: BarItem) {
  const vendorItem = item as BarItemWithVendor;

  if (item.category === "Draft Beer") {
    return 1;
  }

  if (vendorItem.caseSize && vendorItem.caseSize > 0) {
    return vendorItem.caseSize;
  }

  if (item.category === "Cans/Bottles") {
    return 24;
  }

  if (item.category === "Wine") {
    return 12;
  }

  return 1;
}

function getOrderUnitLabel(item: BarItem) {
  if (item.category === "Draft Beer") {
    return "keg";
  }

  const packSize = getPackSize(item);

  if (item.category === "Cans/Bottles") {
    return packSize > 1 ? "case" : "unit";
  }

  if (item.category === "Wine" && packSize > 1) {
    return "case";
  }

  return "bottle";
}

function getSuggestedOrderUnits(
  item: BarItem,
  finalOrder: (item: BarItem) => number
) {
  const neededUnits = finalOrder(item);
  const packSize = getPackSize(item);

  if (neededUnits <= 0) return 0;

  return Math.ceil(neededUnits / packSize);
}

function getSuggestedIncomingUnits(
  item: BarItem,
  finalOrder: (item: BarItem) => number
) {
  return getSuggestedOrderUnits(item, finalOrder) * getPackSize(item);
}

export default function BarBackInventory({
  items = [],
  updateCurrentInventory,
  toggleEventAdd,
  updateEventAdd,
  baseNeed,
  finalOrder,
  getOrderStyle,
  openCalculatorForItem,
  openBulkImport,
}: BarBackInventoryProps) {
  const [orderQtyById, setOrderQtyById] = useState<Record<number, string>>({});
  const [selectedVendor, setSelectedVendor] = useState("");

  useEffect(() => {
    setOrderQtyById((current) => {
      const next = { ...current };

      items.forEach((item) => {
        if (next[item.id] === undefined) {
          const suggestedQty = getSuggestedOrderUnits(item, finalOrder);
          next[item.id] = suggestedQty > 0 ? String(suggestedQty) : "";
        }
      });

      return next;
    });
  }, [items, finalOrder]);

  const vendorOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => getVendorName(item)))).sort();
  }, [items]);

  useEffect(() => {
    if (!selectedVendor && vendorOptions.length > 0) {
      setSelectedVendor(vendorOptions[0]);
    }
  }, [selectedVendor, vendorOptions]);

  const selectedVendorItems = useMemo(() => {
    return items.filter((item) => getVendorName(item) === selectedVendor);
  }, [items, selectedVendor]);

  const selectedVendorOrderItems = useMemo(() => {
    return selectedVendorItems
      .map((item) => {
        const orderQty = Number(orderQtyById[item.id] || 0);
        const incomingUnits = orderQty * getPackSize(item);

        return {
          item,
          orderQty,
          incomingUnits,
          estimatedValue: incomingUnits * Number(item.bottleCost || 0),
        };
      })
      .filter((line) => line.orderQty > 0);
  }, [selectedVendorItems, orderQtyById]);

  const selectedVendorTotal = selectedVendorOrderItems.reduce(
    (sum, line) => sum + line.estimatedValue,
    0
  );

  const summary = useMemo(() => {
    const itemsToOrder = items.filter((item) => finalOrder(item) > 0);

    return {
      itemsToOrder: itemsToOrder.length,
      suggestedIncomingUnits: items.reduce(
        (sum, item) => sum + getSuggestedIncomingUnits(item, finalOrder),
        0
      ),
      suggestedOrderValue: items.reduce(
        (sum, item) =>
          sum +
          getSuggestedIncomingUnits(item, finalOrder) *
            Number(item.bottleCost || 0),
        0
      ),
      currentInventoryValue: items.reduce(
        (sum, item) =>
          sum +
          Number(item.currentInventory || 0) * Number(item.bottleCost || 0),
        0
      ),
      targetInventoryValue: items.reduce(
        (sum, item) =>
          sum +
          Number(item.targetInventory || 0) * Number(item.bottleCost || 0),
        0
      ),
    };
  }, [items, finalOrder]);

  function useSuggestedOrder(item: BarItem) {
    const suggestedQty = getSuggestedOrderUnits(item, finalOrder);

    setOrderQtyById((current) => ({
      ...current,
      [item.id]: suggestedQty > 0 ? String(suggestedQty) : "0",
    }));
  }

  function createVendorPdfInvoice() {
    if (!selectedVendor) {
      alert("Please select a vendor first.");
      return;
    }

    alert(
      `Future feature: create a PDF order invoice for ${selectedVendor}. This will include vendor details, order items, quantities, and estimated totals.`
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
          Bar Back Inventory
        </p>

        <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
          Inventory
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Update counts, review suggested orders, add event extras, and prepare
          vendor order sheets.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-gray-500 shadow">
          No bar inventory items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const neededUnits = baseNeed(item);
            const finalNeededUnits = finalOrder(item);
            const packSize = getPackSize(item);
            const suggestedOrderUnits = getSuggestedOrderUnits(
              item,
              finalOrder
            );
            const suggestedIncomingUnits = getSuggestedIncomingUnits(
              item,
              finalOrder
            );
            const orderUnitLabel = getOrderUnitLabel(item);
            const orderQty = Number(orderQtyById[item.id] || 0);
            const orderIncomingUnits = orderQty * packSize;
            const inactiveVendor = isInactiveVendor(item);

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
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="text-xs text-gray-500">
                        Vendor: {getVendorName(item)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openCalculatorForItem(item)}
                      className="shrink-0 rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                    >
                      Edit Item
                    </button>
                  </div>

                  {inactiveVendor ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
                      Vendor inactive — update this item vendor or remove it
                      from active inventory.
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        On Hand
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.currentInventory}
                        onChange={(event) =>
                          updateCurrentInventory(item.id, event.target.value)
                        }
                        className="w-full rounded-xl border bg-white p-3 text-lg font-bold text-gray-900 outline-none focus:border-orange-700"
                      />
                    </label>

                    <div className="rounded-xl bg-[#f8f3ec] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Suggested On Hand
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {item.targetInventory}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#f8f3ec] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Need
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {neededUnits}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#f8f3ec] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Pack / Case Size
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {packSize}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Suggested Order
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {suggestedOrderUnits} {orderUnitLabel}
                          {suggestedOrderUnits === 1 ? "" : "s"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {suggestedIncomingUnits} total units coming in
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getOrderStyle(
                          finalNeededUnits
                        )}`}
                      >
                        {finalNeededUnits > 0 ? "Order" : "OK"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <label className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Order Qty ({orderUnitLabel}s)
                      </span>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={orderQtyById[item.id] || ""}
                        onChange={(event) =>
                          setOrderQtyById((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border bg-white p-3 text-lg font-bold text-gray-900 outline-none focus:border-orange-700"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => useSuggestedOrder(item)}
                      className="self-end rounded-xl bg-orange-700 px-4 py-3 text-xs font-semibold text-white hover:bg-orange-800"
                    >
                      Use Suggested
                    </button>
                  </div>

                  <div className="rounded-xl bg-[#f8f3ec] p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Final incoming units
                      </span>
                      <span className="font-bold text-gray-900">
                        {orderIncomingUnits}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Estimated value</span>
                      <span className="font-bold text-gray-900">
                        {formatMoney(
                          orderIncomingUnits * Number(item.bottleCost || 0)
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          Special / Event Extra
                        </p>
                        <p className="text-xs text-gray-500">
                          Adds to this order without changing normal suggested
                          orders.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleEventAdd(item.id)}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                          item.eventAddEnabled
                            ? "bg-orange-700 text-white hover:bg-orange-800"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {item.eventAddEnabled ? "On" : "Add"}
                      </button>
                    </div>

                    {item.eventAddEnabled ? (
                      <label className="mt-3 block space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Event Extra Units
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.eventAdd}
                          onChange={(event) =>
                            updateEventAdd(item.id, event.target.value)
                          }
                          className="w-full rounded-xl border bg-white p-3 font-bold text-gray-900 outline-none focus:border-orange-700"
                        />
                      </label>
                    ) : null}
                  </div>
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
                  Select a vendor and prepare an order sheet. Later this button
                  can create a PDF invoice/order form to print, save, or email.
                </p>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Vendor
                </span>

                <select
                  value={selectedVendor}
                  onChange={(event) => setSelectedVendor(event.target.value)}
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
                  selectedVendorOrderItems.map((line) => (
                    <div
                      key={line.item.id}
                      className="rounded-lg bg-[#f8f3ec] p-2 text-sm"
                    >
                      <p className="font-bold text-gray-900">
                        {line.item.productName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {line.orderQty} {getOrderUnitLabel(line.item)}
                        {line.orderQty === 1 ? "" : "s"} ·{" "}
                        {line.incomingUnits} units ·{" "}
                        {formatMoney(line.estimatedValue)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No order quantities entered for this vendor yet.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={createVendorPdfInvoice}
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
          Inventory Value Summary
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500">Items Needing Order</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.itemsToOrder}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500">Incoming Units</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.suggestedIncomingUnits}
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

      <div className="rounded-2xl bg-white p-5 shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Bulk Import Inventory
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Add or update multiple bar items from a vendor sheet, spreadsheet,
              or starter inventory list.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (openBulkImport) {
                openBulkImport();
                return;
              }

              alert("Bulk import button is ready to connect from BarBack.tsx.");
            }}
            className="rounded-xl border bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-50"
          >
            Bulk Import Items
          </button>
        </div>
      </div>
    </div>
  );
}