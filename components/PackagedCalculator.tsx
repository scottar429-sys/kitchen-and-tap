"use client";

import { useState } from "react";

export default function PackagedCalculator() {
  const [productName, setProductName] = useState("");
  const [packCost, setPackCost] = useState("");

  const [packSize, setPackSize] = useState("24");
  const [customPackSize, setCustomPackSize] = useState("");

  const [pricingMode, setPricingMode] = useState("target");
  const [manualPrice, setManualPrice] = useState("");
  const [markupPercent, setMarkupPercent] = useState("200");
  const [targetCostPercent, setTargetCostPercent] = useState("25");

  const [rounding, setRounding] = useState("0.25");

  function roundToIncrement(value: number, increment: number) {
    if (increment <= 0) return value.toFixed(2);
    return (Math.round(value / increment) * increment).toFixed(2);
  }

  const selectedPackSize =
    packSize === "custom" ? Number(customPackSize || 0) : Number(packSize);

  const costPerItem =
    Number(packCost || 0) > 0 && selectedPackSize > 0
      ? Number(packCost) / selectedPackSize
      : 0;

  let calculatedPrice = Number(manualPrice || 0);

  if (pricingMode === "markup") {
    calculatedPrice = costPerItem * (1 + Number(markupPercent || 0) / 100);
  }

  if (pricingMode === "target") {
    calculatedPrice =
      Number(targetCostPercent || 0) > 0
        ? costPerItem / (Number(targetCostPercent) / 100)
        : 0;
  }

  const menuPrice = Number(roundToIncrement(calculatedPrice, Number(rounding)));

  const profit = menuPrice - costPerItem;

  const profitMargin = menuPrice > 0 ? (profit / menuPrice) * 100 : 0;

  const actualCostPercent =
    menuPrice > 0 ? (costPerItem / menuPrice) * 100 : 0;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-5">
      <h2 className="text-3xl font-bold">Bottles / Cans Calculator</h2>

      <div className="space-y-2">
        <p className="font-semibold">Product Name</p>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Example: Bud Light Bottle"
          className="w-full border rounded-xl p-3"
        />
      </div>

      <input
        className="w-full border rounded-lg p-3"
        placeholder="Pack / Case Cost ($)"
        value={packCost}
        onChange={(e) => setPackCost(e.target.value)}
      />

      <div className="space-y-2">
        <p className="font-semibold">Pack Size</p>

        <div className="flex flex-wrap gap-4">
          {[
            ["6", "6 Pack"],
            ["12", "12 Pack"],
            ["24", "24 Pack"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="packSize"
                value={value}
                checked={packSize === value}
                onChange={(e) => setPackSize(e.target.value)}
              />
              {label}
            </label>
          ))}
        </div>

        {packSize === "custom" ? (
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Custom pack size"
            value={customPackSize}
            onChange={(e) => setCustomPackSize(e.target.value)}
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
                  name="packagedPricingMode"
                  value={value}
                  checked={pricingMode === value}
                  onChange={(e) => setPricingMode(e.target.value)}
                />

                <span className="font-semibold">{label}</span>
              </div>

              <span className="text-xs text-gray-500 mt-1 ml-6">
                {value === "target" &&
                  "Recommended for inventory and cost control"}
                {value === "markup" && "Simple pricing based on pack cost"}
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
            {["150", "200", "250", "custom"].map((value) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="packagedMarkupPercent"
                  value={value}
                  checked={
                    value === "custom"
                      ? !["150", "200", "250"].includes(markupPercent)
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

          {!["150", "200", "250"].includes(markupPercent) ? (
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Custom markup %, example: 225"
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
            {["20", "22", "25", "30", "custom"].map((value) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="packagedTargetCostPercent"
                  value={value}
                  checked={
                    value === "custom"
                      ? !["20", "22", "25", "30"].includes(targetCostPercent)
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

          {!["20", "22", "25", "30"].includes(targetCostPercent) ? (
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Custom target cost %, example: 24"
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
                name="packagedRounding"
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
        <div>
          <h3 className="text-xl font-bold">Pricing Summary</h3>
          <p className="text-sm text-gray-500">
            Review your recommended menu pricing and profitability.
          </p>
        </div>

        <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-green-800">
            Recommended Menu Price
          </p>

          <p className="text-4xl font-bold text-green-900">
            ${menuPrice.toFixed(2)}
          </p>
        </div>

        {productName ? (
          <p>
            <strong>Product:</strong> {productName}
          </p>
        ) : null}

        <p>
          <strong>Cost Per Can/Bottle:</strong> ${costPerItem.toFixed(2)}
        </p>

        <p>
          <strong>Pack Size:</strong> {selectedPackSize.toFixed(0)}
        </p>

        <p>
          <strong>Pack Cost:</strong> ${Number(packCost || 0).toFixed(2)}
        </p>

        <p>
          <strong>Profit Per Can/Bottle:</strong> ${profit.toFixed(2)}
        </p>

        <p>
          <strong>Profit Margin:</strong> {profitMargin.toFixed(1)}%
        </p>

        <p>
          <strong>Actual Cost Percentage:</strong>{" "}
          {actualCostPercent.toFixed(1)}%
        </p>

        {actualCostPercent > 30 ? (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded-xl p-3 text-sm font-semibold">
            Warning: This item may have a low profit margin.
          </div>
        ) : null}
      </div>
    </div>
  );
}