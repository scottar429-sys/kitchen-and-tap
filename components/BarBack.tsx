"use client";

import { useEffect, useMemo, useState } from "react";

import type { BarItem, CategoryFilter, SortMode } from "./barBackTypes";
import { startingItems } from "./mockBarBackData";

import BarBackInventory from "./BarBackInventory";
import BarBackReviewView from "./BarBackReviewView";
import BarBackBulkSetup from "./BarBackBulkSetup";

type ActiveView = "inventory" | "review";

type QuickFilter =
  | "all"
  | "ordersToday"
  | "needToOrder"
  | "needsCount"
  | "pricingReview"
  | "inactiveVendor";

type BarBackSortMode = SortMode | "Vendor";

type BarItemWithVendor = BarItem & {
  vendorId?: string;
  vendorName?: string;
  vendorStatus?: "active" | "inactive";
  vendorOrderDays?: string[];
};

const categoryFilters: CategoryFilter[] = [
  "All",
  "Liquor",
  "Wine",
  "Draft Beer",
  "Cans/Bottles",
];

const inventorySortOptions: BarBackSortMode[] = [
  "Need to Order First",
  "Vendor",
  "Needs Inventory Review",
  "Lowest Current Inventory",
  "Alphabetical",
];

const reviewSortOptions: BarBackSortMode[] = [
  "Pricing Review First",
  "Need to Order First",
  "Vendor",
  "Highest Cost %",
  "Lowest Current Inventory",
  "Alphabetical",
];

const todayCode = new Date()
  .toLocaleDateString("en-US", { weekday: "short" })
  .replace("Mon", "M")
  .replace("Tue", "Tu")
  .replace("Wed", "W")
  .replace("Thu", "Th")
  .replace("Fri", "F")
  .replace("Sat", "Sa")
  .replace("Sun", "Su");

