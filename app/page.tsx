"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

import LoginBox from "@/components/LoginBox";
import LiquorCalculator from "../components/LiquorCalculator";
import DraftAlcoholCalculator from "../components/DraftAlcoholCalculator";
import WineCalculator from "../components/WineCalculator";
import PackagedCalculator from "../components/PackagedCalculator";
import FoodCalculator from "../components/FoodCalculator";
import BarBack from "@/components/BarBack";
import Pantry from "@/components/Pantry";
import Vendors from "@/components/Vendors";
import Dashboard from "@/components/Dashboard";
import Pricing from "@/components/Pricing";
import BackOfHouse from "@/components/BackOfHouse";
import { supabase } from "@/lib/supabaseClient";

type ActivePage =
  | "home"
  | "about"
  | "pricing"
  | "calculators"
  | "dashboard"
  | "barback"
  | "pantry"
  | "vendors"
  | "backofhouse"
  | "disclaimers"
  | "login";

type SubscriptionPlan = "free" | "barback" | "pantry" | "combined" | "admin";

type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "inactive";

type AccountAccess = {
  accountId: string | null;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
};

const defaultAccountAccess: AccountAccess = {
  accountId: null,
  subscriptionPlan: "free",
  subscriptionStatus: "inactive",
};

const privatePages: ActivePage[] = [
  "dashboard",
  "barback",
  "pantry",
  "vendors",
  "backofhouse",
];

