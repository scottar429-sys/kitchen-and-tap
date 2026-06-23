"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import PantryInventory, { PantryItem } from "./PantryInventory";
import PantryReviewView, { MenuPricingItem } from "./PantryReviewView";
import PantryPrepStation from "./PantryPrepStation";

import { supabase } from "@/lib/supabaseClient";
import { getCurrentOrganizationId } from "@/lib/getCurrentOrganization";

type PantryView = "inventory" | "inventoryCatalog" | "prepStation";

export type PantryReviewTargets = {
  targetFoodCostPercent: number;
  warningFoodCostPercent: number;
  highCostFoodCostPercent: number;
  defaultLowStockWarning: number;
};

type PantryItemWithDbId = PantryItem & {
  dbId?: string;
};

type VendorRow = {
  id: string;
  vendor_name: string;
};

type PrepRecipeStateRow = {
  organization_id: string;
  recipes: MenuPricingItem[];
};

const startingPantryItems: PantryItemWithDbId[] = [];
const startingMenuItems: MenuPricingItem[] = [];

function mapDbItemToPantryItem(
  row: any,
  index: number,
  vendorIdToName: Record<string, string>
): PantryItemWithDbId {
  return {
    dbId: row.id,
    id: index + 1,

    itemName: row.item_name || "Unnamed Pantry Item",
    category: row.category || "Other",

    vendor: row.vendor_id
      ? vendorIdToName[row.vendor_id] || "Unassigned Vendor"
      : "Unassigned Vendor",
    vendorStatus: "active",

    caseCost: Number(row.unit_cost || 0),
    caseSize: Number(row.pack_size || 1),
    caseUnit: row.purchase_unit || "each",

    currentInventory: Number(row.current_stock || 0),
    targetInventory: Number(row.par_level || 0),
    inventoryUnit: row.inventory_unit || "case",

    orderQuantity: 0,
    inventoryReviewed: Boolean(row.inventory_reviewed),

    prepExtraEnabled: false,
    prepExtra: 0,
  };
}

function mapPantryItemToDbItem(
  item: PantryItemWithDbId,
  organizationId: string,
  vendorNameToId: Record<string, string>
) {
  const vendorId =
    item.vendor && item.vendor !== "Unassigned Vendor"
      ? vendorNameToId[item.vendor] || null
      : null;

  const dbItem: Record<string, any> = {
    organization_id: organizationId,
    location_id: null,
    vendor_id: vendorId,

    item_name: item.itemName || "Unnamed Pantry Item",
    category: item.category || "Other",

    purchase_unit: item.caseUnit || "each",
    inventory_unit: item.inventoryUnit || "case",
    unit_cost: Number(item.caseCost || 0),
    pack_size: Number(item.caseSize || 1),

    current_stock: Number(item.currentInventory || 0),
    par_level: Number(item.targetInventory || 0),

    is_active: true,
    pricing_review_needed: !item.inventoryReviewed,
    inventory_reviewed: Boolean(item.inventoryReviewed),
  };

  if (item.dbId) {
    dbItem.id = item.dbId;
  }

  return dbItem;
}

