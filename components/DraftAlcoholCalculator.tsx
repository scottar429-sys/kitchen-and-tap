"use client";

import { useState } from "react";

export default function DraftAlcoholCalculator() {
  const [productName, setProductName] = useState("");
  const [productCost, setProductCost] = useState("");

  const [containerSize, setContainerSize] = useState("1984");
  const [customContainerSize, setCustomContainerSize] = useState("");
  const [customContainerUnit, setCustomContainerUnit] = useState("oz");

  const [servingSize, setServingSize] = useState("16");
  const [customServingSize, setCustomServingSize] = useState("");

  const [pricingMode, setPricingMode] = useState("target");
  const [manualPrice, setManualPrice] = useState("");
  const [markupPercent, setMarkupPercent] = useState("300");
  const [targetCostPercent, setTargetCostPercent] = useState("25");

  const [rounding, setRounding] = useState("0.25");
  const [discountMode, setDiscountMode] = useState("standard");

  const [customDiscounts, setCustomDiscounts] = useState({
    largePour: "5",
    crowler: "10",
    pitcher: "15",
    growler: "20",
  });

  const referenceServings = [
    { key: "taster", label: "5 oz Taster", ounces: 5, discount: 0 },
    { key: "small", label: "8 oz Small Pour", ounces: 8, discount: 0 },
    { key: "twelve", label: "12 oz Pour", ounces: 12, discount: 0 },
    { key: "pint", label: "16 oz Pint", ounces: 16, discount: 0 },
    { key: "largePour", label: "20 oz Large Pour", ounces: 20, discount: 5 },
    { key: "crowler", label: "32 oz Crowler", ounces: 32, discount: 10 },
    { key: "pitcher", label: "60 oz Pitcher", ounces: 60, discount: 15 },
    { key: "growler", label: "64 oz Growler", ounces: 64, discount: 20 },
  ];

  function convertToOunces(size: number, unit: string) {
    if (unit === "oz") return size;
    if (unit === "gal") return size * 128;
    if (unit === "l") return size * 33.814;
    return 0;
  }

  function roundToIncrement(value: number, increment: number) {
    if (increment <= 0) return value.toFixed(2);
    return (Math.round(value / increment) * increment).toFixed(2);
  }

  function getDiscount(item: any) {
    if (discountMode === "none") return 0;

    if (discountMode === "standard") {
      return item.discount;
    }

    if (discountMode === "custom") {
      if (item.key === "largePour") {
        return Number(customDiscounts.largePour || 0);
      }

      if (item.key === "crowler") {
        return Number(customDiscounts.crowler || 0);
      }

      if (item.key === "pitcher") {
        return Number(customDiscounts.pitcher || 0);
      }

      if (item.key === "growler") {
        return Number(customDiscounts.growler || 0);
      }
    }

    return 0;
  }

  const totalOunces =
    containerSize === "custom"
      ? convertToOunces(Number(customContainerSize || 0), customContainerUnit)
      : Number(containerSize);

  const selectedServingSize =
    servingSize === "custom"
      ? Number(customServingSize || 0)
      : Number(servingSize);

  const costPerOunce =
    Number(productCost || 0) > 0 && totalOunces > 0
      ? Number(productCost) / totalOunces
      : 0;

  function calculateServing(ounces: number, discountPercent = 0) {
    const servingCost = costPerOunce * ounces;

    let calculatedPrice = Number(manualPrice || 0);

    if (pricingMode === "markup") {
      calculatedPrice = servingCost * (1 + Number(markupPercent || 0) / 100);
    }

    if (pricingMode === "target") {
      calculatedPrice =
        Number(targetCostPercent || 0) > 0
          ? servingCost / (Number(targetCostPercent) / 100)
          : 0;
    }

    if (pricingMode === "manual" && selectedServingSize > 0) {
      calculatedPrice =
        Number(manualPrice || 0) * (ounces / selectedServingSize);
    }

    const discountedPrice =
      calculatedPrice * (1 - Number(discountPercent || 0) / 100);

    const menuPrice = Number(
      roundToIncrement(discountedPrice, Number(rounding))
    );

    const profit = menuPrice - servingCost;
    const profitMargin = menuPrice > 0 ? (profit / menuPrice) * 100 : 0;
    const actualCostPercent =
      menuPrice > 0 ? (servingCost / menuPrice) * 100 : 0;

    return {
      servingCost,
      menuPrice,
      profit,
      profitMargin,
      actualCostPercent,
    };
  }

  const mainResult = calculateServing(selectedServingSize);

  const estimatedServings =
    selectedServingSize > 0 && totalOunces > 0
      ? totalOunces / selectedServingSize
      : 0;

  const estimatedRevenue = mainResult.menuPrice * estimatedServings;
  const estimatedProfit = estimatedRevenue - Number(productCost || 0);

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-5">
      <h2 className="text-3xl font-bold">Draft Alcohol Calculator</h2>

      <div className="space-y-2">
        <p className="font-semibold">Product Name</p>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Example: Local IPA, Cider, Sangria, Wine on Tap"
          className="w-full border rounded-xl p-3"
        />
      </div>

      <input
        className="w-full border rounded-lg p-3"
        placeholder="Keg / Batch Cost ($)"
        value={productCost}
        onChange={(e) => setProductCost(e.target.value)}
      />

      <div className="space-y-2">
        <p className="font-semibold">Keg / Batch Size</p>

        <div className="flex flex-wrap gap-4">
          {[
            ["1984", "1/2 Barrel"],
            ["992", "1/4 Barrel"],
            ["661", "1/6 Barrel"],
            ["640", "5 Gallon Corny"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="containerSize"
                value={value}
                checked={containerSize === value}
                onChange={(e) => setContainerSize(e.target.value)}
              />
              {label}
            </label>
          ))}
        </div>

        {containerSize === "custom" ? (
          <div className="grid grid-cols-2 gap-3">
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Custom size"
              value={customContainerSize}
              onChange={(e) => setCustomContainerSize(e.target.value)}
            />

            <select
              className="w-full border rounded-lg p-3"
              value={customContainerUnit}
              onChange={(e) => setCustomContainerUnit(e.target.value)}
            >
              <option value="oz">Ounces</option>
              <option value="gal">Gallons</option>
              <option value="l">Liters</option>
            </select>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="font-semibold">Standard Serving Size</p>

        <div className="flex flex-wrap gap-4">
          {[
            ["5", "5 oz"],
            ["8", "8 oz"],
            ["12", "12 oz"],
            ["16", "16 oz"],
            ["20", "20 oz"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="servingSize"
                value={value}
                checked={servingSize === value}
                onChange={(e) => setServingSize(e.target.value)}
              />
              {label}
            </label>
          ))}
        </div>

        {servingSize === "custom" ? (
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Custom serving size in ounces"
            value={customServingSize}
            onChange={(e) => setCustomServingSize(e.target.value)}
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="font-semibold">Pricing Strategy</p>

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
                  "Recommended for draft pricing and margin control"}
                {value === "markup" && "Simple pricing based on product cost"}
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
        <p className="font-semibold">Volume Discount Pricing</p>

        <div className="grid gap-3">
          {[
            ["none", "No Discounts"],
            ["standard", "Standard Discounts"],
            ["custom", "Custom Discounts"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 border rounded-xl p-3 cursor-pointer"
            >
              <input
                type="radio"
                name="discountMode"
                value={value}
                checked={discountMode === value}
                onChange={(e) => setDiscountMode(e.target.value)}
              />

              <span className="font-semibold">{label}</span>
            </label>
          ))}
        </div>

        {discountMode === "standard" ? (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-gray-700">
            <p className="font-semibold mb-1">Standard discount schedule:</p>
            <p>20 oz Large Pour: 5%</p>
            <p>32 oz Crowler: 10%</p>
            <p>60 oz Pitcher: 15%</p>
            <p>64 oz Growler: 20%</p>
          </div>
        ) : null}

        {discountMode === "custom" ? (
          <div className="grid gap-3">
            <input
              className="w-full border rounded-lg p-3"
              placeholder="20 oz Large Pour discount %, example: 5"
              value={customDiscounts.largePour}
              onChange={(e) =>
                setCustomDiscounts({
                  ...customDiscounts,
                  largePour: e.target.value,
                })
              }
            />

            <input
              className="w-full border rounded-lg p-3"
              placeholder="32 oz Crowler discount %, example: 10"
              value={customDiscounts.crowler}
              onChange={(e) =>
                setCustomDiscounts({
                  ...customDiscounts,
                  crowler: e.target.value,
                })
              }
            />

            <input
              className="w-full border rounded-lg p-3"
              placeholder="60 oz Pitcher discount %, example: 15"
              value={customDiscounts.pitcher}
              onChange={(e) =>
                setCustomDiscounts({
                  ...customDiscounts,
                  pitcher: e.target.value,
                })
              }
            />

            <input
              className="w-full border rounded-lg p-3"
              placeholder="64 oz Growler discount %, example: 20"
              value={customDiscounts.growler}
              onChange={(e) =>
                setCustomDiscounts({
                  ...customDiscounts,
                  growler: e.target.value,
                })
              }
            />
          </div>
        ) : null}

        <p className="text-xs text-gray-500">
          Discounts apply to the calculated menu price, not the product cost.
        </p>
      </div>

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

      <button className="w-full mt-6 bg-orange-700 hover:bg-orange-800 text-white font-bold py-3 rounded-xl">
        Save to Bar Back
      </button>

      <div className="bg-gray-100 rounded-xl p-4 space-y-3">
        <h3 className="text-xl font-bold">Pricing Summary</h3>

        <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-green-800">
            Recommended Menu Price
          </p>

          <p className="text-4xl font-bold text-green-900">
            ${mainResult.menuPrice.toFixed(2)}
          </p>
        </div>

        <p>
          <strong>Serving Size:</strong> {selectedServingSize.toFixed(2)} oz
        </p>

        <p>
          <strong>Serving Cost:</strong> ${mainResult.servingCost.toFixed(2)}
        </p>

        <p>
          <strong>Cost Per Ounce:</strong> ${costPerOunce.toFixed(2)}
        </p>

        <p>
          <strong>Estimated Servings:</strong> {estimatedServings.toFixed(1)}
        </p>

        <p>
          <strong>Profit Per Serving:</strong> ${mainResult.profit.toFixed(2)}
        </p>

        <p>
          <strong>Profit Margin:</strong> {mainResult.profitMargin.toFixed(1)}%
        </p>

        <p>
          <strong>Actual Cost Percentage:</strong>{" "}
          {mainResult.actualCostPercent.toFixed(1)}%
        </p>

        <p>
          <strong>Estimated Revenue:</strong> ${estimatedRevenue.toFixed(2)}
        </p>

        <p>
          <strong>Estimated Profit:</strong> ${estimatedProfit.toFixed(2)}
        </p>

        {mainResult.actualCostPercent > 35 ? (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded-xl p-3 text-sm font-semibold">
            Warning: This draft price may be too low for your target margin.
          </div>
        ) : null}
      </div>

      <div className="bg-gray-100 rounded-xl p-4 space-y-3">
        <h3 className="text-xl font-bold">Draft Serving Reference</h3>

        <p className="text-sm text-gray-600">
          Larger pours, pitchers, crowlers, and growlers can use automatic or
          custom value pricing.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Serving</th>
                <th className="text-left py-2">Discount</th>
                <th className="text-left py-2">Cost</th>
                <th className="text-left py-2">Price</th>
                <th className="text-left py-2">Profit</th>
                <th className="text-left py-2">Cost %</th>
              </tr>
            </thead>

            <tbody>
              {referenceServings.map((item) => {
                const appliedDiscount = getDiscount(item);
                const result = calculateServing(item.ounces, appliedDiscount);

                return (
                  <tr key={item.label} className="border-b last:border-b-0">
                    <td className="py-2 font-semibold">{item.label}</td>
                    <td className="py-2">{appliedDiscount}%</td>
                    <td className="py-2">${result.servingCost.toFixed(2)}</td>
                    <td className="py-2">${result.menuPrice.toFixed(2)}</td>
                    <td className="py-2">${result.profit.toFixed(2)}</td>
                    <td className="py-2">
                      {result.actualCostPercent.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 pt-2">
          Discounts apply to the calculated menu price, not the product cost.
        </p>
      </div>
    </div>
  );
}