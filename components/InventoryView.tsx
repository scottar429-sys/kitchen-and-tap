"use client";

import { BarItem } from "./barBackTypes";
import ProductButton from "./ProductButton";

type InventoryViewProps = {
  items: BarItem[];
  updateCurrentInventory: (id: number, value: string) => void;
  toggleEventAdd: (id: number) => void;
  updateEventAdd: (id: number, value: string) => void;
  baseNeed: (item: BarItem) => number;
  finalOrder: (item: BarItem) => number;
  getOrderStyle: (orderQty: number) => string;
  openCalculatorForItem: (item: BarItem) => void;
};

export default function InventoryView({
  items,
  updateCurrentInventory,
  toggleEventAdd,
  updateEventAdd,
  baseNeed,
  finalOrder,
  getOrderStyle,
  openCalculatorForItem,
}: InventoryViewProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Inventory Mode</h2>
        <p className="text-sm text-gray-600">
          Items start as Needs Review. Updating current inventory marks the item
          as Reviewed.
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((item) => {
          const baseQty = baseNeed(item);
          const finalQty = finalOrder(item);

          return (
            <div key={item.id} className="bg-white rounded-2xl shadow p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <ProductButton
                    item={item}
                    openCalculatorForItem={openCalculatorForItem}
                  />

                  <p className="text-xs text-gray-500">
                    {item.category} • {item.bottleSize} • $
                    {item.bottleCost.toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`h-fit rounded-xl px-3 py-1 text-sm font-bold ${
                      item.inventoryReviewed
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.inventoryReviewed ? "Reviewed" : "Needs Review"}
                  </span>

                  <span
                    className={`h-fit rounded-xl px-3 py-1 text-sm font-bold ${getOrderStyle(
                      finalQty
                    )}`}
                  >
                    Order {finalQty}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div>
                  <p className="text-xs text-gray-500">Current</p>
                  <input
                    type="number"
                    min="0"
                    value={item.currentInventory}
                    onChange={(e) =>
                      updateCurrentInventory(item.id, e.target.value)
                    }
                    className="w-full border rounded-xl p-3"
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Target</p>
                  <div className="w-full border rounded-xl p-3 bg-gray-100 font-bold">
                    {item.targetInventory}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Base Need</p>
                  <div className="w-full border rounded-xl p-3 bg-gray-100 font-bold">
                    {baseQty}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Final Order</p>
                  <div className="w-full border rounded-xl p-3 bg-orange-50 font-bold text-orange-900">
                    {finalQty}
                  </div>
                </div>
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={item.eventAddEnabled}
                  onChange={() => toggleEventAdd(item.id)}
                />
                Event Add
              </label>

              {item.eventAddEnabled ? (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">
                    Extra one-time order amount
                  </p>
                  <input
                    type="number"
                    min="0"
                    value={item.eventAdd}
                    onChange={(e) => updateEventAdd(item.id, e.target.value)}
                    className="w-full md:w-40 border rounded-xl p-3"
                  />
                </div>
              ) : null}

              <p className="mt-4 text-sm">
                Estimated Order Cost:{" "}
                <strong>${(finalQty * item.bottleCost).toFixed(2)}</strong>
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}