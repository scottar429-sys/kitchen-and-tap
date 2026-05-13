"use client";

import { useState } from "react";

export default function WineCalculator() {
  const [bottleCost, setBottleCost] = useState("");
  const [bottleSize, setBottleSize] = useState("750");
  const [customBottleSize, setCustomBottleSize] = useState("");

  const [markupPercent, setMarkupPercent] = useState("300");

  const [largeGlassDiscount, setLargeGlassDiscount] = useState("10");
  const [customLargeGlassDiscount, setCustomLargeGlassDiscount] = useState("");

  const [bottleDiscount, setBottleDiscount] = useState("15");
  const [customBottleDiscount, setCustomBottleDiscount] = useState("");

  const [rounding, setRounding] = useState("0.25");

  const [taxRate, setTaxRate] = useState("8.5");
  const [customTaxRate, setCustomTaxRate] = useState("");

  const [taxMode, setTaxMode] = useState("exclude");

  function mlToOunces(ml: number) {
    return ml / 29.5735;
  }

  function roundToIncrement(value: number, increment: number) {
    if (increment <= 0) return value.toFixed(2);

    return (
      Math.round(value / increment) * increment
    ).toFixed(2);
  }

  const bottleOunces =
    bottleSize === "custom"
      ? mlToOunces(Number(customBottleSize || 0))
      : mlToOunces(Number(bottleSize));

  const selectedMarkup = Number(markupPercent || 0);

  const selectedLargeGlassDiscount =
    largeGlassDiscount === "custom"
      ? Number(customLargeGlassDiscount || 0)
      : Number(largeGlassDiscount);

  const selectedBottleDiscount =
    bottleDiscount === "custom"
      ? Number(customBottleDiscount || 0)
      : Number(bottleDiscount);

  const selectedTaxRate =
    taxRate === "custom"
      ? Number(customTaxRate || 0)
      : Number(taxRate);

  const costPerOunce =
    Number(bottleCost || 0) > 0 && bottleOunces > 0
      ? Number(bottleCost) / bottleOunces
      : 0;

  function baseGlassPrice(
    ounces: number,
    discountPercent = 0
  ) {
    const glassCost = costPerOunce * ounces;

    const markedUpPrice =
      glassCost * (1 + selectedMarkup / 100);

    const discountedPrice =
      markedUpPrice *
      (1 - discountPercent / 100);

    return Number(
      roundToIncrement(
        discountedPrice,
        Number(rounding)
      )
    );
  }

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

  const fiveOuncePrice =
    baseGlassPrice(5);

  const sixOuncePrice =
    baseGlassPrice(
      6,
      selectedLargeGlassDiscount
    );

  const nineOuncePrice =
    baseGlassPrice(
      9,
      selectedLargeGlassDiscount
    );

  const fiveOunceGlassesPerBottle =
    bottleOunces / 5;

  const bottleMenuValue =
    fiveOuncePrice *
    fiveOunceGlassesPerBottle;

  const bottlePriceBeforeRounding =
    bottleMenuValue *
    (1 - selectedBottleDiscount / 100);

  const bottlePrice = Number(
    roundToIncrement(
      bottlePriceBeforeRounding,
      Number(rounding)
    )
  );

  const finalBottlePrice =
    applyTax(bottlePrice);

  const bottleProfit =
    bottlePrice -
    Number(bottleCost || 0);

  const bottleProfitMargin =
    bottlePrice > 0
      ? (bottleProfit / bottlePrice) * 100
      : 0;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-5">

      <h2 className="text-3xl font-bold">
        Wine Calculator
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
            ["1500", "1.5L"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="wineBottleSize"
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
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Custom bottle size in mL"
            value={customBottleSize}
            onChange={(e) =>
              setCustomBottleSize(
                e.target.value
              )
            }
          />
        ) : null}
      </div>

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
                name="wineMarkup"
                value={value}
                checked={
                  value === "custom"
                    ? ![
                        "200",
                        "300",
                        "400",
                      ].includes(
                        markupPercent
                      )
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

      <div className="space-y-2">
        <p className="font-semibold">
          Large Glass Discount
        </p>

        <div className="flex flex-wrap gap-4">
          {[
            "0",
            "5",
            "10",
            "15",
            "custom",
          ].map((value) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="wineLargeDiscount"
                value={value}
                checked={
                  value === "custom"
                    ? ![
                        "0",
                        "5",
                        "10",
                        "15",
                      ].includes(
                        largeGlassDiscount
                      )
                    : largeGlassDiscount ===
                      value
                }
                onChange={() =>
                  value === "custom"
                    ? setLargeGlassDiscount("")
                    : setLargeGlassDiscount(
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
          "0",
          "5",
          "10",
          "15",
        ].includes(largeGlassDiscount) ? (
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Custom discount %"
            value={customLargeGlassDiscount}
            onChange={(e) =>
              setCustomLargeGlassDiscount(
                e.target.value
              )
            }
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="font-semibold">
          Bottle Discount
        </p>

        <div className="flex flex-wrap gap-4">
          {[
            "0",
            "10",
            "15",
            "20",
            "custom",
          ].map((value) => (
            <label
              key={value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="wineBottleDiscount"
                value={value}
                checked={
                  value === "custom"
                    ? ![
                        "0",
                        "10",
                        "15",
                        "20",
                      ].includes(
                        bottleDiscount
                      )
                    : bottleDiscount === value
                }
                onChange={() =>
                  value === "custom"
                    ? setBottleDiscount("")
                    : setBottleDiscount(value)
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
          "10",
          "15",
          "20",
        ].includes(bottleDiscount) ? (
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Custom bottle discount %"
            value={customBottleDiscount}
            onChange={(e) =>
              setCustomBottleDiscount(
                e.target.value
              )
            }
          />
        ) : null}
      </div>

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
                name="wineRounding"
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
                name="wineTaxRate"
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
                name="wineTaxMode"
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
                name="wineTaxMode"
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
            Bottle Price
          </p>

          <p className="text-4xl font-bold text-green-900">
            ${finalBottlePrice}
          </p>
        </div>

        <p>
          <strong>
            5 oz Glass Price:
          </strong>{" "}
          ${applyTax(fiveOuncePrice)}
        </p>

        <p>
          <strong>
            6 oz Glass Price:
          </strong>{" "}
          ${applyTax(sixOuncePrice)}
        </p>

        <p>
          <strong>
            9 oz Glass Price:
          </strong>{" "}
          ${applyTax(nineOuncePrice)}
        </p>

        <p>
          <strong>
            Bottle Size Converted:
          </strong>{" "}
          {bottleOunces.toFixed(2)} oz
        </p>

        <p>
          <strong>
            5 oz Glasses Per Bottle:
          </strong>{" "}
          {fiveOunceGlassesPerBottle.toFixed(
            1
          )}
        </p>

        <p>
          <strong>
            Bottle Profit:
          </strong>{" "}
          ${bottleProfit.toFixed(2)}
        </p>

        <p>
          <strong>
            Bottle Profit Margin:
          </strong>{" "}
          {bottleProfitMargin.toFixed(
            1
          )}
          %
        </p>

      </div>
    </div>
  );
}