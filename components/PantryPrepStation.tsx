"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { PantryItem } from "./PantryInventory";
import type { MenuPricingItem } from "./PantryReviewView";

type RecipeType = "menu" | "batch";
type IngredientSource = "pantry" | "recipe";

type RecipeUnit =
  | "oz"
  | "lb"
  | "each"
  | "case"
  | "gallon"
  | "quart"
  | "cup"
  | "tbsp"
  | "tsp"
  | "portion";

type RecipeIngredient = {
  id: number;
  source: IngredientSource;
  pantryItemId?: number;
  recipeId?: number;
  amount: number;
  unit: RecipeUnit;
};

type PrepMenuItem = MenuPricingItem & {
  expanded?: boolean;
  recipeType?: RecipeType;
  servings?: number;
  yieldQuantity?: number;
  yieldUnit?: RecipeUnit;
  recipeIngredients?: RecipeIngredient[];
  prepNotes?: string;
};


type SearchableOption = {
  id: number;
  label: string;
  subLabel?: string;
};

type SearchableSelectProps = {
  valueId?: number;
  options: SearchableOption[];
  placeholder: string;
  inputId: string;
  onSelect: (id: number) => void;
};

function SearchableSelect({
  valueId,
  options,
  placeholder,
  inputId,
  onSelect,
}: SearchableSelectProps) {
  const selectedOption = options.find((option) => option.id === valueId);
  const [typedValue, setTypedValue] = useState(selectedOption?.label || "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setTypedValue(selectedOption?.label || "");
  }, [selectedOption?.label]);

  const filteredOptions = useMemo(() => {
    const searchValue = typedValue.trim().toLowerCase();

    if (!searchValue) return options.slice(0, 25);

    return options
      .filter((option) => {
        const label = option.label.toLowerCase();
        const subLabel = (option.subLabel || "").toLowerCase();
        return label.includes(searchValue) || subLabel.includes(searchValue);
      })
      .slice(0, 25);
  }, [options, typedValue]);

  function handleChange(nextValue: string) {
    setTypedValue(nextValue);
    setIsOpen(true);

    const exactMatch = options.find(
      (option) => option.label.toLowerCase() === nextValue.toLowerCase()
    );

    if (exactMatch) {
      onSelect(exactMatch.id);
    }
  }

  function handleSelect(option: SearchableOption) {
    setTypedValue(option.label);
    setIsOpen(false);
    onSelect(option.id);
  }

  function handleBlur() {
    window.setTimeout(() => {
      const exactMatch = options.find(
        (option) => option.label.toLowerCase() === typedValue.toLowerCase()
      );

      if (exactMatch) {
        setTypedValue(exactMatch.label);
        onSelect(exactMatch.id);
      } else {
        setTypedValue(selectedOption?.label || "");
      }

      setIsOpen(false);
    }, 120);
  }

  return (
    <div className="relative min-w-0" id={inputId}>
      <input
        value={typedValue}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        className="w-full min-w-0 rounded-xl border px-3 py-2 text-sm"
        placeholder={placeholder}
        autoComplete="off"
      />

      {isOpen ? (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border bg-white shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(option)}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-orange-50 ${
                  option.id === valueId ? "bg-orange-50" : "bg-white"
                }`}
              >
                <span className="block whitespace-normal break-words font-semibold text-slate-900">
                  {option.label}
                </span>
                {option.subLabel ? (
                  <span className="block whitespace-normal break-words text-xs text-slate-500">
                    {option.subLabel}
                  </span>
                ) : null}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-500">
              No matches found.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

type PantryPrepStationProps = {
  items: MenuPricingItem[];
  setItems: Dispatch<SetStateAction<MenuPricingItem[]>>;
  pantryItems: PantryItem[];
  targetFoodCostPercent: number;
  warningFoodCostPercent: number;
  highCostFoodCostPercent: number;
};

const recipeUnits: RecipeUnit[] = [
  "oz",
  "lb",
  "each",
  "gallon",
  "quart",
  "cup",
  "tbsp",
  "tsp",
  "portion",
];

function money(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getMarginPercent(menuPrice: number, plateCost: number) {
  if (menuPrice <= 0) return 0;
  return ((menuPrice - plateCost) / menuPrice) * 100;
}

function unitsMatch(a?: string, b?: string) {
  return String(a || "").toLowerCase() === String(b || "").toLowerCase();
}

function convertAmount(amount: number, fromUnit: string, toUnit: string) {
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();

  if (from === to) return amount;

  const weightToOz: Record<string, number> = {
    oz: 1,
    lb: 16,
  };

  const volumeToOz: Record<string, number> = {
    tsp: 1 / 6,
    tbsp: 0.5,
    cup: 8,
    quart: 32,
    gallon: 128,
    oz: 1,
  };

  if (weightToOz[from] && weightToOz[to]) {
    return (amount * weightToOz[from]) / weightToOz[to];
  }

  if (volumeToOz[from] && volumeToOz[to]) {
    return (amount * volumeToOz[from]) / volumeToOz[to];
  }

  return amount;
}

function getPantryCostPerRecipeUnit(item?: PantryItem) {
  if (!item) return 0;
  const caseSize = numberValue(item.caseSize, 0);
  if (caseSize <= 0) return 0;
  return numberValue(item.caseCost, 0) / caseSize;
}

function getPantryLineCost(item: PantryItem | undefined, amount: number, unit: RecipeUnit) {
  if (!item) return 0;

  const costPerRecipeUnit = getPantryCostPerRecipeUnit(item);
  const costingUnit = String(item.caseUnit || "each");

  // Older saved recipes may still have "case" as the ingredient unit from the previous UI.
  // If the item is costed by lb/oz/each, treat that old "case" value as the item's costing unit
  // so it does not accidentally price 6 oz of mozzarella like 6 full cases.
  const cleanUnit = unit === "case" && costingUnit !== "case" ? costingUnit : String(unit || costingUnit);

  const convertedAmount = unitsMatch(cleanUnit, costingUnit)
    ? amount
    : convertAmount(amount, cleanUnit, costingUnit);

  return costPerRecipeUnit * convertedAmount;
}

function normalizePrepItem(item: MenuPricingItem): PrepMenuItem {
  return {
    ...(item as PrepMenuItem),
    recipeType: (item as PrepMenuItem).recipeType || "menu",
    servings: (item as PrepMenuItem).servings || 1,
    yieldQuantity: (item as PrepMenuItem).yieldQuantity || 1,
    yieldUnit: (item as PrepMenuItem).yieldUnit || "portion",
    recipeIngredients: (item as PrepMenuItem).recipeIngredients || [],
    prepNotes: (item as PrepMenuItem).prepNotes || "",
    expanded: (item as PrepMenuItem).expanded || false,
  };
}

export default function PantryPrepStation({
  items,
  setItems,
  pantryItems,
  targetFoodCostPercent,
  warningFoodCostPercent,
  highCostFoodCostPercent,
}: PantryPrepStationProps) {
  const prepItems = items.map(normalizePrepItem);
  const prepRecipes = prepItems.filter((item) => item.recipeType === "batch");

  const pantryOptions = useMemo<SearchableOption[]>(
    () =>
      pantryItems
        .slice()
        .sort((a, b) => a.itemName.localeCompare(b.itemName))
        .map((item) => ({
          id: item.id,
          label: item.itemName,
          subLabel: `${item.category} • ${item.caseUnit || "unit"}`,
        })),
    [pantryItems]
  );

  const batchOptions = useMemo<SearchableOption[]>(
    () =>
      prepRecipes
        .slice()
        .sort((a, b) => a.menuItemName.localeCompare(b.menuItemName))
        .map((recipe) => ({
          id: recipe.id,
          label: recipe.menuItemName,
          subLabel: `${recipe.yieldQuantity || 1} ${recipe.yieldUnit || "portion"}`,
        })),
    [prepRecipes]
  );

  function calculateRecipeCost(
    recipe: PrepMenuItem,
    allRecipes: PrepMenuItem[] = prepItems,
    visitedRecipeIds: number[] = []
  ): number {
    if (visitedRecipeIds.includes(recipe.id)) return 0;

    return (recipe.recipeIngredients || []).reduce((sum, ingredient) => {
      const amount = numberValue(ingredient.amount, 0);

      if (ingredient.source === "pantry") {
        const pantryItem = pantryItems.find(
          (item) => item.id === ingredient.pantryItemId
        );
        return sum + getPantryLineCost(pantryItem, amount, ingredient.unit);
      }

      const prepRecipe = allRecipes.find(
        (item) => item.id === ingredient.recipeId && item.recipeType === "batch"
      );

      if (!prepRecipe) return sum;

      const batchCost = calculateRecipeCost(prepRecipe, allRecipes, [
        ...visitedRecipeIds,
        recipe.id,
      ]);
      const yieldQuantity = Math.max(numberValue(prepRecipe.yieldQuantity, 1), 1);
      const costPerYieldUnit = batchCost / yieldQuantity;

      return sum + costPerYieldUnit * amount;
    }, 0);
  }

  function recalculateItem(item: PrepMenuItem, allRecipes: PrepMenuItem[] = prepItems): PrepMenuItem {
    const recipeCost = calculateRecipeCost(item, allRecipes);
    const menuPrice = numberValue(item.menuPrice, 0);

    return {
      ...item,
      plateCost: recipeCost,
      foodCostPercent: menuPrice > 0 ? (recipeCost / menuPrice) * 100 : 0,
      profit: menuPrice - recipeCost,
    };
  }

  function recalculateAll(nextItems: PrepMenuItem[]) {
    return nextItems.map((item) => recalculateItem(item, nextItems));
  }

  function updateMenuItem(
    id: number,
    field: keyof PrepMenuItem,
    value: string | number
  ) {
    setItems((currentItems) => {
      const normalizedItems = currentItems.map(normalizePrepItem);
      const updatedItems = normalizedItems.map((item) => {
        if (item.id !== id) return item;

        if (
          field === "menuItemName" ||
          field === "prepNotes" ||
          field === "recipeType" ||
          field === "yieldUnit"
        ) {
          return { ...item, [field]: String(value) } as PrepMenuItem;
        }

        return { ...item, [field]: numberValue(value, 0) } as PrepMenuItem;
      });

      return recalculateAll(updatedItems);
    });
  }

  function toggleExpanded(id: number) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        const prepItem = normalizePrepItem(item);
        return prepItem.id === id
          ? { ...prepItem, expanded: !prepItem.expanded }
          : prepItem;
      })
    );
  }

  function addRecipe(recipeType: RecipeType) {
    const nextId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;

    const newItem: PrepMenuItem = {
      id: nextId,
      menuItemName: recipeType === "batch" ? "New Prep Recipe" : "New Menu Item",
      menuPrice: recipeType === "batch" ? 0 : 0,
      plateCost: 0,
      foodCostPercent: 0,
      profit: 0,
      recipeType,
      servings: 1,
      yieldQuantity: recipeType === "batch" ? 1 : 1,
      yieldUnit: recipeType === "batch" ? "portion" : "portion",
      recipeIngredients: [],
      prepNotes: "",
      expanded: true,
    };

    setItems((currentItems) => [...currentItems.map(normalizePrepItem), newItem]);
  }

  function deleteMenuItem(id: number) {
    setItems((currentItems) =>
      recalculateAll(
        currentItems
          .map(normalizePrepItem)
          .filter((item) => item.id !== id)
          .map((item) => ({
            ...item,
            recipeIngredients: (item.recipeIngredients || []).filter(
              (ingredient) => ingredient.recipeId !== id
            ),
          }))
      )
    );
  }

  function getDefaultPantryIngredient(existingIngredients: RecipeIngredient[]): RecipeIngredient | null {
    const firstPantryItem = pantryItems[0];
    if (!firstPantryItem) return null;

    return {
      id:
        existingIngredients.length > 0
          ? Math.max(...existingIngredients.map((ingredient) => ingredient.id)) + 1
          : 1,
      source: "pantry", IngredientSource,
      pantryItemId: firstPantryItem.id,
      amount: 1,
      unit: (firstPantryItem.caseUnit as RecipeUnit) || "each",
    };
  }

  function getDefaultBatchIngredient(existingIngredients: RecipeIngredient[], parentRecipeId: number): RecipeIngredient | null {
    const firstBatchRecipe = prepRecipes.find((recipe) => recipe.id !== parentRecipeId);
    if (!firstBatchRecipe) return null;

    return {
      id:
        existingIngredients.length > 0
          ? Math.max(...existingIngredients.map((ingredient) => ingredient.id)) + 1
          : 1,
      source: "recipe",
      recipeId: firstBatchRecipe.id,
      amount: 1,
      unit: firstBatchRecipe.yieldUnit || "portion",
    };
  }

  function addIngredient(menuItemId: number, source: IngredientSource) {
    setItems((currentItems) => {
      const normalizedItems = currentItems.map(normalizePrepItem);
      const updatedItems = normalizedItems.map((item) => {
        if (item.id !== menuItemId) return item;

        const currentIngredients = item.recipeIngredients || [];
        const nextIngredient =
          source === "pantry"
            ? getDefaultPantryIngredient(currentIngredients)
            : getDefaultBatchIngredient(currentIngredients, menuItemId);

        if (!nextIngredient) return item;

        return {
          ...item,
          recipeIngredients: [...currentIngredients, nextIngredient],
        };
      });

      return recalculateAll(updatedItems);
    });
  }

  function updateIngredient(
    menuItemId: number,
    ingredientId: number,
    field: keyof RecipeIngredient,
    value: string
  ) {
    setItems((currentItems) => {
      const normalizedItems = currentItems.map(normalizePrepItem);
      const updatedItems = normalizedItems.map((item) => {
        if (item.id !== menuItemId) return item;

        const updatedIngredients = (item.recipeIngredients || []).map((ingredient) => {
          if (ingredient.id !== ingredientId) return ingredient;

          if (field === "unit") {
            return { ...ingredient, unit: value as RecipeUnit };
          }

          if (field === "source") {
            return {
              ...ingredient,
              source: value as IngredientSource,
              pantryItemId: value === "pantry" ? pantryItems[0]?.id : undefined,
              recipeId: value === "recipe" ? prepRecipes.find((recipe) => recipe.id !== menuItemId)?.id : undefined,
              unit:
                value === "pantry"
                  ? ((pantryItems[0]?.caseUnit as RecipeUnit) || "each")
                  : (prepRecipes.find((recipe) => recipe.id !== menuItemId)?.yieldUnit || "portion"),
            };
          }

          if (field === "pantryItemId") {
            const selectedPantryItem = pantryItems.find((pantryItem) => pantryItem.id === Number(value));
            return {
              ...ingredient,
              pantryItemId: Number(value),
              recipeId: undefined,
              source: "pantry", as IngredientSource,
              unit: (selectedPantryItem?.caseUnit as RecipeUnit) || ingredient.unit || "each",
            };
          }

          if (field === "recipeId") {
            const selectedRecipe = prepRecipes.find((recipe) => recipe.id === Number(value));
            return {
              ...ingredient,
              recipeId: Number(value),
              pantryItemId: undefined,
              source: "recipe", as IngredientSource, 
              unit: selectedRecipe?.yieldUnit || ingredient.unit || "portion",
            };
          }

          return {
            ...ingredient,
            [field]: numberValue(value, 0),
          };
        });

        return {
          ...item,
          recipeIngredients: updatedIngredients,
        };
      });

      return recalculateAll(updatedItems);
    });
  }

  function deleteIngredient(menuItemId: number, ingredientId: number) {
    setItems((currentItems) => {
      const updatedItems = currentItems.map(normalizePrepItem).map((item) => {
        if (item.id !== menuItemId) return item;

        return {
          ...item,
          recipeIngredients: (item.recipeIngredients || []).filter(
            (ingredient) => ingredient.id !== ingredientId
          ),
        };
      });

      return recalculateAll(updatedItems);
    });
  }

  function getStatus(item: PrepMenuItem) {
    if (item.recipeType === "batch") {
      return {
        label: "Prep Recipe",
        className: "bg-blue-100 text-blue-800",
      };
    }

    const foodCostPercent = numberValue(item.foodCostPercent, 0);

    if (foodCostPercent >= highCostFoodCostPercent) {
      return {
        label: "High Cost",
        className: "bg-red-100 text-red-800",
      };
    }

    if (foodCostPercent >= warningFoodCostPercent) {
      return {
        label: "Review",
        className: "bg-orange-100 text-orange-800",
      };
    }

    if (foodCostPercent <= targetFoodCostPercent && item.menuPrice > 0) {
      return {
        label: "On Target",
        className: "bg-green-100 text-green-800",
      };
    }

    return {
      label: "Draft",
      className: "bg-yellow-100 text-yellow-800",
    };
  }

  function getIngredientLabel(ingredient: RecipeIngredient) {
    if (ingredient.source === "pantry") {
      return pantryItems.find((item) => item.id === ingredient.pantryItemId)?.itemName || "Pantry Item";
    }

    return prepRecipes.find((recipe) => recipe.id === ingredient.recipeId)?.menuItemName || "Prep Recipe";
  }

  function getIngredientLineCost(ingredient: RecipeIngredient) {
    const amount = numberValue(ingredient.amount, 0);

    if (ingredient.source === "pantry") {
      const pantryItem = pantryItems.find((item) => item.id === ingredient.pantryItemId);
      return getPantryLineCost(pantryItem, amount, ingredient.unit);
    }

    const prepRecipe = prepRecipes.find((recipe) => recipe.id === ingredient.recipeId);
    if (!prepRecipe) return 0;

    const batchCost = calculateRecipeCost(prepRecipe);
    const yieldQuantity = Math.max(numberValue(prepRecipe.yieldQuantity, 1), 1);
    return (batchCost / yieldQuantity) * amount;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
          Prep Station
        </p>

        <h2 className="text-2xl font-bold text-slate-900">
          Menu Items & Prep Recipes
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Build prep recipes like dough, sauces, and prep items, then use those prep recipes inside menu items.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addRecipe("menu")}
            className="rounded-xl bg-orange-700 px-4 py-2 text-sm font-bold text-white hover:bg-orange-800"
          >
            Add Menu Item
          </button>

          <button
            type="button"
            onClick={() => addRecipe("batch")}
            className="rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-800 hover:bg-orange-100"
          >
            Add Prep Recipe
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-2">
        {prepItems.map((prepItem) => {
          const recalculatedItem = recalculateItem(prepItem);
          const status = getStatus(recalculatedItem);
          const marginPercent = getMarginPercent(recalculatedItem.menuPrice, recalculatedItem.plateCost);
          const yieldQuantity = Math.max(numberValue(recalculatedItem.yieldQuantity, 1), 1);
          const costPerYieldUnit = recalculatedItem.plateCost / yieldQuantity;

          return (
            <div key={recalculatedItem.id} className="min-w-0 overflow-visible rounded-2xl border bg-white p-4 shadow-sm">
              <button
                type="button"
                onClick={() => toggleExpanded(recalculatedItem.id)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {recalculatedItem.menuItemName}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {recalculatedItem.recipeType === "batch"
                        ? `Makes ${yieldQuantity} ${recalculatedItem.yieldUnit}`
                        : `Click to ${recalculatedItem.expanded ? "collapse" : "edit recipe"}`}
                    </p>
                  </div>

                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                  {recalculatedItem.recipeType === "menu" ? (
                    <>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-500">Menu Price</p>
                        <p className="text-lg font-bold">{money(recalculatedItem.menuPrice)}</p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-500">Plate Cost</p>
                        <p className="text-lg font-bold">{money(recalculatedItem.plateCost)}</p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-500">Margin</p>
                        <p className="text-lg font-bold">{marginPercent.toFixed(1)}%</p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-500">Profit</p>
                        <p className="text-lg font-bold">{money(recalculatedItem.profit)}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-500">Recipe Cost</p>
                        <p className="text-lg font-bold">{money(recalculatedItem.plateCost)}</p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-500">Yield</p>
                        <p className="text-lg font-bold">{yieldQuantity}</p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-500">Cost Unit</p>
                        <p className="text-lg font-bold capitalize">{recalculatedItem.yieldUnit || "portion"}</p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-500">Cost / Unit</p>
                        <p className="text-lg font-bold">{money(costPerYieldUnit)}</p>
                      </div>
                    </>
                  )}
                </div>
              </button>

              {recalculatedItem.expanded ? (
                <div className="mt-4 space-y-4 border-t pt-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-500">
                        Recipe Name
                      </label>
                      <input
                        value={recalculatedItem.menuItemName}
                        onChange={(event) =>
                          updateMenuItem(recalculatedItem.id, "menuItemName", event.target.value)
                        }
                        className="mt-1 w-full rounded-xl border px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-500">
                        Recipe Type
                      </label>
                      <select
                        value={recalculatedItem.recipeType}
                        onChange={(event) =>
                          updateMenuItem(recalculatedItem.id, "recipeType", event.target.value)
                        }
                        className="mt-1 w-full rounded-xl border px-3 py-2"
                      >
                        <option value="menu">Menu Item</option>
                        <option value="batch">Prep Recipe</option>
                      </select>
                    </div>

                    {recalculatedItem.recipeType === "menu" ? (
                      <div>
                        <label className="text-[11px] font-bold uppercase text-slate-500">
                          Menu Price
                        </label>
                        <input
                          type="number"
                          value={recalculatedItem.menuPrice}
                          onChange={(event) =>
                            updateMenuItem(recalculatedItem.id, "menuPrice", event.target.value)
                          }
                          className="mt-1 w-full rounded-xl border px-3 py-2"
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-[11px] font-bold uppercase text-slate-500">
                            Yield Quantity
                          </label>
                          <input
                            type="number"
                            value={recalculatedItem.yieldQuantity || 1}
                            onChange={(event) =>
                              updateMenuItem(recalculatedItem.id, "yieldQuantity", event.target.value)
                            }
                            className="mt-1 w-full rounded-xl border px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold uppercase text-slate-500">
                            Yield Unit
                          </label>
                          <select
                            value={recalculatedItem.yieldUnit || "portion"}
                            onChange={(event) =>
                              updateMenuItem(recalculatedItem.id, "yieldUnit", event.target.value)
                            }
                            className="mt-1 w-full rounded-xl border px-3 py-2"
                          >
                            {recipeUnits.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="min-w-0 overflow-hidden rounded-2xl border border-orange-200 bg-orange-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900">Recipe Ingredients</h4>
                        <p className="text-sm text-slate-600">
                          Use real amounts and units. Example: 24 oz flour, 3 oz sauce, or 1 portion of dough.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => addIngredient(recalculatedItem.id, "pantry")}
                          className="rounded-xl bg-orange-700 px-3 py-2 text-sm font-bold text-white hover:bg-orange-800"
                        >
                          Add Pantry Item
                        </button>

                        <button
                          type="button"
                          onClick={() => addIngredient(recalculatedItem.id, "recipe")}
                          disabled={prepRecipes.filter((recipe) => recipe.id !== recalculatedItem.id).length === 0}
                          className="rounded-xl border border-orange-300 bg-white px-3 py-2 text-sm font-bold text-orange-800 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Add Prep Recipe
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {(recalculatedItem.recipeIngredients || []).length === 0 ? (
                        <p className="rounded-xl bg-white p-3 text-sm text-slate-500">
                          No ingredients added yet.
                        </p>
                      ) : null}

                      {(recalculatedItem.recipeIngredients || []).map((ingredient) => {
                        const lineCost = getIngredientLineCost(ingredient);
                        const validBatchOptions = prepRecipes.filter((recipe) => recipe.id !== recalculatedItem.id);

                        return (
                          <div
                            key={ingredient.id}
                            className="min-w-0 overflow-visible rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex rounded-xl border bg-slate-50 p-1 text-xs font-bold">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateIngredient(
                                      recalculatedItem.id,
                                      ingredient.id,
                                      "source",
                                      "pantry"
                                    )
                                  }
                                  className={`rounded-lg px-3 py-1 ${
                                    ingredient.source === "pantry"
                                      ? "bg-white text-orange-800 shadow-sm"
                                      : "text-slate-500"
                                  }`}
                                >
                                  Pantry
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateIngredient(
                                      recalculatedItem.id,
                                      ingredient.id,
                                      "source",
                                      "recipe"
                                    )
                                  }
                                  disabled={validBatchOptions.length === 0}
                                  className={`rounded-lg px-3 py-1 ${
                                    ingredient.source === "recipe"
                                      ? "bg-white text-orange-800 shadow-sm"
                                      : "text-slate-500"
                                  } disabled:cursor-not-allowed disabled:opacity-40`}
                                >
                                  Batch
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => deleteIngredient(recalculatedItem.id, ingredient.id)}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-100"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                              <div className="sm:col-span-3">
                                <label className="text-[11px] font-bold uppercase text-slate-500">
                                  Ingredient
                                </label>
                                {ingredient.source === "pantry" ? (
                                  <SearchableSelect
                                    valueId={ingredient.pantryItemId}
                                    options={pantryOptions}
                                    placeholder="Type to search pantry items..."
                                    inputId={`pantry-item-${recalculatedItem.id}-${ingredient.id}`}
                                    onSelect={(selectedId) =>
                                      updateIngredient(
                                        recalculatedItem.id,
                                        ingredient.id,
                                        "pantryItemId",
                                        String(selectedId)
                                      )
                                    }
                                  />
                                ) : (
                                  <SearchableSelect
                                    valueId={ingredient.recipeId}
                                    options={batchOptions.filter(
                                      (option) => option.id !== recalculatedItem.id
                                    )}
                                    placeholder="Type to search prep recipes..."
                                    inputId={`batch-recipe-${recalculatedItem.id}-${ingredient.id}`}
                                    onSelect={(selectedId) =>
                                      updateIngredient(
                                        recalculatedItem.id,
                                        ingredient.id,
                                        "recipeId",
                                        String(selectedId)
                                      )
                                    }
                                  />
                                )}
                              </div>

                              <div>
                                <label className="text-[11px] font-bold uppercase text-slate-500">
                                  Amount
                                </label>
                                <input
                                  type="number"
                                  value={ingredient.amount}
                                  onChange={(event) =>
                                    updateIngredient(
                                      recalculatedItem.id,
                                      ingredient.id,
                                      "amount",
                                      event.target.value
                                    )
                                  }
                                  className="w-full min-w-0 rounded-xl border px-3 py-2 text-sm"
                                  placeholder="Amount"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-bold uppercase text-slate-500">
                                  Unit
                                </label>
                                <select
                                  value={ingredient.unit}
                                  onChange={(event) =>
                                    updateIngredient(
                                      recalculatedItem.id,
                                      ingredient.id,
                                      "unit",
                                      event.target.value
                                    )
                                  }
                                  className="w-full min-w-0 rounded-xl border px-3 py-2 text-sm"
                                >
                                  {recipeUnits.map((unit) => (
                                    <option key={unit} value={unit}>
                                      {unit}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[11px] font-bold uppercase text-slate-500">
                                  Line Cost
                                </label>
                                <div className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold">
                                  {money(lineCost)}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 break-words rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                              {getIngredientLabel(ingredient)} × {ingredient.amount} {ingredient.unit}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500">
                      Prep Notes
                    </label>
                    <textarea
                      value={recalculatedItem.prepNotes || ""}
                      onChange={(event) =>
                        updateMenuItem(recalculatedItem.id, "prepNotes", event.target.value)
                      }
                      className="mt-1 min-h-24 w-full rounded-xl border px-3 py-2"
                      placeholder="Example: portion size, garnish, sauce, prep instructions..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteMenuItem(recalculatedItem.id)}
                    className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
                  >
                    Delete Recipe
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