export default function Pantry() {
  const [activeView, setActiveView] = useState<PantryView>("inventory");
  const [searchTerm, setSearchTerm] = useState("");

  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const [pantryItems, setPantryItems] =
    useState<PantryItemWithDbId[]>(startingPantryItems);

  const [menuItems, setMenuItems] =
    useState<MenuPricingItem[]>(startingMenuItems);

  const [vendorOptions, setVendorOptions] = useState<string[]>([
    "All Vendors",
  ]);

  const vendorNameToIdRef = useRef<Record<string, string>>({});
  const vendorIdToNameRef = useRef<Record<string, string>>({});

  const [targets, setTargets] = useState<PantryReviewTargets>({
    targetFoodCostPercent: 30,
    warningFoodCostPercent: 35,
    highCostFoodCostPercent: 40,
    defaultLowStockWarning: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const loadedDbIdsRef = useRef<string[]>([]);
  const hasLoadedRef = useRef(false);
  const pantrySaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prepSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const suppressNextPantryAutoSaveRef = useRef(false);

  useEffect(() => {
    async function loadPantry() {
      setIsLoading(true);
      setSaveMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsLoading(false);
        setSaveMessage("Please log in to use Pantry.");
        return;
      }

      const orgId = await getCurrentOrganizationId();

      if (!orgId) {
        setIsLoading(false);
        setSaveMessage("No organization found for this user. Pantry cannot save.");
        return;
      }

      setOrganizationId(orgId);

   const { data: vendorData, error: vendorError } = await supabase
  .from("vendors")
  .select("id, vendor_name")
  .eq("organization_id", orgId)
  .eq("is_active", true)
  .order("vendor_name", { ascending: true });

      if (vendorError) {
        setIsLoading(false);
        setSaveMessage(`Could not load vendors: ${vendorError.message}`);
        return;
      }

      const vendors = (vendorData || []) as VendorRow[];

      vendorNameToIdRef.current = vendors.reduce<Record<string, string>>(
        (map, vendor) => {
          map[vendor.vendor_name] = vendor.id;
          return map;
        },
        {}
      );

      vendorIdToNameRef.current = vendors.reduce<Record<string, string>>(
        (map, vendor) => {
          map[vendor.id] = vendor.vendor_name;
          return map;
        },
        {}
      );

      setVendorOptions([
        "All Vendors",
        ...vendors.map((vendor) => vendor.vendor_name),
      ]);

      const { data: pantryData, error: pantryError } = await supabase
        .from("pantry_items")
        .select("*")
        .eq("organization_id", orgId)
        .eq("is_active", true)
        .order("item_name", { ascending: true });

      if (pantryError) {
        setIsLoading(false);
        setSaveMessage(`Could not load pantry items: ${pantryError.message}`);
        return;
      }

      const mappedItems = (pantryData || []).map((row, index) =>
        mapDbItemToPantryItem(row, index, vendorIdToNameRef.current)
      );

      loadedDbIdsRef.current = mappedItems
        .map((item) => item.dbId)
        .filter(Boolean) as string[];

      setPantryItems(mappedItems);

      const { data: prepData, error: prepError } = await supabase
        .from("pantry_prep_station_state")
        .select("recipes")
        .eq("organization_id", orgId)
        .maybeSingle();

      if (prepError) {
        console.warn("Could not load Prep Station recipes", prepError);
      }

      const loadedRecipes = Array.isArray(prepData?.recipes)
        ? (prepData.recipes as MenuPricingItem[])
        : [];

      setMenuItems(loadedRecipes);

      hasLoadedRef.current = true;
      setIsLoading(false);
      setSaveMessage(
        mappedItems.length === 0
          ? "No pantry items yet. Add one in Inventory Catalog."
          : "Pantry loaded. Changes save automatically."
      );
    }

    loadPantry();
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current || !organizationId) return;

    if (suppressNextPantryAutoSaveRef.current) {
      suppressNextPantryAutoSaveRef.current = false;
      return;
    }

    if (pantrySaveTimerRef.current) {
      clearTimeout(pantrySaveTimerRef.current);
    }

    pantrySaveTimerRef.current = setTimeout(() => {
      savePantryItems();
    }, 1200);

    return () => {
      if (pantrySaveTimerRef.current) {
        clearTimeout(pantrySaveTimerRef.current);
      }
    };
  }, [pantryItems, organizationId]);

  useEffect(() => {
    if (!hasLoadedRef.current || !organizationId) return;

    if (prepSaveTimerRef.current) {
      clearTimeout(prepSaveTimerRef.current);
    }

    prepSaveTimerRef.current = setTimeout(() => {
      savePrepStationRecipes();
    }, 1200);

    return () => {
      if (prepSaveTimerRef.current) {
        clearTimeout(prepSaveTimerRef.current);
      }
    };
  }, [menuItems, organizationId]);

  async function savePrepStationRecipes() {
    if (!organizationId) return;

    const { error } = await supabase
      .from("pantry_prep_station_state")
      .upsert(
        {
          organization_id: organizationId,
          recipes: menuItems,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organization_id" }
      );

    if (error) {
      console.error("Prep Station save failed", error);
      setSaveMessage(`Prep Station save failed: ${error.message}`);
      alert(`Prep Station save failed: ${error.message}`);
      return;
    }

    setSaveMessage("Autosaved.");
  }

  async function savePantryItems() {
    if (!organizationId) return;

    setIsSaving(true);
    setSaveMessage("");

    const dbItems = pantryItems.map((item) =>
      mapPantryItemToDbItem(item, organizationId, vendorNameToIdRef.current)
    );

    if (dbItems.length === 0) {
      setIsSaving(false);
      setSaveMessage("No pantry items to save.");
      return;
    }

    const { data, error } = await supabase
      .from("pantry_items")
      .upsert(dbItems)
      .select("*");

    if (error) {
      console.error("Pantry save failed", error);
      setIsSaving(false);
      setSaveMessage(`Save failed: ${error.message}`);
      alert(`Pantry save failed: ${error.message}`);
      return;
    }

    const returnedRows = data || [];

    const updatedItems = pantryItems.map((item, index) => ({
      ...item,
      dbId: item.dbId || returnedRows[index]?.id,
    }));

    const currentDbIds = updatedItems
      .map((item) => item.dbId)
      .filter(Boolean) as string[];

    const removedDbIds = loadedDbIdsRef.current.filter(
      (oldId) => !currentDbIds.includes(oldId)
    );

    if (removedDbIds.length > 0) {
      const { error: removeError } = await supabase
        .from("pantry_items")
        .update({ is_active: false })
        .in("id", removedDbIds);

      if (removeError) {
        setIsSaving(false);
        setSaveMessage(`Delete failed: ${removeError.message}`);
        return;
      }
    }

    loadedDbIdsRef.current = currentDbIds;

    const addedDbIds = updatedItems.some(
      (item, index) => item.dbId !== pantryItems[index]?.dbId
    );

    if (addedDbIds) {
      suppressNextPantryAutoSaveRef.current = true;
      setPantryItems(updatedItems);
    }

    setIsSaving(false);
    setSaveMessage("Autosaved.");
  }

  const filteredPantryItems = useMemo(() => {
    return pantryItems.filter((item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pantryItems, searchTerm]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) =>
      item.menuItemName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menuItems, searchTerm]);

  const lowStockCount = pantryItems.filter(
    (item) => item.currentInventory < item.targetInventory
  ).length;

  const totalInventoryValue = pantryItems.reduce((sum, item) => {
    const itemCostPerUnit =
      item.caseSize > 0 ? item.caseCost / item.caseSize : 0;

    return sum + item.currentInventory * itemCostPerUnit;
  }, 0);

  const averageFoodCost =
    menuItems.length > 0
      ? menuItems.reduce((sum, item) => sum + item.foodCostPercent, 0) /
        menuItems.length
      : 0;

  const reviewNeededCount = menuItems.filter(
    (item) => item.foodCostPercent >= targets.warningFoodCostPercent
  ).length;

  const activeViewLabel =
    activeView === "prepStation"
      ? "Search menu or prep items..."
      : "Search pantry items...";

  const navButtonClass = (view: PantryView) =>
    `rounded-xl px-4 py-2 text-sm font-semibold transition ${
      activeView === view
        ? "bg-orange-700 text-white shadow-sm"
        : "bg-orange-50 text-orange-900 hover:bg-orange-100"
    }`;

  return (
    <div className="w-full space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
          Kitchen & Tap
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">Pantry</h1>

        <p className="mt-1 text-sm text-slate-600">
          Track kitchen inventory, product costs, and prep menu or batch
          recipes.
        </p>

        <p
          className={`mt-3 text-xs font-semibold ${
            saveMessage.toLowerCase().includes("failed") ||
            saveMessage.toLowerCase().includes("could not") ||
            saveMessage.toLowerCase().includes("no organization")
              ? "text-red-700"
              : "text-slate-500"
          }`}
        >
          {isLoading
            ? "Loading Pantry..."
            : isSaving
            ? "Saving Pantry..."
            : saveMessage || "Changes save automatically."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Inventory Value</p>
          <p className="text-2xl font-bold text-slate-900">
            ${totalInventoryValue.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Items Below Target</p>
          <p className="text-2xl font-bold text-red-700">{lowStockCount}</p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Avg Food Cost</p>
          <p className="text-2xl font-bold text-slate-900">
            {averageFoodCost.toFixed(1)}%
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Needs Menu Review</p>
          <p className="text-2xl font-bold text-orange-700">
            {reviewNeededCount}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveView("inventory")}
              className={navButtonClass("inventory")}
            >
              Inventory
            </button>

            <button
              type="button"
              onClick={() => setActiveView("inventoryCatalog")}
              className={navButtonClass("inventoryCatalog")}
            >
              Inventory Catalog
            </button>

            <button
              type="button"
              onClick={() => setActiveView("prepStation")}
              className={navButtonClass("prepStation")}
            >
              Prep Station
            </button>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <input
              type="text"
              placeholder={activeViewLabel}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-xl border px-4 py-2 text-sm md:w-80"
            />

            <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {isSaving ? "Autosaving..." : "Autosave On"}
            </div>
          </div>
        </div>
      </div>

      {activeView === "inventory" ? (
        <PantryInventory
          items={filteredPantryItems}
          setItems={
            setPantryItems as React.Dispatch<React.SetStateAction<PantryItem[]>>
          }
        />
      ) : null}

      {activeView === "inventoryCatalog" ? (
        <PantryReviewView
          targets={targets}
          setTargets={setTargets}
          items={filteredPantryItems}
          setItems={
            setPantryItems as React.Dispatch<React.SetStateAction<PantryItem[]>>
          }
          vendorOptions={vendorOptions}
        />
      ) : null}

      {activeView === "prepStation" ? (
        <PantryPrepStation
          items={filteredMenuItems}
          setItems={setMenuItems}
          pantryItems={pantryItems}
          targetFoodCostPercent={targets.targetFoodCostPercent}
          warningFoodCostPercent={targets.warningFoodCostPercent}
          highCostFoodCostPercent={targets.highCostFoodCostPercent}
        />
      ) : null}
    </div>
  );
}