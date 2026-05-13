"use client";

import { useState } from "react";

export default function LiquorCalculator() {
  const [bottleCost, setBottleCost] = useState("");

  const [bottleSize, setBottleSize] = useState("750");
  const [customBottleSize, setCustomBottleSize] = useState("");
  const [customBottleUnit, setCustomBottleUnit] = useState("ml");

  const [pourSize, setPourSize] = useState("1.5");
  const [customPourSize, setCustomPourSize] = useState("");

  const [mixerCost, setMixerCost] = useState("0");
  const [customMixerCost, setCustomMixerCost] = useState("");

  const [pricingMode, setPricingMode] = useState("markup");
  const [manualPrice, setManualPrice] = useState("");
  const [markupPercent, setMarkupPercent] = useState("400");
  const [targetCostPercent, setTargetCostPercent] = useState("20");

  const [rounding, setRounding] = useState("0.25");

  const [taxRate, setTaxRate] = useState("8.5");
  const [customTaxRate, setCustomTaxRate] = useState("");
  const [taxMode, setTaxMode] = useState("exclude");

  function convertToOunces(size: number, unit: string) {
    if (unit === "ml") return size / 29.5735;
    if (unit === "l") return (size * 1000) / 29.5735;
    if (unit === "oz") return size;
    return 0;
  }

  function roundToIncrement(value: number, increment: number) {
    if (increment <= 0) return value.toFixed(2);

    return (
      Math.round(value / increment) * increment
    ).toFixed(2);
  }

  const bottleOunces =
    bottleSize === "custom"
      ? convertToOunces(
          Number(customBottleSize || 0),
          customBottleUnit
        )
      : convertToOunces(Number(bottleSize), "ml");

  const selectedPourSize =
    pourSize === "custom"
      ? Number(customPourSize || 0)
      : Number(pourSize);

  const selectedMixerCost =
    mixerCost === "custom"
      ? Number(customMixerCost || 0)
      : Number(mixerCost);

  const selectedTaxRate =
    taxRate === "custom"
      ? Number(customTaxRate || 0)
      : Number(taxRate);

  const costPerOunce =
    Number(bottleCost || 0) > 0 && bottleOunces > 0
      ? Number(bottleCost) / bottleOunces
      : 0;

  const liquorCost = costPerOunce * selectedPourSize;

  const totalDrinkCost =
    liquorCost + selectedMixerCost;

  let calculatedPrice = Number(manualPrice || 0);

  if (pricingMode === "markup") {
    calculatedPrice =
      totalDrinkCost *
      (1 + Number(markupPercent || 0) / 100);
  }

  if (pricingMode === "target") {
    calculatedPrice =
      Number(targetCostPercent || 0) > 0
        ? totalDrinkCost /
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

  const finalDrinkPrice = applyTax(menuPrice);

  const profit =
    menuPrice - totalDrinkCost;

  const profitMargin =
    menuPrice > 0
      ? (profit / menuPrice) * 100
      : 0;

  const actualCostPercent =
    menuPrice > 0
      ? (totalDrinkCost / menuPrice) * 100
      : 0;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-5">
      <h2 className="text-3xl font-bold">
        Liquor Calculator
      </h2>

      <input
        className="w-full border rounded-lg p-3"
        placeholder="Bottle Cost ($)"
        value={bottleCost}
        onChange={(e) =>
          setBottleCost(e.target.value)
        }
      />

      <div className="space-y-2">
        <p className="font-semibold">
          Bottle Size
        </p>

        <div className="flex flex-wrap gap-4">
          {[
            ["750", "750mL"],
            ["1000", "1L"],
            ["1750", "1.75L"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="bottleSize"
                value={value}
                checked={bottleSize === value}
                onChange={(e) =>
                  setBottleSize(e.target.value)
                }
              />
              {label}
            </label>
          ))}
        </div>

        {bottleSize === "custom" ? (
          <div className="grid grid-cols-2 gap-3">
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Custom bottle size"
              value={customBottleSize}
              onChange={(e) =>
                setCustomBottleSize(e.target.value)
              }
            />

            <select
              className="w-full border rounded-lg p-3"
              value={customBottleUnit}
              onChange={(e) =>
                setCustomBottleUnit(e.target.value)
              }
            >
              <option value="ml">mL</option>
              <option value="l">Liters</option>
              <option value="oz">Ounces</option>
            </select>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="font-semibold">
          Pour Size
        </p>

        <div className="flex flex-wrap gap-4">
          {[
            ["0.5", "0.5 oz"],
            ["1", "1 oz"],
            ["1.5", "1.5 oz"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="pourSize"
                value={value}
                checked={pourSize === value}
                onChange={(e) =>
                  setPourSize(e.target.value)
                }
              />
              {label}
            </label>
          ))}
        </div>

        {pourSize === "custom" ? (
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Custom pour size in ounces"
            value={customPourSize}
            onChange={(e) =>
              setCustomPourSize(e.target.value)
            }
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="font-semibold">
          Mixer / Add-On Cost
        </p>

        <div className="flex flex-wrap gap-4">
          {[
            ["0", "No Mixer"],
            ["0.25", "$0.25"],
            ["0.50", "$0.50"],
            ["1.00", "$1.00"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="mixerCost"
                value={value}
                checked={mixerCost === value}
                onChange={(e) =>
                  setMixerCost(e.target.value)
                }
              />
              {label}
            </label>
          ))}
        </div>

        {mixerCost === "custom" ? (
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Custom mixer/add-on cost"
            value={customMixerCost}
            onChange={(e) =>
              setCustomMixerCost(e.target.value)
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
            ["target", "Target Cost %"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="pricingMode"
                value={value}
                checked={pricingMode === value}
                onChange={(e) =>
                  setPricingMode(e.target.value)
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
              "200",
              "300",
              "400",
              "custom",
            ].map((value) => (
              <label
                key={value}
                className="flex items-center gap-2"
              >
                <input
                  type="radio"
                  name="markupPercent"
                  value={value}
                  checked={
                    value === "custom"
                      ? ![
                          "200",
                          "300",
                          "400",
                        ].includes(markupPercent)
                      : markupPercent === value
                  }
                  onChange={() =>
                    value === "custom"
                      ? setMarkupPercent("")
                      : setMarkupPercent(value)
                  }
                />
                {value === "custom"
                  ? "Custom"
                  : `${value}%`}
              </label>
            ))}
          </div>

          {![
            "200",
            "300",
            "400",
          ].includes(markupPercent) ? (
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Custom markup %, example: 250"
              value={markupPercent}
              onChange={(e) =>
                setMarkupPercent(e.target.value)
              }
            />
          ) : null}
        </div>
      ) : null}

      {pricingMode === "target" ? (
        <div className="space-y-2">
          <p className="font-semibold">
            Target Cost Percentage
          </p>

          <div className="flex flex-wrap gap-4">
            {[
              "18",
              "20",
              "25",
              "30",
              "custom",
            ].map((value) => (
              <label
                key={value}
                className="flex items-center gap-2"
              >
                <input
                  type="radio"
                  name="targetCostPercent"
                  value={value}
                  checked={
                    value === "custom"
                      ? ![
                          "18",
                          "20",
                          "25",
                          "30",
                        ].includes(targetCostPercent)
                      : targetCostPercent === value
                  }
                  onChange={() =>
                    value === "custom"
                      ? setTargetCostPercent("")
                      : setTargetCostPercent(value)
                  }
                />
                {value === "custom"
                  ? "Custom"
                  : `${value}%`}
              </label>
            ))}
          </div>

          {![
            "18",
            "20",
            "25",
            "30",
          ].includes(targetCostPercent) ? (
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Custom target cost %, example: 22"
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
                name="rounding"
                value={value}
                checked={rounding === value}
                onChange={(e) =>
                  setRounding(e.target.value)
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
                name="liquorTaxRate"
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
                      ].includes(taxRate)
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
              setCustomTaxRate(e.target.value)
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
                name="liquorTaxMode"
                value="include"
                checked={taxMode === "include"}
                onChange={(e) =>
                  setTaxMode(e.target.value)
                }
              />

              Include Tax In Menu Price
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="liquorTaxMode"
                value="exclude"
                checked={taxMode === "exclude"}
                onChange={(e) =>
                  setTaxMode(e.target.value)
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
            ${finalDrinkPrice}
          </p>
        </div>

        <p>
          <strong>Total Drink Cost:</strong>{" "}
          ${totalDrinkCost.toFixed(2)}
        </p>

        <p>
          <strong>Bottle Size Converted:</strong>{" "}
          {bottleOunces.toFixed(2)} oz
        </p>

        <p>
          <strong>Pour Size:</strong>{" "}
          {selectedPourSize.toFixed(2)} oz
        </p>

        <p>
          <strong>Cost Per Ounce:</strong>{" "}
          ${costPerOunce.toFixed(2)}
        </p>

        <p>
          <strong>Liquor Cost:</strong>{" "}
          ${liquorCost.toFixed(2)}
        </p>

        <p>
          <strong>Mixer/Add-On Cost:</strong>{" "}
          ${selectedMixerCost.toFixed(2)}
        </p>

        <p>
          <strong>Pre-Tax Menu Price:</strong>{" "}
          ${menuPrice.toFixed(2)}
        </p>

        <p>
          <strong>Profit Per Drink:</strong>{" "}
          ${profit.toFixed(2)}
        </p>

        <p>
          <strong>Profit Margin:</strong>{" "}
          {profitMargin.toFixed(1)}%
        </p>

        <p>
          <strong>Actual Cost Percentage:</strong>{" "}
          {actualCostPercent.toFixed(1)}%
        </p>

        <p>
          <strong>Tax Rate:</strong>{" "}
          {selectedTaxRate.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}