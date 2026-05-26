"use client";

import { BarItem } from "./barBackTypes";

type BarBackInventoryProps = {
  items?: BarItem[];
  updateCurrentInventory: (id: number, value: string) => void;
  toggleEventAdd: (id: number) => void;
  updateEventAdd: (id: number, value: string) => void;
  baseNeed: (item: BarItem) => number;
  finalOrder: (item: BarItem) => number;
  getOrderStyle: (orderQty: number) => string;
  openCalculatorForItem: (item: BarItem) => void;
};

export default function BarBackInventory({
  items = [],
  updateCurrentInventory,
  toggleEventAdd,
  updateEventAdd,
  baseNeed,
  finalOrder,
  getOrderStyle,
}: BarBackInventoryProps) {
  const formatMoney = (value: number) => `$${Number(value || 0).toFixed(2)}`;

  function getOrderPackSize(item: BarItem) {
    if (item.category === "Beer" || item.category === "Cans/Bottles") {
      return 24;
    }

    return 1;
  }

  function getRoundedOrder(item: BarItem) {
    const rawOrder = finalOrder(item);
    const packSize = getOrderPackSize(item);

    if (rawOrder <= 0) return 0;

    return Math.ceil(rawOrder / packSize) * packSize;
  }

  const itemsToOrder = items.filter((item) => getRoundedOrder(item) > 0);

  const totalSuggestedOrderQty = items.reduce(
    (sum, item) => sum + getRoundedOrder(item),
    0
  );

  const suggestedOrderValue = items.reduce(
    (sum, item) => sum + getRoundedOrder(item) * Number(item.bottleCost || 0),
    0
  );

  const currentInventoryValue = items.reduce(
    (sum, item) =>
      sum + Number(item.currentInventory || 0) * Number(item.bottleCost || 0),
    0
  );

  const targetInventoryValue = items.reduce(
    (sum, item) =>
      sum + Number(item.targetInventory || 0) * Number(item.bottleCost || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-bold">Inventory</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">On Hand</th>
                <th className="p-3">Suggested On Hand</th>
                <th className="p-3">Base Need</th>
                <th className="p-3">Event Add</th>
                <th className="p-3">Suggested Order</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={7}>
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const rawOrder = finalOrder(item);
                  const roundedOrder = getRoundedOrder(item);

                  return (
                    <tr key={item.id} className="border-b">
                      <td className="p-3 font-semibold">{item.productName}</td>
                      <td className="p-3">{item.category}</td>

                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.currentInventory}
                          onChange={(e) =>
                            updateCurrentInventory(item.id, e.target.value)
                          }
                          className="w-24 rounded-xl border p-2"
                        />
                      </td>

                      <td className="p-3">{item.targetInventory}</td>

                      <td className="p-3">{baseNeed(item)}</td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.eventAddEnabled}
                            onChange={() => toggleEventAdd(item.id)}
                          />

                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.eventAdd}
                            disabled={!item.eventAddEnabled}
                            onChange={(e) =>
                              updateEventAdd(item.id, e.target.value)
                            }
                            className="w-20 rounded-xl border p-2 disabled:bg-gray-100"
                          />
                        </div>
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getOrderStyle(
                            roundedOrder
                          )}`}
                        >
                          {roundedOrder}
                        </span>

                        {rawOrder > 0 && rawOrder !== roundedOrder ? (
                          <p className="mt-1 text-xs text-gray-500">
                            Rounded up from {rawOrder}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 space-y-4">
        <h2 className="text-xl font-bold">Inventory Value Summary</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-gray-500">Items Needing Order</p>
            <p className="text-2xl font-bold">{itemsToOrder.length}</p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs text-gray-500">Suggested Order Qty</p>
            <p className="text-2xl font-bold">{totalSuggestedOrderQty}</p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs text-gray-500">Suggested Order Value</p>
            <p className="text-2xl font-bold">
              {formatMoney(suggestedOrderValue)}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs text-gray-500">Current Inventory Value</p>
            <p className="text-2xl font-bold">
              {formatMoney(currentInventoryValue)}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs text-gray-500">Target Inventory Value</p>
            <p className="text-2xl font-bold">
              {formatMoney(targetInventoryValue)}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          On-hand counts support partial bottles like 0.5, 1.25, and 2.75.
          Suggested orders round up to whole bottles. Beer and cans/bottles round
          up by 24-pack.
        </p>
      </div>
    </div>
  );
}