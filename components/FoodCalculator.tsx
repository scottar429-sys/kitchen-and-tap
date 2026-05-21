"use client";

import { useMemo, useState } from "react";

type IngredientRow = {
  id: number;
  name: string;
  amount: number;
  unit: string;
  cost: number;
};

type PantryReviewItem = {
  enteredName: string;
  status: "matched" | "possible" | "new";
  matchName?: string;
  action: "useMatch" | "addNew" | "skip";
};

const units = ["oz", "lb", "g", "kg", "each", "cup", "tbsp", "tsp", "qt", "gal"];

const samplePantryItems = [
  "Chicken Breast",
  "Sub Roll",
  "Marinara Sauce",
  "Mozzarella",
  "Parmesan",
  "Pizza Dough",
  "Flour",
  "Tomatoes",
];

export default function FoodCalculator() {
  const [recipeName, setRecipeName] = useState("Chicken Parmesan Sandwich");
  const [saveAs, setSaveAs] = useState("menu");
  const [pricingMode, setPricingMode] = useState("margin");
  const [manualPrice, setManualPrice] = useState("16");
  const [targetMargin, setTargetMargin] = useState("70");
  const [targetFoodCost, setTargetFoodCost] = useState("30");
  const [additionalKitchenCost, setAdditionalKitchenCost] = useState("3");
  const [rounding, setRounding] = useState("dollar");

  const [showPantryReview, setShowPantryReview] = useState(false);
  const [pantryReviewItems, setPantryReviewItems] = useState<PantryReviewItem[]>(
    []
  );

  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { id: 1, name: "Chicken Breast", amount: 8, unit: "oz", cost: 1.88 },
    { id: 2, name: "Sub Roll", amount: 1, unit: "each", cost: 0.72 },
    { id: 3, name: "Marinara Sauce", amount: 3, unit: "oz", cost: 0.45 },
    { id: 4, name: "Mozzarella", amount: 2, unit: "oz", cost: 0.64 },
    { id: 5, name: "Parmesan", amount: 1, unit: "oz", cost: 0.41 },
  ]);

  function applyRounding(value: number) {
    if (rounding === "ninetyFive") return Math.floor(value) + 0.95;
    if (rounding === "ninetyNine") return Math.floor(value) + 0.99;
    if (rounding === "dollar") return Math.ceil(value);
    return value;
  }

  function normalizeName(value: string) {
    return value.trim().toLowerCase();
  }

  function findPossibleMatch(name: string) {
    const normalized = normalizeName(name);

    return samplePantryItems.find((item) => {
      const pantryName = normalizeName(item);

      return (
        pantryName.includes(normalized) ||
        normalized.includes(pantryName) ||
        pantryName[0] === normalized[0]
      );
    });
  }

  function addIngredient() {
    setIngredients([
      ...ingredients,
      { id: Date.now(), name: "", amount: 1, unit: "oz", cost: 0 },
    ]);
  }

  function updateIngredient(
    id: number,
    field: keyof IngredientRow,
    value: string
  ) {
    setIngredients((rows) =>
      rows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "amount" || field === "cost" ? Number(value) : value,
            }
          : row
      )
    );
  }

  function removeIngredient(id: number) {
    setIngredients((rows) => rows.filter((row) => row.id !== id));
  }

  function handleSaveRecipe() {
    const reviewItems: PantryReviewItem[] = ingredients
      .filter((item) => item.name.trim().length > 0)
      .map((item) => {
        const exactMatch = samplePantryItems.find(
          (pantryItem) => normalizeName(pantryItem) === normalizeName(item.name)
        );

        if (exactMatch) {
          return {
            enteredName: item.name,
            status: "matched",
            matchName: exactMatch,
            action: "useMatch",
          };
        }

        const possibleMatch = findPossibleMatch(item.name);

        if (possibleMatch) {
          return {
            enteredName: item.name,
            status: "possible",
            matchName: possibleMatch,
            action: "useMatch",
          };
        }

        return {
          enteredName: item.name,
          status: "new",
          action: "addNew",
        };
      });

    setPantryReviewItems(reviewItems);
    setShowPantryReview(true);
  }

  function updateReviewAction(index: number, action: PantryReviewItem["action"]) {
    setPantryReviewItems((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, action } : item
      )
    );
  }

  function confirmSaveRecipe() {
    setShowPantryReview(false);
    alert("Recipe saved. Pantry review choices confirmed.");
  }

  const ingredientCost = useMemo(() => {
    return ingredients.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  }, [ingredients]);

  const additionalKitchenCostAmount =
    ingredientCost * (Number(additionalKitchenCost || 0) / 100);

  const totalRecipeCost = ingredientCost + additionalKitchenCostAmount;

  const priceByMargin =
    Number(targetMargin || 0) < 100
      ? totalRecipeCost / (1 - Number(targetMargin || 0) / 100)
      : 0;

  const priceByFoodCost =
    Number(targetFoodCost || 0) > 0
      ? totalRecipeCost / (Number(targetFoodCost || 0) / 100)
      : 0;

  const calculatedPrice =
    pricingMode === "manual"
      ? Number(manualPrice || 0)
      : pricingMode === "foodCost"
      ? priceByFoodCost
      : priceByMargin;

  const menuPrice = applyRounding(calculatedPrice);

  const profit = menuPrice - totalRecipeCost;
  const profitMargin = menuPrice > 0 ? (profit / menuPrice) * 100 : 0;
  const actualFoodCost = menuPrice > 0 ? (totalRecipeCost / menuPrice) * 100 : 0;

  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-2xl bg-white p-5 shadow-lg">
      <div>
        <h2 className="text-3xl font-bold">Food Calculator</h2>
        <p className="text-sm text-gray-500">
          Build recipes, compare selling prices, and review pantry items before
          saving.
        </p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">Recipe Name</p>
        <input
          type="text"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          placeholder="Example: Chicken Parmesan Sandwich"
          className="w-full rounded-xl border p-3"
        />
      </div>

      <div className="space-y-2">
        <p className="font-semibold">Recipe Type</p>

        <div className="grid gap-3">
          {[
            ["menu", "Menu Item", "Finished item sold to a guest"],
            [
              "prep",
              "Prep Item / Batch Recipe",
              "Sauce, dough, dressing, marinade, or base recipe",
            ],
          ].map(([value, label, description]) => (
            <label key={value} className="cursor-pointer rounded-xl border p-3">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="saveAs"
                  value={value}
                  checked={saveAs === value}
                  onChange={(e) => setSaveAs(e.target.value)}
                />
                <span className="font-semibold">{label}</span>
              </div>

              <p className="ml-6 mt-1 text-xs text-gray-500">{description}</p>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="font-semibold">Ingredients</p>
          <p className="text-sm text-gray-500">
            Enter the amount used in this recipe and the used cost.
          </p>
        </div>

        <div className="hidden grid-cols-[2fr_.65fr_.75fr_1.1fr_auto] gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid">
          <div>Ingredient</div>
          <div>Amount</div>
          <div>Unit</div>
          <div>Used Cost</div>
          <div></div>
        </div>

        <div className="space-y-3">
          {ingredients.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[2fr_.65fr_.75fr_1.1fr_auto] gap-2 rounded-xl border bg-gray-50 p-3"
            >
              <input
                className="min-w-0 rounded-lg border p-2"
                placeholder="Ingredient"
                value={item.name}
                onChange={(e) =>
                  updateIngredient(item.id, "name", e.target.value)
                }
              />

              <input
                className="min-w-0 rounded-lg border p-2"
                type="number"
                placeholder="Amt"
                value={item.amount}
                onChange={(e) =>
                  updateIngredient(item.id, "amount", e.target.value)
                }
              />

              <select
                className="min-w-0 rounded-lg border p-2"
                value={item.unit}
                onChange={(e) =>
                  updateIngredient(item.id, "unit", e.target.value)
                }
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>

              <input
                className="min-w-[80px] rounded-lg border p-2"
                type="number"
                step="0.01"
                placeholder="Cost"
                value={item.cost}
                onChange={(e) =>
                  updateIngredient(item.id, "cost", e.target.value)
                }
              />

              {ingredients.length > 1 ? (
                <button
                  className="rounded-lg bg-red-100 px-3 font-bold text-red-700"
                  onClick={() => removeIngredient(item.id)}
                >
                  X
                </button>
              ) : (
                <div></div>
              )}
            </div>
          ))}
        </div>

        <button
          className="w-full rounded-xl border py-3 font-bold"
          onClick={addIngredient}
        >
          + Add Ingredient
        </button>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">Pricing Strategy</p>

        <div className="grid gap-3">
          {[
            ["margin", "Target Margin %", "Recommended for menu profitability"],
            [
              "foodCost",
              "Target Food Cost %",
              "Common restaurant costing method",
            ],
            [
              "manual",
              "Current Selling Price",
              "Analyze an existing menu price",
            ],
          ].map(([value, label, description]) => (
            <label key={value} className="cursor-pointer rounded-xl border p-3">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pricingMode"
                  value={value}
                  checked={pricingMode === value}
                  onChange={(e) => setPricingMode(e.target.value)}
                />
                <span className="font-semibold">{label}</span>
              </div>

              <p className="ml-6 mt-1 text-xs text-gray-500">{description}</p>
            </label>
          ))}
        </div>
      </div>

      {pricingMode === "manual" ? (
        <input
          className="w-full rounded-lg border p-3"
          placeholder="Current selling price"
          value={manualPrice}
          onChange={(e) => setManualPrice(e.target.value)}
        />
      ) : null}

      {pricingMode === "margin" ? (
        <input
          className="w-full rounded-lg border p-3"
          placeholder="Target margin %, example: 70"
          value={targetMargin}
          onChange={(e) => setTargetMargin(e.target.value)}
        />
      ) : null}

      {pricingMode === "foodCost" ? (
        <input
          className="w-full rounded-lg border p-3"
          placeholder="Target food cost %, example: 30"
          value={targetFoodCost}
          onChange={(e) => setTargetFoodCost(e.target.value)}
        />
      ) : null}

      <div className="space-y-2">
        <p className="font-semibold">Additional Kitchen Cost %</p>

        <p className="text-sm text-gray-500">
          Optional percentage to help cover spices, garnish, oil, and small
          kitchen consumables.
        </p>

        <div className="flex flex-wrap gap-4">
          {["0", "2", "3", "5", "custom"].map((value) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="additionalKitchenCost"
                value={value}
                checked={
                  value === "custom"
                    ? !["0", "2", "3", "5"].includes(additionalKitchenCost)
                    : additionalKitchenCost === value
                }
                onChange={() =>
                  value === "custom"
                    ? setAdditionalKitchenCost("")
                    : setAdditionalKitchenCost(value)
                }
              />

              {value === "custom" ? "Custom" : `${value}%`}
            </label>
          ))}
        </div>

        {!["0", "2", "3", "5"].includes(additionalKitchenCost) ? (
          <input
            className="w-full rounded-lg border p-3"
            placeholder="Custom additional kitchen cost %"
            value={additionalKitchenCost}
            onChange={(e) => setAdditionalKitchenCost(e.target.value)}
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="font-semibold">Rounding</p>

        <div className="flex flex-wrap gap-4">
          {[
            ["ninetyFive", ".95"],
            ["ninetyNine", ".99"],
            ["dollar", "Dollar"],
            ["none", "Exact"],
          ].map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="rounding"
                value={value}
                checked={rounding === value}
                onChange={(e) => setRounding(e.target.value)}
              />

              {label}
            </label>
          ))}
        </div>
      </div>

      <button
        className="w-full rounded-xl bg-orange-700 py-3 font-bold text-white hover:bg-orange-800"
        onClick={handleSaveRecipe}
      >
        Save Recipe
      </button>

      <div className="space-y-3 rounded-xl bg-gray-100 p-4">
        <h3 className="text-xl font-bold">Pricing Summary</h3>

        <div className="rounded-xl border border-green-300 bg-green-100 p-4 text-center">
          <p className="text-sm font-semibold text-green-800">
            Recommended Selling Price
          </p>

          <p className="text-4xl font-bold text-green-900">
            ${menuPrice.toFixed(2)}
          </p>
        </div>

        <p>
          <strong>Ingredient Cost:</strong> ${ingredientCost.toFixed(2)}
        </p>

        <p>
          <strong>Additional Kitchen Cost:</strong> $
          {additionalKitchenCostAmount.toFixed(2)}
        </p>

        <p>
          <strong>Total Recipe Cost:</strong> ${totalRecipeCost.toFixed(2)}
        </p>

        <p>
          <strong>Profit:</strong> ${profit.toFixed(2)}
        </p>

        <p>
          <strong>Profit Margin:</strong> {profitMargin.toFixed(1)}%
        </p>

        <p>
          <strong>Actual Food Cost:</strong> {actualFoodCost.toFixed(1)}%
        </p>

        {actualFoodCost > 35 ? (
          <div className="rounded-xl border border-red-300 bg-red-100 p-3 text-sm font-semibold text-red-800">
            Warning: This recipe may be priced too low for strong profitability.
          </div>
        ) : null}
      </div>

      {showPantryReview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-2xl font-bold">Review Pantry Items</h3>

            <p className="mt-1 text-sm text-gray-500">
              Before saving, confirm how these ingredients should connect to
              your pantry.
            </p>

            <div className="mt-4 space-y-3">
              {pantryReviewItems.map((item, index) => (
                <div key={index} className="rounded-xl border bg-gray-50 p-3">
                  <p className="font-bold">{item.enteredName}</p>

                  {item.status === "matched" ? (
                    <p className="text-sm text-green-700">
                      Matched pantry item: {item.matchName}
                    </p>
                  ) : null}

                  {item.status === "possible" ? (
                    <p className="text-sm text-yellow-700">
                      Possible match found: {item.matchName}
                    </p>
                  ) : null}

                  {item.status === "new" ? (
                    <p className="text-sm text-gray-600">
                      This looks like a new pantry item.
                    </p>
                  ) : null}

                  <div className="mt-3 grid gap-2">
                    {item.matchName ? (
                      <button
                        className={`rounded-lg border p-2 text-sm font-semibold ${
                          item.action === "useMatch"
                            ? "bg-black text-white"
                            : "bg-white"
                        }`}
                        onClick={() => updateReviewAction(index, "useMatch")}
                      >
                        Use {item.matchName}
                      </button>
                    ) : null}

                    <button
                      className={`rounded-lg border p-2 text-sm font-semibold ${
                        item.action === "addNew"
                          ? "bg-black text-white"
                          : "bg-white"
                      }`}
                      onClick={() => updateReviewAction(index, "addNew")}
                    >
                      Add as New Pantry Item
                    </button>

                    <button
                      className={`rounded-lg border p-2 text-sm font-semibold ${
                        item.action === "skip"
                          ? "bg-black text-white"
                          : "bg-white"
                      }`}
                      onClick={() => updateReviewAction(index, "skip")}
                    >
                      Save Recipe Only
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                className="rounded-xl border py-3 font-bold"
                onClick={() => setShowPantryReview(false)}
              >
                Cancel
              </button>

              <button
                className="rounded-xl bg-orange-700 py-3 font-bold text-white hover:bg-orange-800"
                onClick={confirmSaveRecipe}
              >
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}