export default function BarBack() {
  const [items, setItems] = useState<BarItem[]>(startingItems);
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<ActiveView>("inventory");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [sortMode, setSortMode] = useState<BarBackSortMode>(
    "Need to Order First"
  );
  const [vendorFilter, setVendorFilter] = useState("All Vendors");
  const [showBulkSetup, setShowBulkSetup] = useState(false);
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

  function getVendorName(item: BarItem) {
    const vendorItem = item as BarItemWithVendor;
    return vendorItem.vendorName || "Unassigned Vendor";
  }

  function isInactiveVendor(item: BarItem) {
    const vendorItem = item as BarItemWithVendor;
    return vendorItem.vendorStatus === "inactive";
  }

  function isOrderDayToday(item: BarItem) {
    const vendorItem = item as BarItemWithVendor;

    if (!vendorItem.vendorOrderDays || vendorItem.vendorOrderDays.length === 0) {
      return finalOrder(item) > 0;
    }

    return vendorItem.vendorOrderDays.includes(todayCode) && finalOrder(item) > 0;
  }

  const sortOptionsByView: Record<ActiveView, BarBackSortMode[]> = {
    inventory: inventorySortOptions,
    review: reviewSortOptions,
  };

  const sortOptions = useMemo(() => {
    return sortOptionsByView[activeView] ?? inventorySortOptions;
  }, [activeView]);

  useEffect(() => {
    if (!sortOptions.includes(sortMode)) {
      setSortMode(sortOptions[0]);
    }
  }, [activeView, sortMode, sortOptions]);

  const vendorOptions = useMemo(() => {
    const vendors = new Set<string>();

    items.forEach((item) => {
      const vendorName = getVendorName(item);
      if (vendorName) vendors.add(vendorName);
    });

    return ["All Vendors", ...Array.from(vendors).sort()];
  }, [items]);

  const filteredItems = useMemo(() => {
    let results = items.filter((item) =>
      item.productName.toLowerCase().includes(search.toLowerCase())
    );

    if (activeCategory !== "All") {
      results = results.filter((item) => item.category === activeCategory);
    }

    if (vendorFilter !== "All Vendors") {
      results = results.filter((item) => getVendorName(item) === vendorFilter);
    }

    if (quickFilter === "ordersToday") {
      results = results.filter((item) => isOrderDayToday(item));
    }

    if (quickFilter === "needToOrder") {
      results = results.filter((item) => finalOrder(item) > 0);
    }

    if (quickFilter === "needsCount") {
      results = results.filter((item) => !item.inventoryReviewed);
    }

    if (quickFilter === "pricingReview") {
      results = results.filter((item) => needsPricingReview(item));
    }

    if (quickFilter === "inactiveVendor") {
      results = results.filter((item) => isInactiveVendor(item));
    }

    return [...results].sort((a, b) => {
      if (sortMode === "Need to Order First") {
        return finalOrder(b) - finalOrder(a);
      }

      if (sortMode === "Vendor") {
        const vendorCompare = getVendorName(a).localeCompare(getVendorName(b));
        return vendorCompare || a.productName.localeCompare(b.productName);
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
  }, [items, search, activeCategory, quickFilter, sortMode, vendorFilter]);

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

  const inactiveVendorCount = items.filter((item) => isInactiveVendor(item)).length;

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

  function openCalculatorForItem(item: BarItem) {
    setCalculatorMessage(
      `${item.productName} would open in the matching calculator with saved settings.`
    );
  }

  function addImportedItems(newItems: BarItem[]) {
    setItems((currentItems) => [...currentItems, ...newItems]);
    setShowBulkSetup(false);
    setActiveView("inventory");
  }

  const quickFilters: { value: QuickFilter; label: string }[] = [
    { value: "all", label: "All Items" },
    { value: "ordersToday", label: "Orders Today" },
    { value: "needToOrder", label: "Need to Order" },
    { value: "needsCount", label: "Needs Count" },
    { value: "pricingReview", label: "Pricing Review" },
    { value: "inactiveVendor", label: "Inactive Vendor" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
          Bar Pro Feature
        </p>

        <h1 className="text-3xl font-bold">Bar Back</h1>

        <p className="text-gray-600">
          Manage manual counts, suggested ordering, event ordering, vendor sorting,
          target stock levels, quarterly pricing reviews, and bulk setup.
        </p>
      </div>

      {calculatorMessage ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
          {calculatorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500">Products</p>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500">Inventory Review</p>
          <p className="text-2xl font-bold">{inventoryReviewCount}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500">Avg Cost %</p>
          <p className="text-2xl font-bold">{averageCostPercent.toFixed(1)}%</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500">To Order</p>
          <p className="text-2xl font-bold">{itemsToOrderCount}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500">Pricing Alerts</p>
          <p className="text-2xl font-bold">{pricingReviewCount}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500">Vendor Flags</p>
          <p className="text-2xl font-bold">{inactiveVendorCount}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl bg-white p-3 shadow">
        <div className="grid grid-cols-2 gap-2">
          {[
            ["inventory", "Inventory"],
            ["review", "Quarterly Review"],
          ].map(([view, label]) => (
            <button
              key={view}
              onClick={() => setActiveView(view as ActiveView)}
              className={`rounded-xl px-2 py-3 text-xs font-bold md:text-sm ${
                activeView === view
                  ? "bg-orange-700 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {quickFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setQuickFilter(filter.value)}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold ${
                quickFilter === filter.value
                  ? "border border-orange-300 bg-orange-100 text-orange-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveCategory(filter)}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold ${
                activeCategory === filter
                  ? "border border-orange-300 bg-orange-100 text-orange-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px_260px]">
        <input
          className="w-full rounded-xl border bg-white p-3"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={vendorFilter}
          onChange={(event) => setVendorFilter(event.target.value)}
          className="w-full rounded-xl border bg-white p-3"
        >
          {vendorOptions.map((vendor) => (
            <option key={vendor} value={vendor}>
              {vendor}
            </option>
          ))}
        </select>

        <select
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as BarBackSortMode)}
          className="w-full rounded-xl border bg-white p-3"
        >
          {sortOptions.map((option) => (
            <option key={option} value={option}>
              Sort: {option}
            </option>
          ))}
        </select>
      </div>

      {activeView === "inventory" ? (
        <BarBackInventory
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

      {activeView === "review" ? (
        <BarBackReviewView
          items={filteredItems}
          setItems={setItems}
          openCalculatorForItem={openCalculatorForItem}
          vendorOptions={vendorOptions}
        />
      ) : null}

      <div className="border-t pt-6">
        <button
          onClick={() => setShowBulkSetup((current) => !current)}
          className="w-full rounded-2xl border bg-white px-4 py-4 text-left font-bold shadow hover:bg-gray-50"
        >
          Bulk Setup / Maintenance
          <span className="block text-sm font-normal text-gray-600">
            Use this for setup work like importing items, changing vendors, and
            maintenance. It stays out of the way during daily ordering.
          </span>
        </button>

        {showBulkSetup ? (
          <div className="mt-4">
            <BarBackBulkSetup
              existingItemCount={items.length}
              addImportedItems={addImportedItems}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}