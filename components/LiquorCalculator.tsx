"use client";

import { useState } from "react";

export default function LiquorCalculator() {
  const [productName, setProductName] = useState("");
  const [bottleCost, setBottleCost] = useState("");

  const [bottleSize, setBottleSize] = useState("750");
  const [customBottleSize, setCustomBottleSize] = useState("");
  const [customBottleUnit, setCustomBottleUnit] = useState("ml");

  const [pourSize, setPourSize] = useState("1.5");
  const [customPourSize, setCustomPourSize] = useState("");

  const [pricingMode, setPricingMode] = useState("target");
  const [manualPrice, setManualPrice] = useState("");
  const [markupPercent, setMarkupPercent] = useState("400");
  const [targetCostPercent, setTargetCostPercent] = useState("20");

  const [rounding, setRounding] = useState("0.25");

  const [taxRate, setTaxRate] = useState("0");
  const [customTaxRate, setCustomTaxRate] = useState("");

  const referencePourSizes = [0.5, 0.75, 1, 1.25, 1.5, 2];

  function convertToOunces(size: number, unit: string) {
    if (unit === "ml") return size / 29.5735;
    if (unit === "l") return (size * 1000) / 29.5735;
    if (unit === "oz") return size;
    return 0;
  }

  function roundToIncrement(value: number, increment: number) {
    if (increment <= 0) return value.toFixed(2);
    return (Math.round(value / increment) * increment).toFixed(2);
  }

  const bottleOunces =
    bottleSize === "custom"
      ? convertToOunces(Number(customBottleSize || 0), customBottleUnit)
      : convertToOunces(Number(bottleSize), "ml");

  const selectedPourSize =
    pourSize === "custom" ? Number(customPourSize || 0) : Number(pourSize);

  const selectedTaxRate =
    taxRate === "custom" ? Number(customTaxRate || 0) : Number(taxRate);

  const costPerOunce =
    Number(bottleCost || 0) > 0 && bottleOunces > 0
      ? Number(bottleCost) / bottleOunces
      : 0;

  const costPerHalfOunce = costPerOunce * 0.5;

  function calculateDrink(pourAmount: number) {
    const drinkCost = costPerOunce * pourAmount;

    let calculatedPrice = Number(manualPrice || 0);

    if (pricingMode === "markup") {
      calculatedPrice = drinkCost * (1 + Number(markupPercent || 0) / 100);
    }

    if (pricingMode === "target") {
      calculatedPrice =
        Number(targetCostPercent || 0) > 0
          ? drinkCost / (Number(targetCostPercent) / 100)
          : 0;
    }

    const menuPrice = Number(
      roundToIncrement(calculatedPrice, Number(rounding))
    );

    const estimatedGuestTotal =
      selectedTaxRate > 0 ? menuPrice * (1 + selectedTaxRate / 100) : menuPrice;

    const profit = menuPrice - drinkCost;
    const profitMargin = menuPrice > 0 ? (profit / menuPrice) * 100 : 0;
    const actualCostPercent = menuPrice > 0 ? (drinkCost / menuPrice) * 100 : 0;

    return {
      drinkCost,
      menuPrice,
      estimatedGuestTotal,
      profit,
      profitMargin,
      actualCostPercent,
    };
  }

  const mainResult = calculateDrink(selectedPourSize);

  const estimatedPours =
    selectedPourSize > 0 && bottleOunces > 0
      ? bottleOunces / selectedPourSize
      : 0;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-5">
      <h2 className="text-3xl font-bold">Liquor Calculator</h2>

      <div className="space-y-2">
        <p className="font-semibold">Product Name</p>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Example: Tito’s Vodka"
          className="w-full border rounded-xl p-3"
        />
      </div>

      <input
        className="w-full border rounded-lg p-3"
        placeholder="Bottle Cost ($)"
        value={bottleCost}
        onChange={(e) => setBottleCost(e.target.value)}
      />

      <div className="space-y-2">
        <p className="font-semibold">Bottle Size</p>

        <div className="flex flex-wrap gap-4">
          {[
            ["750", "750mL"],
            ["1000", "1L"],
            ["1750", "1.75L"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="bottleSize"
                value={value}
                checked={bottleSize === value}
                onChange={(e) => setBottleSize(e.target.value)}
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
              onChange={(e) => setCustomBottleSize(e.target.value)}
            />

            <select
              className="w-full border rounded-lg p-3"
              value={customBottleUnit}
              onChange={(e) => setCustomBottleUnit(e.target.value)}
            >
              <option value="ml">mL</option>
              <option value="l">Liters</option>
              <option value="oz">Ounces</option>
            </select>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="font-semibold">Standard Pour Size</p>

        <div className="flex flex-wrap gap-4">
          {[
            ["0.5", "0.5 oz"],
            ["1", "1 oz"],
            ["1.25", "1.25 oz"],
            ["1.5", "1.5 oz"],
            ["2", "2 oz"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="pourSize"
                value={value}
                checked={pourSize === value}
                onChange={(e) => setPourSize(e.target.value)}
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
            onChange={(e) => setCustomPourSize(e.target.value)}
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="font-semibold">Pricing Strategy</p>
        <p className="text-sm text-gray-500">
          Choose how you want to calculate your pricing.
        </p>

        <div className="grid gap-3">
          {[
            ["target", "Target Cost %"],
            ["markup", "Markup %"],
            ["manual", "Manual Price"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex flex-col border rounded-xl p-3 cursor-pointer"
            >
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

              <span className="text-xs text-gray-500 mt-1 ml-6">
                {value === "target" &&
                  "Recommended for inventory and cost control"}
                {value === "markup" && "Simple pricing based on bottle cost"}
                {value === "manual" && "Analyze your current menu pricing"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {pricingMode === "manual" ? (
        <div className="space-y-2">
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Manual menu price ($)"
            value={manualPrice}
            onChange={(e) => setManualPrice(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Use this mode to analyze existing menu prices and profitability.
          </p>
        </div>
      ) : null}

      {pricingMode === "markup" ? (
        <div className="space-y-2">
          <p className="font-semibold">Markup Percentage</p>

          <div className="flex flex-wrap gap-4">
            {["200", "300", "400", "custom"].map((value) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="markupPercent"
                  value={value}
                  checked={
                    value === "custom"
                      ? !["200", "300", "400"].includes(markupPercent)
                      : markupPercent === value
                  }
                  onChange={() =>
                    value === "custom"
                      ? setMarkupPercent("")
                      : setMarkupPercent(value)
                  }
                />
                {value === "custom" ? "Custom" : `${value}%`}
              </label>
            ))}
          </div>

          {!["200", "300", "400"].includes(markupPercent) ? (
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Custom markup %, example: 250"
              value={markupPercent}
              onChange={(e) => setMarkupPercent(e.target.value)}
            />
          ) : null}
        </div>
      ) : null}

      {pricingMode === "target" ? (
        <div className="space-y-2">
          <p className="font-semibold">Target Cost Percentage</p>

          <div className="flex flex-wrap gap-4">
            {["18", "20", "25", "30", "custom"].map((value) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="targetCostPercent"
                  value={value}
                  checked={
                    value === "custom"
                      ? !["18", "20", "25", "30"].includes(targetCostPercent)
                      : targetCostPercent === value
                  }
                  onChange={() =>
                    value === "custom"
                      ? setTargetCostPercent("")
                      : setTargetCostPercent(value)
                  }
                />
                {value === "custom" ? "Custom" : `${value}%`}
              </label>
            ))}
          </div>

          {!["18", "20", "25", "30"].includes(targetCostPercent) ? (
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Custom target cost %, example: 22"
              value={targetCostPercent}
              onChange={(e) => setTargetCostPercent(e.target.value)}
            />
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="font-semibold">Rounding</p>

        <div className="flex flex-wrap gap-4">
          {[
            ["0.01", "Exact"],
            ["0.05", "$0.05"],
            ["0.10", "$0.10"],
            ["0.25", "$0.25"],
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

      <div className="space-y-2 border-t pt-4">
        <p className="font-semibold">Optional Tax Reference</p>
        <p className="text-xs text-gray-500">
          Menu pricing is calculated before tax. Use this only to estimate what
          the guest may pay after tax.
        </p>

        <div className="flex flex-wrap gap-4">
          {["0", "6.25", "7", "8", "8.5", "10", "custom"].map((value) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="liquorTaxRate"
                value={value}
                checked={
                  value === "custom"
                    ? !["0", "6.25", "7", "8", "8.5", "10"].includes(taxRate)
                    : taxRate === value
                }
                onChange={() =>
                  value === "custom" ? setTaxRate("") : setTaxRate(value)
                }
              />
              {value === "custom" ? "Custom" : `${value}%`}
            </label>
          ))}
        </div>

        {!["0", "6.25", "7", "8", "8.5", "10"].includes(taxRate) ? (
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Custom tax rate %"
            value={customTaxRate}
            onChange={(e) => setCustomTaxRate(e.target.value)}
          />
        ) : null}
      </div>

      <button className="w-full mt-6 bg-orange-700 hover:bg-orange-800 text-white font-bold py-3 rounded-xl">
        Save to Bar Back
      </button>

      <div className="bg-gray-100 rounded-xl p-4 space-y-3">
        <div>
          <h3 className="text-xl font-bold">Pricing Summary</h3>
          <p className="text-sm text-gray-500">
            Review your recommended pre-tax pricing and profitability.
          </p>
        </div>

        <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-green-800">
            Menu Price Before Tax
          </p>
          <p className="text-4xl font-bold text-green-900">
            ${mainResult.menuPrice.toFixed(2)}
          </p>
        </div>

        <p>
          <strong>Standard Pour Size:</strong> {selectedPourSize.toFixed(2)} oz
        </p>

        <p>
          <strong>Drink Cost:</strong> ${mainResult.drinkCost.toFixed(2)}
        </p>

        <p>
          <strong>Cost Per Ounce:</strong> ${costPerOunce.toFixed(2)}
        </p>

        <p>
          <strong>Cost Per Half Ounce:</strong> ${costPerHalfOunce.toFixed(2)}
        </p>

        <p>
          <strong>Estimated Pours Per Bottle:</strong>{" "}
          {estimatedPours.toFixed(1)}
        </p>

        <p>
          <strong>Profit Per Drink:</strong> ${mainResult.profit.toFixed(2)}
        </p>

        <p>
          <strong>Profit Margin:</strong> {mainResult.profitMargin.toFixed(1)}%
        </p>

        <p>
          <strong>Actual Cost Percentage:</strong>{" "}
          {mainResult.actualCostPercent.toFixed(1)}%
        </p>

        {mainResult.actualCostPercent > 30 ? (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded-xl p-3 text-sm font-semibold">
            Warning: This drink may have a low profit margin.
          </div>
        ) : null}

        {selectedTaxRate > 0 ? (
          <p>
            <strong>Estimated Guest Total After Tax:</strong> $
            {mainResult.estimatedGuestTotal.toFixed(2)}
          </p>
        ) : null}
      </div>

      <div className="bg-gray-100 rounded-xl p-4 space-y-3">
        <div>
          <h3 className="text-xl font-bold">Pour Size Reference</h3>
          <p className="text-sm text-gray-600">
            Use this for shots, mixed drinks, and recipes without changing the
            main calculator.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Pour Size</th>
                <th className="text-left py-2">Drink Cost</th>
                <th className="text-left py-2">Menu Price</th>
                <th className="text-left py-2">Profit</th>
              </tr>
            </thead>

            <tbody>
              {referencePourSizes.map((size) => {
                const result = calculateDrink(size);

                return (
                  <tr key={size} className="border-b last:border-b-0">
                    <td className="py-2 font-semibold">{size} oz</td>
                    <td className="py-2">${result.drinkCost.toFixed(2)}</td>
                    <td className="py-2">${result.menuPrice.toFixed(2)}</td>
                    <td className="py-2">${result.profit.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 pt-2">
          Pricing estimates are based on bottle cost, pour size, and selected
          pricing strategy. Menu prices are shown before tax.
        </p>
      </div>
    </div>
  );
}