"use client";

import { BarItem } from "./barBackTypes";
import ProductButton from "./ProductButton";

type PricingViewProps = {
  items: BarItem[];
  getMarginStyle: (costPercent: number) => string;
  needsPricingReview: (item: BarItem) => boolean;
  markPriceReviewed: (id: number) => void;
  dismissPricingAlert: (id: number) => void;
  updatePricingField: (
    id: number,
    field: "bottleCost" | "menuPrice",
    value: string
  ) => void;
  openCalculatorForItem: (item: BarItem) => void;
};

export default function PricingView({
  items,
  getMarginStyle,
  needsPricingReview,
  markPriceReviewed,
  dismissPricingAlert,
  updatePricingField,
  openCalculatorForItem,
}: PricingViewProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Pricing Review</h2>
        <p className="text-sm text-gray-600">
          Update bottle cost or menu price here. Changes automatically refresh
          the pricing review date.
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((item) => {
          const needsReview = needsPricingReview(item);

          return (
            <div key={item.id} className="bg-white rounded-2xl shadow p-4">
              {needsReview ? (
                <div className="mb-3 bg-red-100 border border-red-300 text-red-800 rounded-xl p-3 text-sm font-semibold">
                  Pricing check needed. This item has not been reviewed in 90+
                  days.
                </div>
              ) : null}

              <ProductButton
                item={item}
                openCalculatorForItem={openCalculatorForItem}
              />

              <p className="text-xs text-gray-500">
                {item.category} • Last reviewed: {item.lastPriceReview}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div>
                  <p className="text-xs text-gray-500">Bottle / Unit Cost</p>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.bottleCost}
                    onChange={(e) =>
                      updatePricingField(
                        item.id,
                        "bottleCost",
                        e.target.value
                      )
                    }
                    className="w-full border rounded-xl p-3"
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Menu Price</p>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.menuPrice}
                    onChange={(e) =>
                      updatePricingField(item.id, "menuPrice", e.target.value)
                    }
                    className="w-full border rounded-xl p-3"
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Drink Cost</p>
                  <div className="w-full border rounded-xl p-3 bg-gray-100 font-bold">
                    ${item.drinkCost.toFixed(2)}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Cost %</p>
                  <div
                    className={`w-full border rounded-xl p-3 bg-gray-100 font-bold ${getMarginStyle(
                      item.costPercent
                    )}`}
                  >
                    {item.costPercent.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-sm">
                <p>
                  Profit:
                  <br />
                  <strong>${item.profit.toFixed(2)}</strong>
                </p>

                <p>
                  Pour Size:
                  <br />
                  <strong>{item.pourSize} oz</strong>
                </p>

                <p>
                  Bottle Size:
                  <br />
                  <strong>{item.bottleSize}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 md:max-w-md">
                <button
                  onClick={() => markPriceReviewed(item.id)}
                  className="rounded-xl bg-orange-700 text-white font-bold px-3 py-3 text-sm"
                >
                  Mark Reviewed
                </button>

                {needsReview ? (
                  <button
                    onClick={() => dismissPricingAlert(item.id)}
                    className="rounded-xl bg-gray-100 text-gray-700 font-bold px-3 py-3 text-sm"
                  >
                    Dismiss
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}