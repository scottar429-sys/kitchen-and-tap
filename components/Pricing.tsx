"use client";

export default function Pricing() {
  const mainPlans = [
    {
      name: "Bar Pro",
      price: "$19.99",
      description: "For bars, clubs, and restaurants managing beverage pricing and bar inventory.",
      features: [
        "Bar Back Inventory",
        "Beverage Pricing",
        "Quarterly Reviews",
        "Vendor Management",
        "Order Generation",
        "Dashboard Access",
      ],
    },
    {
      name: "Kitchen Pro",
      price: "$19.99",
      description: "For kitchens managing food costs, pantry inventory, recipes, and menu margins.",
      features: [
        "Pantry Inventory",
        "Prep Station",
        "Menu Costing",
        "Recipe Management",
        "Vendor Management",
        "Dashboard Access",
      ],
    },
    {
      name: "Kitchen & Tap",
      price: "$29.99",
      description: "Best value for one location. Combines Bar Pro and Kitchen Pro.",
      features: [
        "Everything in Bar Pro",
        "Everything in Kitchen Pro",
        "One Location",
        "Full Dashboard",
        "Vendor Management",
        "Best Value",
      ],
      popular: true,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
          Kitchen & Tap Pricing
        </p>

        <h1 className="mt-2 text-4xl md:text-5xl font-extrabold text-gray-900">
          Simple tools for real operators
        </h1>

        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          Choose the tools you need now. Upgrade later as your bar, kitchen,
          or operation grows.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {mainPlans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl bg-white border shadow-lg p-8 flex flex-col ${
              plan.popular
                ? "border-orange-500 ring-2 ring-orange-200"
                : "border-gray-200"
            }`}
          >
            {plan.popular ? (
              <div className="absolute -top-4 left-8">
                <span className="rounded-full bg-orange-700 px-4 py-2 text-xs font-bold text-white shadow">
                  MOST POPULAR
                </span>
              </div>
            ) : null}

            <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>

            <div className="mt-5 flex items-end gap-1">
              <span className="text-5xl font-extrabold text-gray-900">
                {plan.price}
              </span>
              <span className="pb-2 text-gray-500">/ month</span>
            </div>

            <p className="mt-5 text-gray-600 leading-7">{plan.description}</p>

            <div className="mt-6 border-t pt-6 flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-gray-800">
                    <span className="font-bold text-orange-700">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="mt-8 w-full rounded-xl bg-orange-700 py-3 font-bold text-white hover:bg-orange-800">
              Coming Soon
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-gray-900 text-white p-8 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">
            Multi-Location
          </p>

          <h2 className="mt-2 text-3xl font-bold">Kitchen & Tap Pro</h2>

          <div className="mt-5 flex items-end gap-1">
            <span className="text-5xl font-extrabold">$59.99</span>
            <span className="pb-2 text-gray-300">/ month</span>
          </div>

          <p className="mt-5 text-gray-300 leading-7">
            Built for operators with multiple locations, multiple users, and
            more advanced account management needs.
          </p>

          <ul className="mt-6 space-y-3">
            <li>✓ Multiple Locations</li>
            <li>✓ User Role Management</li>
            <li>✓ Bar Pro Included</li>
            <li>✓ Kitchen Pro Included</li>
            <li>✓ Advanced Dashboard Access</li>
          </ul>

          <button className="mt-8 rounded-xl bg-orange-700 px-6 py-3 font-bold text-white hover:bg-orange-800">
            Coming Soon
          </button>
        </div>

        <div className="rounded-3xl bg-white border border-gray-200 p-8 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
            Nonprofit Discount
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Nonprofit Bar Pro
          </h2>

          <div className="mt-5 flex items-end gap-1">
            <span className="text-5xl font-extrabold text-gray-900">
              $10.99
            </span>
            <span className="pb-2 text-gray-500">/ month</span>
          </div>

          <p className="mt-5 text-gray-600 leading-7">
            Discounted Bar Pro access for American Legions, VFWs, and
            qualifying nonprofit organizations.
          </p>

          <ul className="mt-6 space-y-3 text-gray-800">
            <li>✓ Bar Back Inventory</li>
            <li>✓ Beverage Pricing</li>
            <li>✓ Vendor Management</li>
            <li>✓ Order Generation</li>
            <li>✓ Proof of 501(c)(3) status required</li>
          </ul>

          <button className="mt-8 rounded-xl bg-white border border-orange-700 px-6 py-3 font-bold text-orange-800 hover:bg-orange-50">
            Coming Soon
          </button>
        </div>
      </div>
      <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
  <h3 className="text-lg font-bold text-amber-900">
    Early Access Notice
  </h3>

  <p className="mt-2 text-amber-800 leading-7">
    Kitchen & Tap is currently under active development. Features shown on this
    page may change prior to launch.
  </p>

  <p className="mt-3 text-amber-800 leading-7">
    Pricing is subject to change without notice until the official public
    release of Kitchen & Tap.
  </p>
</div>
    </div>
  );
}