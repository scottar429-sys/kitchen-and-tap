"use client";

import { useEffect, useMemo, useState } from "react";

import {
  BarView,
  CategoryFilter,
  SortMode,
  BarItem,
} from "./barBackTypes";

import { startingItems } from "./mockBarBackData";

import InventoryView from "./InventoryView";
import TargetView from "./TargetView";
import PricingView from "./PricingView";
import BulkSetupView from "./BulkSetupView";

export default function BarBack() {
  const [items, setItems] = useState<BarItem[]>(startingItems);
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<BarView>("inventory");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [sortMode, setSortMode] = useState<SortMode>("Need to Order First");
  const [calculatorMessage, setCalculatorMessage] = useState("");

  function needsPricingReview(item: BarItem) {
    if (item.pricingAlertDismissed) return false;

    const today = new Date();
    const lastReview = new Date(item.lastPriceReview);

    const daysSinceReview =
      (today.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceReview >= 90;
  }

  function baseNeed(item: BarItem) {
    return Math.max(item.targetInventory - item.currentInventory, 0);
  }

  function finalOrder(item: BarItem) {
    return baseNeed(item) + (item.eventAddEnabled ? item.eventAdd : 0);
  }

  const sortOptionsByView: Record<BarView, SortMode[]> = {
    inventory: [
      "Need to Order First",
      "Needs Inventory Review",
      "Lowest Current Inventory",
      "Alphabetical",
    ],
    target: ["Alphabetical", "Lowest Current Inventory"],
    pricing: ["Pricing Review First", "Highest Cost %", "Alphabetical"],
    import: ["Alphabetical"],
  };

  const sortOptions = useMemo(() => {
    return sortOptionsByView[activeView];
  }, [activeView]);

  useEffect(() => {
    if (!sortOptions.includes(sortMode)) {
      setSortMode(sortOptions[0]);
    }
  }, [activeView, sortMode, sortOptions]);

  const filteredItems = useMemo(() => {
    let results = items.filter((item) =>
      item.productName.toLowerCase().includes(search.toLowerCase())
    );

    if (activeCategory !== "All") {
      results = results.filter((item) => item.category === activeCategory);
    }

    return [...results].sort((a, b) => {
      if (sortMode === "Need to Order First") {
        return finalOrder(b) - finalOrder(a);
      }

      if (sortMode === "Pricing Review First") {
        return Number(needsPricingReview(b)) - Number(needsPricingReview(a));
      }

      if (sortMode === "Needs Inventory Review") {
        return Number(!b.inventoryReviewed) - Number(!a.inventoryReviewed);
      }

      if (sortMode === "Lowest Current Inventory") {
        return a.currentInventory - b.currentInventory;
      }

      if (sortMode === "Highest Cost %") {
        return b.costPercent - a.costPercent;
      }

      return a.productName.localeCompare(b.productName);
    });
  }, [items, search, activeCategory, sortMode]);

  const totalProducts = items.length;

  const averageCostPercent =
    items.length > 0
      ? items.reduce((sum, item) => sum + item.costPercent, 0) / items.length
      : 0;

  const inventoryReviewCount = items.filter(
    (item) => !item.inventoryReviewed
  ).length;

  const itemsToOrderCount = items.filter((item) => finalOrder(item) > 0).length;

  const pricingReviewCount = items.filter((item) =>
    needsPricingReview(item)
  ).length;

  function suggestedTargetInventory(item: BarItem) {
    return Math.max(
      item.targetInventory,
      Math.ceil(item.averageOrdered + item.averageRemaining)
    );
  }

  function getMarginStyle(costPercent: number) {
    if (costPercent <= 20) return "text-green-700";
    if (costPercent <= 30) return "text-yellow-700";
    return "text-red-700";
  }

  function getOrderStyle(orderQty: number) {
    if (orderQty <= 0) return "bg-green-100 text-green-800";
    if (orderQty <= 2) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  }

  function updateCurrentInventory(id: number, value: string) {
    const numericValue = Math.max(Number(value || 0), 0);

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              currentInventory: numericValue,
              inventoryReviewed: true,
            }
          : item
      )
    );
  }

  function toggleEventAdd(id: number) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              eventAddEnabled: !item.eventAddEnabled,
              eventAdd: item.eventAddEnabled ? 0 : item.eventAdd,
            }
          : item
      )
    );
  }

  function updateEventAdd(id: number, value: string) {
    const numericValue = Math.max(Number(value || 0), 0);

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, eventAdd: numericValue } : item
      )
    );
  }

  function updateTargetInventory(id: number, value: string) {
    const numericValue = Math.max(Number(value || 0), 0);

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, targetInventory: numericValue } : item
      )
    );
  }

  function updatePricingField(
    id: number,
    field: "bottleCost" | "menuPrice",
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
          lastPriceReview: today,
          pricingAlertDismissed: false,
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

  function dismissPricingAlert(id: number) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, pricingAlertDismissed: true } : item
      )
    );
  }

  function markPriceReviewed(id: number) {
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

  function openCalculatorForItem(item: BarItem) {
    setCalculatorMessage(
      `${item.productName} would open in the matching calculator with saved settings.`
    );
  }

  function addImportedItems(newItems: BarItem[]) {
    setItems((currentItems) => [...currentItems, ...newItems]);
    setActiveView("inventory");
  }

  const categoryFilters: CategoryFilter[] = [
    "All",
    "Liquor",
    "Wine",
    "Beer",
    "Cans/Bottles",
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
          Bar Pro Feature
        </p>

        <h1 className="text-3xl font-bold">Bar Back</h1>

        <p className="text-gray-600">
          Manage inventory counts, event ordering, target stock levels, pricing
          reviews, and bulk setup.
        </p>
      </div>

      {calculatorMessage ? (
        <div className="bg-orange-50 border border-orange-200 text-orange-900 rounded-2xl p-4 text-sm">
          {calculatorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500">Products</p>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500">Inventory Review</p>
          <p className="text-2xl font-bold">{inventoryReviewCount}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500">Avg Cost %</p>
          <p className="text-2xl font-bold">{averageCostPercent.toFixed(1)}%</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500">To Order</p>
          <p className="text-2xl font-bold">{itemsToOrderCount}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-gray-500">Pricing Alerts</p>
          <p className="text-2xl font-bold">{pricingReviewCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-3 space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            ["inventory", "Inventory"],
            ["target", "Targets"],
            ["pricing", "Pricing"],
            ["import", "Bulk Setup"],
          ].map(([view, label]) => (
            <button
              key={view}
              onClick={() => setActiveView(view as BarView)}
              className={`rounded-xl px-2 py-3 text-xs md:text-sm font-bold ${
                activeView === view
                  ? "bg-orange-700 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeView !== "import" ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categoryFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveCategory(filter)}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold ${
                  activeCategory === filter
                    ? "bg-orange-100 text-orange-800 border border-orange-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {activeView !== "import" ? (
        <div className="grid gap-3 md:grid-cols-[1fr_260px]">
          <input
            className="w-full border rounded-xl p-3 bg-white"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="w-full border rounded-xl p-3 bg-white"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                Sort: {option}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {activeView === "inventory" ? (
        <InventoryView
          items={filteredItems}
          updateCurrentInventory={updateCurrentInventory}
          toggleEventAdd={toggleEventAdd}
          updateEventAdd={updateEventAdd}
          baseNeed={baseNeed}
          finalOrder={finalOrder}
          getOrderStyle={getOrderStyle}
          openCalculatorForItem={openCalculatorForItem}
        />
      ) : null}

      {activeView === "target" ? (
        <TargetView
          items={filteredItems}
          updateTargetInventory={updateTargetInventory}
          suggestedTargetInventory={suggestedTargetInventory}
          openCalculatorForItem={openCalculatorForItem}
        />
      ) : null}

      {activeView === "pricing" ? (
        <PricingView
          items={filteredItems}
          getMarginStyle={getMarginStyle}
          needsPricingReview={needsPricingReview}
          markPriceReviewed={markPriceReviewed}
          dismissPricingAlert={dismissPricingAlert}
          updatePricingField={updatePricingField}
          openCalculatorForItem={openCalculatorForItem}
        />
      ) : null}

      {activeView === "import" ? (
        <BulkSetupView
          existingItemCount={items.length}
          addImportedItems={addImportedItems}
        />
      ) : null}
    </div>
  );
}