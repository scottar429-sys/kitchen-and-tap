"use client";

import { BarItem } from "./barBackTypes";

type BarBackBulkSetupProps = {
  existingItemCount: number;
  addImportedItems: (newItems: BarItem[]) => void;
};

export default function BarBackBulkSetup({
  existingItemCount,
  addImportedItems,
}: BarBackBulkSetupProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Bulk Setup</h2>
        <p className="text-sm text-gray-600">
          Liquor bulk setup will go here next.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <p className="text-sm text-gray-600">
          Current saved items: {existingItemCount}
        </p>

        <button
          onClick={() => addImportedItems([])}
          className="mt-4 w-full rounded-xl bg-orange-700 text-white font-bold px-4 py-3"
        >
          Import Coming Soon
        </button>
      </div>
    </section>
  );
}