export default function Home() {
  const [activePage, setActivePage] = useState<ActivePage>("home");
  const [calculatorType, setCalculatorType] = useState("liquor");
  const [user, setUser] = useState<User | null>(null);
  const [accountAccess, setAccountAccess] =
    useState<AccountAccess>(defaultAccountAccess);
  const [loadingAccount, setLoadingAccount] = useState(true);

  const isLoggedIn = !!user;

  const hasActiveSubscription =
    accountAccess.subscriptionStatus === "active" ||
    accountAccess.subscriptionStatus === "trialing";

  const isAdmin = accountAccess.subscriptionPlan === "admin";

  const hasDashboardAccess = isLoggedIn && hasActiveSubscription;

  const hasBarBackAccess =
    isLoggedIn &&
    hasActiveSubscription &&
    (isAdmin ||
      accountAccess.subscriptionPlan === "barback" ||
      accountAccess.subscriptionPlan === "combined");

  const hasPantryAccess =
    isLoggedIn &&
    hasActiveSubscription &&
    (isAdmin ||
      accountAccess.subscriptionPlan === "pantry" ||
      accountAccess.subscriptionPlan === "combined");

  const hasVendorAccess =
    isLoggedIn &&
    hasActiveSubscription &&
    (isAdmin || hasBarBackAccess || hasPantryAccess);

  const hasBackOfHouseAccess = isLoggedIn;

  const showDashboard = hasDashboardAccess;
  const showVendors = hasVendorAccess;

  const canSeeCurrentPage = useMemo(() => {
    if (!privatePages.includes(activePage)) return true;
    if (activePage === "dashboard") return showDashboard;
    if (activePage === "barback") return hasBarBackAccess;
    if (activePage === "pantry") return hasPantryAccess;
    if (activePage === "vendors") return showVendors;
    if (activePage === "backofhouse") return hasBackOfHouseAccess;
    return true;
  }, [
    activePage,
    showDashboard,
    hasBarBackAccess,
    hasPantryAccess,
    showVendors,
    hasBackOfHouseAccess,
  ]);

  useEffect(() => {
    let mounted = true;

    async function loadUserAndAccount() {
      setLoadingAccount(true);

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUser(currentUser);

      if (!currentUser) {
        setAccountAccess(defaultAccountAccess);
        setLoadingAccount(false);
        return;
      }

      const { data, error } = await supabase
        .from("account_members")
        .select(
          `
          account_id,
          accounts (
            subscription_plan,
            subscription_status
          )
        `,
        )
        .eq("user_id", currentUser.id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (error || !data?.accounts) {
        setAccountAccess(defaultAccountAccess);
        setLoadingAccount(false);
        return;
      }

      const account = Array.isArray(data.accounts)
        ? data.accounts[0]
        : data.accounts;

      setAccountAccess({
        accountId: data.account_id ?? null,
        subscriptionPlan:
          (account?.subscription_plan as SubscriptionPlan | null) ?? "free",
        subscriptionStatus:
          (account?.subscription_status as SubscriptionStatus | null) ??
          "inactive",
      });

      setLoadingAccount(false);
    }

    loadUserAndAccount();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUserAndAccount();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loadingAccount && !canSeeCurrentPage) {
      setActivePage(isLoggedIn ? "dashboard" : "home");
    }
  }, [canSeeCurrentPage, isLoggedIn, loadingAccount]);

  function showCalculator(type: string) {
    if (!type) return;
    setCalculatorType(type);
    setActivePage("calculators");
  }

  function navButtonClass(page: ActivePage) {
    return `px-3 py-2 rounded-lg ${
      activePage === page
        ? "bg-orange-100 text-orange-800"
        : "hover:bg-gray-100"
    }`;
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
              <p className="text-xl font-bold leading-tight">Kitchen & Tap</p>
              <p className="text-xs text-gray-500">
                Veteran-Owned Hospitality Tools
              </p>
            </div>
          </button>

          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <button
              onClick={() => setActivePage("home")}
              className={navButtonClass("home")}
            >
              Home
            </button>

            <button
              onClick={() => setActivePage("about")}
              className={navButtonClass("about")}
            >
              About
            </button>

            {!isLoggedIn ? (
              <button
                onClick={() => setActivePage("pricing")}
                className={navButtonClass("pricing")}
              >
                Pricing
              </button>
            ) : null}

            <select
              value={activePage === "calculators" ? calculatorType : ""}
              onChange={(e) => showCalculator(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-white"
            >
              <option value="">Select Calculator</option>
              <option value="liquor">Liquor Calculator</option>
              <option value="draft">Draft Alcohol Calculator</option>
              <option value="wine">Wine Calculator</option>
              <option value="packaged">Cans / Bottles Calculator</option>
              <option value="food">Food Calculator</option>
            </select>

            {showDashboard ? (
              <button
                onClick={() => setActivePage("dashboard")}
                className={navButtonClass("dashboard")}
              >
                Dashboard
              </button>
            ) : null}

            {hasBarBackAccess ? (
              <button
                onClick={() => setActivePage("barback")}
                className={navButtonClass("barback")}
              >
                Bar Back
              </button>
            ) : null}

            {hasPantryAccess ? (
              <button
                onClick={() => setActivePage("pantry")}
                className={navButtonClass("pantry")}
              >
                Pantry
              </button>
            ) : null}

            {showVendors ? (
              <button
                onClick={() => setActivePage("vendors")}
                className={navButtonClass("vendors")}
              >
                Vendors
              </button>
            ) : null}

            {hasBackOfHouseAccess ? (
              <button
                onClick={() => setActivePage("backofhouse")}
                className={navButtonClass("backofhouse")}
              >
                Back of House
              </button>
            ) : null}

            <button
              onClick={() => setActivePage("disclaimers")}
              className={navButtonClass("disclaimers")}
            >
              Disclaimers
            </button>

            <button
              onClick={() => setActivePage("login")}
              className={`px-4 py-2 rounded-lg ${
                activePage === "login"
                  ? "bg-orange-800 text-white"
                  : "bg-orange-700 text-white hover:bg-orange-800"
              }`}
            >
              {isLoggedIn ? "Account" : "Login"}
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
                beverage margins, waste, and profitability without complicated
                enterprise software.
              </p>

              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                <button
                  onClick={() => showCalculator("liquor")}
                  className="px-5 py-3 rounded-xl bg-orange-700 text-white font-semibold hover:bg-orange-800"
                >
                  Try the Calculators
                </button>

                {isLoggedIn ? (
                  <button
                    onClick={() => setActivePage("dashboard")}
                    className="px-5 py-3 rounded-xl bg-white border font-semibold hover:bg-gray-50"
                  >
                    View Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => setActivePage("pricing")}
                    className="px-5 py-3 rounded-xl bg-white border font-semibold hover:bg-gray-50"
                  >
                    View Pricing
                  </button>
                )}

                <button
                  onClick={() => setActivePage("about")}
                  className="px-5 py-3 rounded-xl bg-white border font-semibold hover:bg-gray-50"
                >
                  About Kitchen & Tap
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activePage === "about" ? (
        <section className="px-6 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 space-y-5">
            <h1 className="text-4xl font-bold">About Kitchen & Tap</h1>

            <p className="text-gray-700 leading-7">
              Kitchen & Tap is a veteran-owned hospitality pricing tool built
              for bars, restaurants, clubs, American Legions, VFWs, and small
              operators.
            </p>

            <p className="text-gray-700 leading-7">
              The goal is simple: help operators understand their costs, price
              menu items more confidently, and protect margins without needing
              complicated enterprise software.
            </p>

            <p className="text-gray-700 leading-7">
              The free version gives operators fast manual calculators. Pro
              versions support saved products, Pantry inventory, Bar Back tools,
              vendors, recipe costing, reporting, dashboards, and setup
              services.
            </p>
          </div>
        </section>
      ) : null}

      {activePage === "pricing" && !isLoggedIn ? (
        <section className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <Pricing />
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
          {calculatorType === "draft" ? <DraftAlcoholCalculator /> : null}
          {calculatorType === "wine" ? <WineCalculator /> : null}
          {calculatorType === "packaged" ? <PackagedCalculator /> : null}
          {calculatorType === "food" ? <FoodCalculator /> : null}
        </section>
      ) : null}

      {activePage === "dashboard" && showDashboard ? (
        <section className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <Dashboard />
          </div>
        </section>
      ) : null}

      {activePage === "barback" && hasBarBackAccess ? (
        <section className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <BarBack />
          </div>
        </section>
      ) : null}

      {activePage === "pantry" && hasPantryAccess ? (
        <section className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <Pantry />
          </div>
        </section>
      ) : null}

      {activePage === "vendors" && showVendors ? (
        <section className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <Vendors />
          </div>
        </section>
      ) : null}

      {activePage === "backofhouse" && hasBackOfHouseAccess ? (
        <section className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <BackOfHouse />
          </div>
        </section>
      ) : null}

      {activePage === "disclaimers" ? (
        <section className="px-6 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 space-y-5">
            <h1 className="text-4xl font-bold">Disclaimers</h1>

            <p className="text-gray-700 leading-7">
              Kitchen & Tap provides pricing and profitability estimates based
              on information entered by the user.
            </p>

            <p className="text-gray-700 leading-7">
              Results may vary depending on supplier pricing, taxes, waste,
              portion sizes, pour sizes, labor practices, and business
              operations.
            </p>

            <p className="text-gray-700 leading-7">
              Kitchen & Tap is not responsible for inaccurate results caused by
              incorrect or incomplete data entry. Operators should verify all
              pricing and cost information before making final business
              decisions.
            </p>
          </div>
        </section>
      ) : null}

      {activePage === "login" ? (
        <section className="px-6 py-12">
          <div className="max-w-md mx-auto">
            <LoginBox />
          </div>

          {isLoggedIn ? (
            <div className="max-w-md mx-auto mt-4 bg-white rounded-2xl shadow p-5 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Current access</p>
              <p className="mt-2">
                Plan:{" "}
                <span className="font-semibold capitalize">
                  {accountAccess.subscriptionPlan}
                </span>
              </p>
              <p>
                Status:{" "}
                <span className="font-semibold capitalize">
                  {accountAccess.subscriptionStatus.replace("_", " ")}
                </span>
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      <footer className="px-6 py-10 bg-white border-t mt-10">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3 text-sm text-gray-700">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Our Mission</h3>
            <p className="mt-2 leading-6">
              Kitchen & Tap exists to help bars, restaurants, clubs, and small
              hospitality operators price smarter, understand their costs, and
              protect their margins with simple, practical tools.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg text-gray-900">Beta Notes</h3>
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
              Coming features include saved items, Bar Back tools, Pantry
              inventory, vendor management, order sheets, recipe costing,
              reports, dashboards, and paid Pro features for operators who want
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