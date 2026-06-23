"use client";
"use client";

export default function BackOfHouse() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
          Account Management
        </p>

        <h1 className="mt-2 text-4xl font-extrabold text-gray-900">
          Back of House
        </h1>

        <p className="mt-3 text-lg text-gray-600 max-w-3xl">
          Manage your subscription, restaurant account, users, and permissions.
          More account tools will be added here as Kitchen & Tap grows.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white border border-gray-200 shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Subscription
          </h2>

          <p className="mt-3 text-gray-600 leading-7">
            View your current plan, billing status, and upgrade or change your
            subscription.
          </p>

          <button className="mt-6 w-full rounded-xl bg-orange-700 py-3 font-bold text-white hover:bg-orange-800">
            Manage Subscription
          </button>
        </div>

        <div className="rounded-3xl bg-white border border-gray-200 shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Users
          </h2>

          <p className="mt-3 text-gray-600 leading-7">
            Add employees, remove users, and manage who can access your account.
          </p>

          <button className="mt-6 w-full rounded-xl bg-orange-700 py-3 font-bold text-white hover:bg-orange-800">
            Manage Users
          </button>
        </div>

        <div className="rounded-3xl bg-white border border-gray-200 shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Permissions
          </h2>

          <p className="mt-3 text-gray-600 leading-7">
            Control access to Bar Back, Pantry, Vendors, Dashboard, and admin
            tools.
          </p>

          <button className="mt-6 w-full rounded-xl bg-orange-700 py-3 font-bold text-white hover:bg-orange-800">
            Manage Permissions
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-gray-900 text-white shadow-lg p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">
              Coming Soon
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Restaurant Account Settings
            </h2>

            <p className="mt-3 text-gray-300 leading-7 max-w-3xl">
              Soon you will be able to manage locations, business information,
              billing contacts, setup preferences, and account-level settings
              from this page.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 text-sm text-gray-200">
            <p>Planned tools:</p>
            <ul className="mt-3 space-y-2">
              <li>✓ Add locations</li>
              <li>✓ Edit business info</li>
              <li>✓ Billing contact</li>
              <li>✓ Account audit log</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}