"use client";

import { useState } from "react";

export default function KegCalculator() {
  const [kegCost, setKegCost] = useState("");
  const [kegSize, setKegSize] = useState("half");
  const [customKegOunces, setCustomKegOunces] = useState("");

  const [pourSize, setPourSize] = useState("16");
  const [customPourSize, setCustomPourSize] = useState("");

  const [wastePercent, setWastePercent] = useState("10");
  const [customWastePercent, setCustomWastePercent] = useState("");

  const [pricingMode, setPricingMode] = useState("markup");
  const [manualPrice, setManualPrice] = useState("");
  const [markupPercent, setMarkupPercent] = useState("300");
  const [targetCostPercent, setTargetCostPercent] = useState("25");

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

  function getKegOunces(size: string) {
    if (size === "sixth") return 661;
    if (size === "quarter") return 992;
    if (size === "half") return 1984;
    if (size === "custom") return Number(customKegOunces || 0);
    return 0;
  }

  const totalKegOunces = getKegOunces(kegSize);

  const selectedPourSize =
    pourSize === "custom"
      ? Number(customPourSize || 0)
      : Number(pourSize);

  const selectedWastePercent =
    wastePercent === "custom"
      ? Number(customWastePercent || 0)
      : Number(wastePercent);

  const selectedTaxRate =
    taxRate === "custom"
      ? Number(customTaxRate || 0)
      : Number(taxRate);

  const usableOunces =
    totalKegOunces *
    (1 - selectedWastePercent / 100);

  const estimatedPours =
    selectedPourSize > 0
      ? usableOunces / selectedPourSize
      : 0;

  const costPerPour =
    estimatedPours > 0
      ? Number(kegCost || 0) / estimatedPours
      : 0;

  let calculatedPrice = Number(manualPrice || 0);

  if (pricingMode === "markup") {
    calculatedPrice =
      costPerPour *
      (1 + Number(markupPercent || 0) / 100);
  }

  if (pricingMode === "target") {
    calculatedPrice =
      Number(targetCostPercent || 0) > 0
        ? costPerPour /
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

  const finalPourPrice = applyTax(menuPrice);

  const profit =
    menuPrice - costPerPour;

  const profitMargin =
    menuPrice > 0
      ? (profit / menuPrice) * 100
      : 0;

  const actualCostPercent =
    menuPrice > 0
      ? (costPerPour / menuPrice) * 100
      : 0;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-5">
      <h2 className="text-3xl font-bold">
        Beer / Keg Calculator
      </h2>

      <input
        className="w-full border rounded-lg p-3"
        placeholder="Keg Cost ($)"
        value={kegCost}
        onChange={(e) => setKegCost(e.target.value)}
      />

      <div className="space-y-2">
        <p className="font-semibold">
          Keg Size
        </p>

        <div className="flex flex-wrap gap-4">
          {[
            ["sixth", "1/6 Barrel"],
            ["quarter", "1/4 Barrel"],
            ["half", "1/2 Barrel"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="kegSize"
                value={value}
                checked={kegSize === value}
                onChange={(e) =>
                  setKegSize(e.target.value)
                }
              />
              {label}
            </label>
          ))}
        </div>

        {kegSize === "custom" ? (
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Custom keg size in ounces"
            value={customKegOunces}
            onChange={(e) =>
              setCustomKegOunces(e.target.value)
            }
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="font-semibold">
          Pour Size
        </p>

        <div className="flex flex-wrap gap-4">
          {[
            ["12", "12 oz"],
            ["16", "16 oz"],
            ["20", "20 oz"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="kegPourSize"
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
          Waste Estimate
        </p>

        <div className="flex flex-wrap gap-4">
          {[
            ["0", "No Waste"],
            ["5", "5%"],
            ["10", "10%"],
            ["15", "15%"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="wastePercent"
                value={value}
                checked={wastePercent === value}
                onChange={(e) =>
                  setWastePercent(e.target.value)
                }
              />
              {label}
            </label>
          ))}
        </div>

        {wastePercent === "custom" ? (
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Custom waste %, example: 8"
            value={customWastePercent}
            onChange={(e) =>
              setCustomWastePercent(
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
            ["target", "Target Cost %"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="kegPricingMode"
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
                  name="kegMarkupPercent"
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
                  name="kegTargetCostPercent"
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
                name="kegRounding"
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
                name="kegTaxRate"
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
                name="kegTaxMode"
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
                name="kegTaxMode"
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
            ${finalPourPrice}
          </p>
        </div>

        <p>
          <strong>Cost Per Pour:</strong>{" "}
          ${costPerPour.toFixed(2)}
        </p>

        <p>
          <strong>Total Keg Ounces:</strong>{" "}
          {totalKegOunces.toFixed(0)} oz
        </p>

        <p>
          <strong>Waste Estimate:</strong>{" "}
          {selectedWastePercent.toFixed(1)}%
        </p>

        <p>
          <strong>Usable Ounces:</strong>{" "}
          {usableOunces.toFixed(1)} oz
        </p>

        <p>
          <strong>Pour Size:</strong>{" "}
          {selectedPourSize.toFixed(1)} oz
        </p>

        <p>
          <strong>Estimated Pours:</strong>{" "}
          {estimatedPours.toFixed(1)}
        </p>

        <p>
          <strong>Pre-Tax Menu Price:</strong>{" "}
          ${menuPrice.toFixed(2)}
        </p>

        <p>
          <strong>Profit Per Pour:</strong>{" "}
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