"use client";

import { useState } from "react";
import Image from "next/image";

import LiquorCalculator from "../components/LiquorCalculator";
import KegCalculator from "../components/KegCalculator";
import WineCalculator from "../components/WineCalculator";
import PackagedCalculator from "../components/PackagedCalculator";
import FoodCalculator from "../components/FoodCalculator";

export default function Home() {
  const [activePage, setActivePage] = useState("home");
  const [calculatorType, setCalculatorType] = useState("liquor");

  function showCalculator(type: string) {
    setCalculatorType(type);
    setActivePage("calculators");
  }

  return (
    <main className="min-h-screen bg-[#f8f3ec] text-gray-900">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => setActivePage("home")}
            className="flex items-center gap-3"
          >
            <Image
              src="/logo.png"
              alt="Kitchen and Tap Logo"
              width={52}
              height={52}
              className="rounded-xl"
            />

            <div className="text-left">
              <p className="text-xl font-bold leading-tight">
                Kitchen & Tap
              </p>
              <p className="text-xs text-gray-500">
                Veteran-Owned Hospitality Tools
              </p>
            </div>
          </button>

          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <button
              onClick={() => setActivePage("home")}
              className={`px-3 py-2 rounded-lg ${
                activePage === "home"
                  ? "bg-orange-100 text-orange-800"
                  : "hover:bg-gray-100"
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setActivePage("about")}
              className={`px-3 py-2 rounded-lg ${
                activePage === "about"
                  ? "bg-orange-100 text-orange-800"
                  : "hover:bg-gray-100"
              }`}
            >
              About
            </button>

            <select
  value={activePage === "calculators" ? calculatorType : ""}
  onChange={(e) => showCalculator(e.target.value)}
  className="px-3 py-2 rounded-lg border bg-white"
>
  <option value="">
    Select Calculator
  </option>

  <option value="liquor">
    Liquor Calculator
  </option>

  <option value="keg">
    Beer / Keg Calculator
  </option>

  <option value="wine">
    Wine Calculator
  </option>

  <option value="packaged">
    Cans / Bottles Calculator
  </option>

  <option value="food">
    Food Calculator
  </option>
</select>

            <button
              onClick={() => setActivePage("disclaimers")}
              className={`px-3 py-2 rounded-lg ${
                activePage === "disclaimers"
                  ? "bg-orange-100 text-orange-800"
                  : "hover:bg-gray-100"
              }`}
            >
              Disclaimers
            </button>

            <button
              onClick={() => setActivePage("login")}
              className="px-4 py-2 rounded-lg bg-orange-700 text-white hover:bg-orange-800"
            >
              Login
            </button>
          </nav>
        </div>
      </header>

      {activePage === "home" ? (
        <section className="px-6 py-12">
          <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[320px_1fr] items-center">
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="Kitchen and Tap Logo"
                width={300}
                height={300}
                priority
                className="rounded-3xl shadow-xl"
              />
            </div>

            <div className="text-center md:text-left">
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
                Veteran-Owned Hospitality Software
              </p>

              <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
                Price smarter.
                <br />
                Protect your margins.
              </h1>

              <p className="mt-5 text-lg text-gray-700 max-w-2xl">
                Kitchen & Tap helps bars, restaurants, clubs, and small
                hospitality operators calculate menu pricing, food costs,
                beverage margins, waste, taxes, and profitability without
                complicated enterprise software.
              </p>

              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                <button
                  onClick={() => showCalculator("liquor")}
                  className="px-5 py-3 rounded-xl bg-orange-700 text-white font-semibold hover:bg-orange-800"
                >
                  Try the Calculators
                </button>

                <button
                  onClick={() => setActivePage("about")}
                  className="px-5 py-3 rounded-xl bg-white border font-semibold hover:bg-gray-50"
                >
                  About Kitchen & Tap
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto mt-14 grid gap-5 md:grid-cols-3">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-bold">Bar Tools</h3>
              <p className="mt-3 text-gray-600">
                Liquor, draft beer, wine, and packaged beverage pricing
                tools built for real-world bar operations.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-bold">Kitchen Tools</h3>
              <p className="mt-3 text-gray-600">
                Food costing, portion pricing, recipe planning, and future
                Pantry inventory tools.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-bold">Pro Features Coming</h3>
              <p className="mt-3 text-gray-600">
                Save items, update costs, build reports, manage Bar Back,
                and track Pantry inventory.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {activePage === "about" ? (
        <section className="px-6 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 space-y-5">
            <h1 className="text-4xl font-bold">About Kitchen & Tap</h1>

            <p className="text-gray-700 leading-7">
              Kitchen & Tap is a veteran-owned hospitality pricing tool
              built for bars, restaurants, clubs, American Legions, VFWs,
              and small operators.
            </p>

            <p className="text-gray-700 leading-7">
              The goal is simple: help operators understand their costs,
              price menu items more confidently, and protect margins without
              needing complicated enterprise software.
            </p>

            <p className="text-gray-700 leading-7">
              The free version gives operators fast manual calculators.
              Future Pro versions will support saved products, Pantry
              inventory, Bar Back tools, recipe costing, reporting, and
              setup services.
            </p>
          </div>
        </section>
      ) : null}

      {activePage === "calculators" ? (
        <section className="px-6 py-8">
          <div className="max-w-3xl mx-auto mb-6 text-center">
            <h1 className="text-3xl font-bold">Calculators</h1>
            <p className="text-gray-600 mt-2">
              Choose a calculator from the dropdown above.
            </p>
          </div>

          {calculatorType === "liquor" ? <LiquorCalculator /> : null}
          {calculatorType === "keg" ? <KegCalculator /> : null}
          {calculatorType === "wine" ? <WineCalculator /> : null}
          {calculatorType === "packaged" ? <PackagedCalculator /> : null}
          {calculatorType === "food" ? <FoodCalculator /> : null}
        </section>
      ) : null}

      {activePage === "disclaimers" ? (
        <section className="px-6 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 space-y-5">
            <h1 className="text-4xl font-bold">Disclaimers</h1>

            <p className="text-gray-700 leading-7">
              Kitchen & Tap provides pricing and profitability estimates
              based on information entered by the user.
            </p>

            <p className="text-gray-700 leading-7">
              Results may vary depending on supplier pricing, taxes,
              waste, portion sizes, pour sizes, labor practices, and
              business operations.
            </p>

            <p className="text-gray-700 leading-7">
              Kitchen & Tap is not responsible for inaccurate results
              caused by incorrect or incomplete data entry. Operators
              should verify all pricing, tax, and cost information before
              making final business decisions.
            </p>
          </div>
        </section>
      ) : null}

      {activePage === "login" ? (
        <section className="px-6 py-12">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-8 space-y-5">
            <h1 className="text-3xl font-bold">Login</h1>

            <p className="text-gray-600">
              User accounts and paid Pro features are coming soon.
            </p>

            <input
              className="w-full border rounded-lg p-3"
              placeholder="Email"
              disabled
            />

            <input
              className="w-full border rounded-lg p-3"
              placeholder="Password"
              type="password"
              disabled
            />

            <button
              disabled
              className="w-full px-4 py-3 rounded-xl bg-gray-300 text-gray-600 font-semibold"
            >
              Login Coming Soon
            </button>
          </div>
        </section>
      ) : null}

      <footer className="px-6 py-10 bg-white border-t mt-10">
  <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3 text-sm text-gray-700">
    <div>
      <h3 className="font-bold text-lg text-gray-900">
        Our Mission
      </h3>
      <p className="mt-2 leading-6">
        Kitchen & Tap exists to help bars, restaurants, clubs, and small
        hospitality operators price smarter, understand their costs, and
        protect their margins with simple, practical tools.
      </p>
    </div>

    <div>
      <h3 className="font-bold text-lg text-gray-900">
        Beta Notes
      </h3>
      <p className="mt-2 leading-6">
        Kitchen & Tap is currently in beta. We are actively testing the
        calculators, improving the user experience, and gathering feedback
        from real hospitality operators.
      </p>
    </div>

    <div>
      <h3 className="font-bold text-lg text-gray-900">
        What We’re Building
      </h3>
      <p className="mt-2 leading-6">
        Coming features include saved items, Bar Back tools, Pantry inventory,
        recipe costing, reports, and paid Pro features for operators who want
        to save and manage their data.
      </p>
    </div>
  </div>

  <div className="max-w-6xl mx-auto mt-8 pt-5 border-t text-center text-xs text-gray-500">
    <p>
      Kitchen & Tap Beta • Veteran-Owned • Built for bars, restaurants,
      clubs, and small hospitality operators.
    </p>
  </div>
</footer>
    </main>
  );
}