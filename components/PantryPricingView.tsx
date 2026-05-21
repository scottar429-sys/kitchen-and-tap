"use client";

import React from "react";

export type MenuPricingItem = {
  id: number;
  menuItemName: string;
  menuPrice: number;
  plateCost: number;
  foodCostPercent: number;
  profit: number;
};

type PantryPricingViewProps = {
  items: MenuPricingItem[];
  setItems: React.Dispatch<React.SetStateAction<MenuPricingItem[]>>;
  targetFoodCostPercent: number;
  warningFoodCostPercent: number;
  highCostFoodCostPercent: number;
};

export default function PantryPricingView({
  items,
  setItems,
  targetFoodCostPercent,
  warningFoodCostPercent,
  highCostFoodCostPercent,
}: PantryPricingViewProps) {
  const addMenuItem = () => {
    const newItem: MenuPricingItem = {
      id: Date.now(),
      menuItemName: "New Menu Item",
      menuPrice: 0,
      plateCost: 0,
      foodCostPercent: 0,
      profit: 0,
    };

    setItems((prev) => [...prev, newItem]);
  };

  const removeMenuItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (
    id: number,
    field: keyof MenuPricingItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updatedItem = {
          ...item,
          [field]: value,
        };

        const menuPrice = Number(updatedItem.menuPrice);
        const plateCost = Number(updatedItem.plateCost);

        updatedItem.foodCostPercent =
          menuPrice > 0 ? (plateCost / menuPrice) * 100 : 0;

        updatedItem.profit = menuPrice - plateCost;

        return updatedItem;
      })
    );
  };

  const getStatus = (foodCostPercent: number) => {
    if (foodCostPercent <= targetFoodCostPercent) {
      return {
        label: "Excellent",
        className: "text-green-700",
      };
    }

    if (foodCostPercent <= warningFoodCostPercent) {
      return {
        label: "Good",
        className: "text-yellow-700",
      };
    }

    if (foodCostPercent <= highCostFoodCostPercent) {
      return {
        label: "Review",
        className: "text-orange-700",
      };
    }

    return {
      label: "High Cost",
      className: "text-red-700",
    };
  };

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Menu Pricing</h2>
          <p className="text-sm text-slate-500">
            Monitor pricing, food cost percentages, and profitability.
          </p>
        </div>

        <button
          onClick={addMenuItem}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Add Menu Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3">Menu Item</th>
              <th className="p-3">Menu Price</th>
              <th className="p-3">Plate Cost</th>
              <th className="p-3">Food Cost %</th>
              <th className="p-3">Profit</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const status = getStatus(item.foodCostPercent);

              return (
                <tr key={item.id} className="border-t">
                  <td className="p-3">
                    <input
                      value={item.menuItemName}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "menuItemName",
                          e.target.value
                        )
                      }
                      className="w-48 rounded-lg border px-2 py-1"
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      value={item.menuPrice}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "menuPrice",
                          Number(e.target.value)
                        )
                      }
                      className="w-28 rounded-lg border px-2 py-1"
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      value={item.plateCost}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "plateCost",
                          Number(e.target.value)
                        )
                      }
                      className="w-28 rounded-lg border px-2 py-1"
                    />
                  </td>

                  <td className="p-3 font-medium">
                    {item.foodCostPercent.toFixed(1)}%
                  </td>

                  <td className="p-3 font-medium">
                    ${item.profit.toFixed(2)}
                  </td>

                  <td className={`p-3 font-semibold ${status.className}`}>
                    {status.label}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => removeMenuItem(item.id)}
                      className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}