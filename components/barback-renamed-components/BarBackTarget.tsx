"use client";

import { BarItem } from "./barBackTypes";
import ProductButton from "./ProductButton";

type BarBackTargetProps = {
  items: BarItem[];
  updateTargetInventory: (id: number, value: string) => void;
  suggestedTargetInventory: (item: BarItem) => number;
  openCalculatorForItem: (item: BarItem) => void;
};

export default function BarBackTarget({
  items,
  updateTargetInventory,
  suggestedTargetInventory,
  openCalculatorForItem,
}: BarBackTargetProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Target Inventory</h2>
        <p className="text-sm text-gray-600">
          Set par levels and compare them against ordering patterns. Event adds
          do not affect suggested targets.
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((item) => {
          const suggestedTarget = suggestedTargetInventory(item);

          return (
            <div key={item.id} className="bg-white rounded-2xl shadow p-4">
              <ProductButton
                item={item}
                openCalculatorForItem={openCalculatorForItem}
              />

              <p className="text-xs text-gray-500">
                {item.category} • {item.bottleSize}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div>
                  <p className="text-xs text-gray-500">Current Target</p>
                  <input
                    type="number"
                    min="0"
                    value={item.targetInventory}
                    onChange={(e) =>
                      updateTargetInventory(item.id, e.target.value)
                    }
                    className="w-full border rounded-xl p-3"
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Suggested Target</p>
                  <div className="w-full border rounded-xl p-3 bg-orange-50 font-bold text-orange-900">
                    {suggestedTarget}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Avg Ordered</p>
                  <div className="w-full border rounded-xl p-3 bg-gray-100">
                    {item.averageOrdered}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Avg Remaining</p>
                  <div className="w-full border rounded-xl p-3 bg-gray-100">
                    {item.averageRemaining}
                  </div>
                </div>
              </div>

              {suggestedTarget > item.targetInventory ? (
                <div className="mt-4 rounded-xl bg-yellow-100 text-yellow-900 border border-yellow-300 p-3 text-sm font-semibold">
                  Suggested target is higher than current target. Consider
                  increasing par level.
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}