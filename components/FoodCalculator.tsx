"use client";

import { useState } from "react";

export default function FoodCalculator() {
  const [batchCost, setBatchCost] = useState("");

  const [portionPreset, setPortionPreset] = useState("4");
  const [customPortionCount, setCustomPortionCount] = useState("");

  const [pricingMode, setPricingMode] = useState("markup");

  const [manualPrice, setManualPrice] = useState("");
  const [markupPercent, setMarkupPercent] = useState("200");
  const [targetCostPercent, setTargetCostPercent] = useState("30");

  const [rounding, setRounding] = useState("0.25");

  const [taxRate, setTaxRate] = useState("8.5");
  const [customTaxRate, setCustomTaxRate] = useState("");
  const [taxMode, setTaxMode] = useState("exclude");

  function roundToIncrement(value: number, increment: number) {
    if (increment <= 0) return value.toFixed(2);

    return (
      Math.round(value / increment) * increment
    ).toFixed(2);
  }

  const selectedPortionCount =
    portionPreset === "custom"
      ? Number(customPortionCount || 0)
      : Number(portionPreset);

  const selectedTaxRate =
    taxRate === "custom"
      ? Number(customTaxRate || 0)
      : Number(taxRate);

  const costPerPortion =
    Number(batchCost || 0) > 0 &&
    selectedPortionCount > 0
      ? Number(batchCost) / selectedPortionCount
      : 0;

  let calculatedPrice = Number(manualPrice || 0);

  if (pricingMode === "markup") {
    calculatedPrice =
      costPerPortion *
      (1 + Number(markupPercent || 0) / 100);
  }

  if (pricingMode === "target") {
    calculatedPrice =
      Number(targetCostPercent || 0) > 0
        ? costPerPortion /
          (Number(targetCostPercent) / 100)
        : 0;
  }

  const menuPrice = Number(
    roundToIncrement(calculatedPrice, Number(rounding))
  );

  function applyTax(price: number) {
    if (
      selectedTaxRate <= 0 ||
      taxMode === "exclude"
    ) {
      return price.toFixed(2);
    }

    const taxedPrice =
      price * (1 + selectedTaxRate / 100);

    if (rounding === "0.01") {
      return taxedPrice.toFixed(2);
    }

    return roundToIncrement(
      taxedPrice,
      Number(rounding)
    );
  }

  const finalFoodPrice = applyTax(menuPrice);

  const profit = menuPrice - costPerPortion;

  const profitMargin =
    menuPrice > 0
      ? (profit / menuPrice) * 100
      : 0;

  const actualFoodCostPercent =
    menuPrice > 0
      ? (costPerPortion / menuPrice) * 100
      : 0;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-5">
      <h2 className="text-3xl font-bold">
        Food Calculator
      </h2>

      <input
        className="w-full border rounded-lg p-3"
        placeholder="Total Recipe / Batch Cost ($)"
        value={batchCost}
        onChange={(e) =>
          setBatchCost(e.target.value)
        }
      />

      <div className="space-y-2">
        <p className="font-semibold">
          Number of Portions
        </p>

        <div className="flex flex-wrap gap-4">
          {[
            "1",
            "2",
            "4",
            "6",
            "12",
            "custom",
          ].map((value) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="foodPortions"
                value={value}
                checked={portionPreset === value}
                onChange={(e) =>
                  setPortionPreset(e.target.value)
                }
              />

              {value === "custom"
                ? "Custom"
                : value}
            </label>
          ))}
        </div>

        {portionPreset === "custom" ? (
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Custom number of portions"
            value={customPortionCount}
            onChange={(e) =>
              setCustomPortionCount(
                e.target.value
              )
            }
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="font-semibold">
          Pricing Method
        </p>

        <div className="flex flex-wrap gap-4">
          {[
            ["manual", "Manual"],
            ["markup", "Markup %"],
            [
              "target",
              "Target Food Cost %",
            ],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="foodPricingMode"
                value={value}
                checked={
                  pricingMode === value
                }
                onChange={(e) =>
                  setPricingMode(
                    e.target.value
                  )
                }
              />

              {label}
            </label>
          ))}
        </div>
      </div>

      {pricingMode === "manual" ? (
        <input
          className="w-full border rounded-lg p-3"
          placeholder="Manual menu price ($)"
          value={manualPrice}
          onChange={(e) =>
            setManualPrice(e.target.value)
          }
        />
      ) : null}

      {pricingMode === "markup" ? (
        <div className="space-y-2">
          <p className="font-semibold">
            Markup Percentage
          </p>

          <div className="flex flex-wrap gap-4">
            {[
              "150",
              "200",
              "250",
              "300",
              "custom",
            ].map((value) => (
              <label
                key={value}
                className="flex items-center gap-2"
              >
                <input
                  type="radio"
                  name="foodMarkupPercent"
                  value={value}
                  checked={
                    value === "custom"
                      ? ![
                          "150",
                          "200",
                          "250",
                          "300",
                        ].includes(
                          markupPercent
                        )
                      : markupPercent ===
                        value
                  }
                  onChange={() =>
                    value === "custom"
                      ? setMarkupPercent("")
                      : setMarkupPercent(
                          value
                        )
                  }
                />

                {value === "custom"
                  ? "Custom"
                  : `${value}%`}
              </label>
            ))}
          </div>

          {![
            "150",
            "200",
            "250",
            "300",
          ].includes(markupPercent) ? (
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Custom markup %"
              value={markupPercent}
              onChange={(e) =>
                setMarkupPercent(
                  e.target.value
                )
              }
            />
          ) : null}
        </div>
      ) : null}

      {pricingMode === "target" ? (
        <div className="space-y-2">
          <p className="font-semibold">
            Target Food Cost Percentage
          </p>

          <div className="flex flex-wrap gap-4">
            {[
              "25",
              "30",
              "35",
              "40",
              "custom",
            ].map((value) => (
              <label
                key={value}
                className="flex items-center gap-2"
              >
                <input
                  type="radio"
                  name="foodTargetCostPercent"
                  value={value}
                  checked={
                    value === "custom"
                      ? ![
                          "25",
                          "30",
                          "35",
                          "40",
                        ].includes(
                          targetCostPercent
                        )
                      : targetCostPercent ===
                        value
                  }
                  onChange={() =>
                    value === "custom"
                      ? setTargetCostPercent("")
                      : setTargetCostPercent(
                          value
                        )
                  }
                />

                {value === "custom"
                  ? "Custom"
                  : `${value}%`}
              </label>
            ))}
          </div>

          {![
            "25",
            "30",
            "35",
            "40",
          ].includes(
            targetCostPercent
          ) ? (
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Custom target food cost %"
              value={targetCostPercent}
              onChange={(e) =>
                setTargetCostPercent(
                  e.target.value
                )
              }
            />
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="font-semibold">
          Rounding
        </p>

        <div className="flex flex-wrap gap-4">
          {[
            ["0.01", "Exact"],
            ["0.05", "$0.05"],
            ["0.10", "$0.10"],
            ["0.25", "$0.25"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="foodRounding"
                value={value}
                checked={rounding === value}
                onChange={(e) =>
                  setRounding(
                    e.target.value
                  )
                }
              />

              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">
          Tax Rate
        </p>

        <div className="flex flex-wrap gap-4">
          {[
            "0",
            "6.25",
            "7",
            "8",
            "8.5",
            "10",
            "custom",
          ].map((value) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="foodTaxRate"
                value={value}
                checked={
                  value === "custom"
                    ? ![
                        "0",
                        "6.25",
                        "7",
                        "8",
                        "8.5",
                        "10",
                      ].includes(
                        taxRate
                      )
                    : taxRate === value
                }
                onChange={() =>
                  value === "custom"
                    ? setTaxRate("")
                    : setTaxRate(value)
                }
              />

              {value === "custom"
                ? "Custom"
                : `${value}%`}
            </label>
          ))}
        </div>

        {![
          "0",
          "6.25",
          "7",
          "8",
          "8.5",
          "10",
        ].includes(taxRate) ? (
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Custom tax rate %"
            value={customTaxRate}
            onChange={(e) =>
              setCustomTaxRate(
                e.target.value
              )
            }
          />
        ) : null}
      </div>

      {selectedTaxRate > 0 ? (
        <div className="space-y-2">
          <p className="font-semibold">
            Tax Option
          </p>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="foodTaxMode"
                value="include"
                checked={
                  taxMode === "include"
                }
                onChange={(e) =>
                  setTaxMode(
                    e.target.value
                  )
                }
              />

              Include Tax In Menu Price
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="foodTaxMode"
                value="exclude"
                checked={
                  taxMode === "exclude"
                }
                onChange={(e) =>
                  setTaxMode(
                    e.target.value
                  )
                }
              />

              Do Not Include Tax In Menu Price
            </label>
          </div>
        </div>
      ) : null}

      <div className="bg-gray-100 rounded-xl p-4 space-y-3">
        <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-green-800">
            Menu Price
          </p>

          <p className="text-4xl font-bold text-green-900">
            ${finalFoodPrice}
          </p>
        </div>

        <p>
          <strong>
            Cost Per Portion:
          </strong>{" "}
          ${costPerPortion.toFixed(2)}
        </p>

        <p>
          <strong>
            Total Batch Cost:
          </strong>{" "}
          ${Number(
            batchCost || 0
          ).toFixed(2)}
        </p>

        <p>
          <strong>Portions:</strong>{" "}
          {selectedPortionCount.toFixed(0)}
        </p>

        <p>
          <strong>
            Pre-Tax Menu Price:
          </strong>{" "}
          ${menuPrice.toFixed(2)}
        </p>

        <p>
          <strong>
            Profit Per Portion:
          </strong>{" "}
          ${profit.toFixed(2)}
        </p>

        <p>
          <strong>
            Profit Margin:
          </strong>{" "}
          {profitMargin.toFixed(1)}%
        </p>

        <p>
          <strong>
            Actual Food Cost Percentage:
          </strong>{" "}
          {actualFoodCostPercent.toFixed(
            1
          )}
          %
        </p>

        <p>
          <strong>Tax Rate:</strong>{" "}
          {selectedTaxRate.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}