"use client";

import { useState } from "react";
import Image from "next/image";

import LiquorCalculator from "../components/LiquorCalculator";
import KegCalculator from "../components/KegCalculator";
import WineCalculator from "../components/WineCalculator";
import PackagedCalculator from "../components/PackagedCalculator";
import FoodCalculator from "../components/FoodCalculator";

export default function Home() {
  const [calculatorType, setCalculatorType] = useState("liquor");

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="Kitchen and Tap Logo"
            width={300}
            height={300}
            priority
            className="rounded-2xl"
          />
        </div>

        <p className="text-gray-600 text-lg">
          Costing and profitability tools for bars, restaurants, and clubs.
        </p>
      </div>

      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-4 mb-6">
        <p className="font-semibold mb-3">Calculator Type</p>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="calculatorType"
              value="liquor"
              checked={calculatorType === "liquor"}
              onChange={(e) => setCalculatorType(e.target.value)}
            />
            Liquor
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="calculatorType"
              value="keg"
              checked={calculatorType === "keg"}
              onChange={(e) => setCalculatorType(e.target.value)}
            />
            Beer / Kegs
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="calculatorType"
              value="wine"
              checked={calculatorType === "wine"}
              onChange={(e) => setCalculatorType(e.target.value)}
            />
            Wine
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="calculatorType"
              value="packaged"
              checked={calculatorType === "packaged"}
              onChange={(e) => setCalculatorType(e.target.value)}
            />
            Cans / Bottles
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="calculatorType"
              value="food"
              checked={calculatorType === "food"}
              onChange={(e) => setCalculatorType(e.target.value)}
            />
            Food
          </label>
        </div>
      </div>

      {calculatorType === "liquor" ? <LiquorCalculator /> : null}
      {calculatorType === "keg" ? <KegCalculator /> : null}
      {calculatorType === "wine" ? <WineCalculator /> : null}
      {calculatorType === "packaged" ? <PackagedCalculator /> : null}
      {calculatorType === "food" ? <FoodCalculator /> : null}
    </main>
  );
}