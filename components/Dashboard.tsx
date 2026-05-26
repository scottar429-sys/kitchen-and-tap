export default function Dashboard() {
  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <span className="text-yellow-500 text-2xl">🔒</span>
        </div>

        <p className="mt-4 text-gray-600 max-w-2xl">
          The Kitchen & Tap Dashboard is currently under construction.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border p-5 bg-orange-50">
            <h3 className="font-bold text-lg">Orders Due</h3>
            <p className="mt-2 text-sm text-gray-600">
              Vendor ordering workflow coming soon.
            </p>
          </div>

          <div className="rounded-2xl border p-5 bg-orange-50">
            <h3 className="font-bold text-lg">Inventory Prompts</h3>
            <p className="mt-2 text-sm text-gray-600">
              Daily and weekly inventory reminders coming soon.
            </p>
          </div>

          <div className="rounded-2xl border p-5 bg-orange-50">
            <h3 className="font-bold text-lg">Margin Reporting</h3>
            <p className="mt-2 text-sm text-gray-600">
              Sales, costs, and profitability dashboards coming soon.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}