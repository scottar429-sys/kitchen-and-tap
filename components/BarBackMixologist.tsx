"use client";

import { useMemo, useState } from "react";

type BarCategory = "Liquor" | "Wine" | "Draft Beer" | "Cans/Bottles";

type BarItem = {
  id: number;
  productName: string;
  category: BarCategory;
  bottleCost: number;
  bottleSize: string;
};

type CocktailIngredient = {
  id: number;
  barItemId: number | "custom" | "";
  name: string;
  amountOz: number;
  customCost: number;
};

type Cocktail = {
  id: number;
  name: string;
  targetCostPercent: number;
  menuPrice: number;
  ingredients: CocktailIngredient[];
};

const bottleSizeToOz = (size: string) => {
  const normalized = size.toLowerCase();

  if (normalized.includes("1.75")) return 59.17;
  if (normalized.includes("1l") || normalized.includes("1 l")) return 33.81;
  if (normalized.includes("750")) return 25.36;
  if (normalized.includes("500")) return 16.91;
  if (normalized.includes("375")) return 12.68;

  return 25.36;
};

const money = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

export default function BarBackMixologist({ barItems }: { barItems: BarItem[] }) {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [name, setName] = useState("");
  const [targetCostPercent, setTargetCostPercent] = useState(20);
  const [menuPrice, setMenuPrice] = useState(0);
  const [ingredients, setIngredients] = useState<CocktailIngredient[]>([
    {
      id: Date.now(),
      barItemId: "",
      name: "",
      amountOz: 1,
      customCost: 0,
    },
  ]);

  const pricedItems = useMemo(
    () => barItems.filter((item) => item.bottleCost > 0),
    [barItems]
  );

  const getIngredientCost = (ingredient: CocktailIngredient) => {
    if (ingredient.barItemId === "custom") return ingredient.customCost;

    const item = pricedItems.find((barItem) => barItem.id === ingredient.barItemId);
    if (!item) return 0;

    return (item.bottleCost / bottleSizeToOz(item.bottleSize)) * ingredient.amountOz;
  };

  const totalCost = useMemo(() => {
    return ingredients.reduce(
      (sum, ingredient) => sum + getIngredientCost(ingredient),
      0
    );
  }, [ingredients, pricedItems]);

  const suggestedPrice =
    targetCostPercent > 0 ? totalCost / (targetCostPercent / 100) : 0;

  const profit = menuPrice > 0 ? menuPrice - totalCost : 0;
  const actualCostPercent = menuPrice > 0 ? (totalCost / menuPrice) * 100 : 0;

  function addIngredient() {
    setIngredients((current) => [
      ...current,
      {
        id: Date.now(),
        barItemId: "",
        name: "",
        amountOz: 1,
        customCost: 0,
      },
    ]);
  }

  function updateIngredient(
    id: number,
    field: keyof CocktailIngredient,
    value: string | number
  ) {
    setIngredients((current) =>
      current.map((ingredient) => {
        if (ingredient.id !== id) return ingredient;

        if (field === "barItemId") {
          if (value === "custom") {
            return {
              ...ingredient,
              barItemId: "custom",
              name: "Custom Ingredient",
            };
          }

          if (value === "") {
            return {
              ...ingredient,
              barItemId: "",
              name: "",
            };
          }

          const selectedItem = pricedItems.find((item) => item.id === Number(value));

          return {
            ...ingredient,
            barItemId: Number(value),
            name: selectedItem?.productName ?? "",
          };
        }

        return {
          ...ingredient,
          [field]: value,
        };
      })
    );
  }

  function removeIngredient(id: number) {
    setIngredients((current) =>
      current.length === 1
        ? current
        : current.filter((ingredient) => ingredient.id !== id)
    );
  }

  function saveCocktail() {
    if (!name.trim()) return;

    setCocktails((current) => [
      {
        id: Date.now(),
        name,
        targetCostPercent,
        menuPrice,
        ingredients,
      },
      ...current,
    ]);

    setName("");
    setTargetCostPercent(20);
    setMenuPrice(0);
    setIngredients([
      {
        id: Date.now(),
        barItemId: "",
        name: "",
        amountOz: 1,
        customCost: 0,
      },
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-4 shadow">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
          Cocktail Pricing
        </p>
        <h2 className="text-2xl font-bold">Mixologist</h2>
        <p className="text-gray-600">
          Build cocktails using saved bottle costs from Quarterly Review.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Recipe Cost</p>
            <p className="text-2xl font-bold">{money(totalCost)}</p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Suggested Price</p>
            <p className="text-2xl font-bold text-orange-700">
              {money(suggestedPrice)}
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Profit</p>
            <p className="text-2xl font-bold">{money(profit)}</p>
            <p className="text-xs text-gray-500">
              Actual cost: {actualCostPercent.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <h3 className="text-xl font-bold">New Cocktail</h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label>
            <span className="text-sm font-medium text-gray-700">
              Cocktail Name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Margarita"
              className="mt-1 w-full rounded-xl border bg-white p-3"
            />
          </label>

          <label>
            <span className="text-sm font-medium text-gray-700">
              Target Cost %
            </span>
            <input
              type="number"
              value={targetCostPercent}
              onChange={(event) => setTargetCostPercent(Number(event.target.value))}
              className="mt-1 w-full rounded-xl border bg-white p-3"
            />
          </label>

          <label>
            <span className="text-sm font-medium text-gray-700">
              Menu Price
            </span>
            <input
              type="number"
              value={menuPrice}
              onChange={(event) => setMenuPrice(Number(event.target.value))}
              placeholder="12"
              className="mt-1 w-full rounded-xl border bg-white p-3"
            />
          </label>
        </div>

        <div className="mt-5 space-y-3">
          {ingredients.map((ingredient) => {
            const selectedItem =
              ingredient.barItemId !== "custom" && ingredient.barItemId !== ""
                ? pricedItems.find((item) => item.id === ingredient.barItemId)
                : null;

            const ingredientCost = getIngredientCost(ingredient);

            return (
              <div key={ingredient.id} className="rounded-2xl bg-gray-50 p-4">
                <div className="grid gap-3 md:grid-cols-4">
                  <label className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-700">
                      Ingredient
                    </span>
                    <select
                      value={ingredient.barItemId}
                      onChange={(event) =>
                        updateIngredient(
                          ingredient.id,
                          "barItemId",
                          event.target.value
                        )
                      }
                      className="mt-1 w-full rounded-xl border bg-white p-3"
                    >
                      <option value="">
                        Select from Quarterly Review pricing
                      </option>
                      {pricedItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.productName} — {money(item.bottleCost)} /{" "}
                          {item.bottleSize}
                        </option>
                      ))}
                      <option value="custom">Custom ingredient</option>
                    </select>
                  </label>

                  <label>
                    <span className="text-sm font-medium text-gray-700">
                      Amount Used
                    </span>
                    <input
                      type="number"
                      value={ingredient.amountOz}
                      onChange={(event) =>
                        updateIngredient(
                          ingredient.id,
                          "amountOz",
                          Number(event.target.value)
                        )
                      }
                      className="mt-1 w-full rounded-xl border bg-white p-3"
                    />
                    <p className="mt-1 text-xs text-gray-500">ounces</p>
                  </label>

                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Cost
                    </span>
                    <div className="mt-1 rounded-xl border bg-white p-3 font-bold">
                      {money(ingredientCost)}
                    </div>
                  </div>
                </div>

                {ingredient.barItemId === "custom" ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label>
                      <span className="text-sm font-medium text-gray-700">
                        Custom Name
                      </span>
                      <input
                        value={ingredient.name}
                        onChange={(event) =>
                          updateIngredient(
                            ingredient.id,
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="Lime juice, syrup, garnish"
                        className="mt-1 w-full rounded-xl border bg-white p-3"
                      />
                    </label>

                    <label>
                      <span className="text-sm font-medium text-gray-700">
                        Custom Cost
                      </span>
                      <input
                        type="number"
                        value={ingredient.customCost}
                        onChange={(event) =>
                          updateIngredient(
                            ingredient.id,
                            "customCost",
                            Number(event.target.value)
                          )
                        }
                        className="mt-1 w-full rounded-xl border bg-white p-3"
                      />
                    </label>
                  </div>
                ) : null}

                {selectedItem ? (
                  <p className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
                    Pulling cost from Quarterly Review:{" "}
                    <strong>{selectedItem.productName}</strong> at{" "}
                    {money(selectedItem.bottleCost)} per {selectedItem.bottleSize}.
                  </p>
                ) : null}

                <button
                  onClick={() => removeIngredient(ingredient.id)}
                  className="mt-3 rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200"
                >
                  Remove Ingredient
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={addIngredient}
            className="rounded-xl bg-gray-100 px-4 py-3 font-bold text-gray-700 hover:bg-gray-200"
          >
            + Add Ingredient
          </button>

          <button
            onClick={saveCocktail}
            className="rounded-xl bg-orange-700 px-4 py-3 font-bold text-white hover:bg-orange-800"
          >
            Save Cocktail
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Saved Cocktails</h3>

        {cocktails.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-6 text-center text-gray-500 shadow">
            No cocktails saved yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {cocktails.map((cocktail) => {
              const cocktailCost = cocktail.ingredients.reduce(
                (sum, ingredient) => sum + getIngredientCost(ingredient),
                0
              );

              const cocktailSuggested =
                cocktail.targetCostPercent > 0
                  ? cocktailCost / (cocktail.targetCostPercent / 100)
                  : 0;

              const cocktailProfit = cocktail.menuPrice - cocktailCost;

              return (
                <div
                  key={cocktail.id}
                  className="rounded-2xl bg-white p-4 shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xl font-bold">{cocktail.name}</h4>
                      <p className="text-sm text-gray-600">
                        Target cost: {cocktail.targetCostPercent}%
                      </p>
                    </div>

                    <div className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-800">
                      {money(cocktail.menuPrice)}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Cost</p>
                      <p className="font-bold">{money(cocktailCost)}</p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Suggested</p>
                      <p className="font-bold text-orange-700">
                        {money(cocktailSuggested)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Profit</p>
                      <p className="font-bold">{money(cocktailProfit)}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {cocktail.ingredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="flex justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm"
                      >
                        <span className="text-gray-700">
                          {ingredient.name} — {ingredient.amountOz} oz
                        </span>
                        <span className="font-bold">
                          {money(getIngredientCost(ingredient))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}