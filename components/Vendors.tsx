"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentOrganizationId } from "@/lib/getCurrentOrganization";

type VendorCategory = "Pantry" | "Bar" | "Both";

type Vendor = {
  id: string;
  vendorNumber: string;
  name: string;
  category: VendorCategory;
  phone: string;
  email?: string;
  website?: string;
  contactName?: string;
  customerNumber?: string;
  minimumOrder?: string;
  orderDays: string[];
  deliveryDays: string[];
  notes?: string;
  active: boolean;
};

type VendorFormData = {
  name: string;
  category: VendorCategory;
  phone: string;
  email: string;
  website: string;
  contactName: string;
  customerNumber: string;
  minimumOrder: string;
  orderDays: string[];
  deliveryDays: string[];
  notes: string;
};

const emptyForm: VendorFormData = {
  name: "",
  category: "Pantry",
  phone: "",
  email: "",
  website: "",
  contactName: "",
  customerNumber: "",
  minimumOrder: "",
  orderDays: [],
  deliveryDays: [],
  notes: "",
};

const categories: ("All" | VendorCategory)[] = ["All", "Pantry", "Bar", "Both"];
const weekDays = ["M", "Tu", "W", "Th", "F", "Sa", "Su"];

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [categoryFilter, setCategoryFilter] =
    useState<"All" | VendorCategory>("All");
  const [showInactive, setShowInactive] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VendorFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  async function loadVendors() {
    setLoading(true);

    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
      setNeedsLogin(true);
      setVendors([]);
      setLoading(false);
      return;
    }

    setNeedsLogin(false);

    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("organization_id", organizationId)
      .order("vendor_name", { ascending: true });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const mappedVendors: Vendor[] = (data || []).map((vendor) => ({
      id: vendor.id,
      vendorNumber: vendor.vendor_number || "V-000",
      name: vendor.vendor_name,
      category: (vendor.category || "Both") as VendorCategory,
      phone: vendor.phone || "",
      email: vendor.email || "",
      website: vendor.website || "",
      contactName: vendor.contact_name || "",
      customerNumber: vendor.account_number || "",
      minimumOrder: vendor.minimum_order || "",
      orderDays: vendor.order_days || [],
      deliveryDays: vendor.delivery_days || [],
      notes: vendor.notes || "",
      active: vendor.is_active ?? true,
    }));

    setVendors(mappedVendors);
    setLoading(false);
  }

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesCategory =
        categoryFilter === "All" ||
        vendor.category === categoryFilter ||
        vendor.category === "Both";

      const matchesActiveFilter = showInactive ? true : vendor.active;

      return matchesCategory && matchesActiveFilter;
    });
  }, [vendors, categoryFilter, showInactive]);

  function generateVendorNumber() {
    return `V-${String(vendors.length + 1).padStart(3, "0")}`;
  }

  function openAddForm() {
    setFormData(emptyForm);
    setEditingVendorId(null);
    setIsFormOpen(true);
    setSelectedVendor(null);
  }

  function openEditForm(vendor: Vendor) {
    setFormData({
      name: vendor.name,
      category: vendor.category,
      phone: vendor.phone,
      email: vendor.email || "",
      website: vendor.website || "",
      contactName: vendor.contactName || "",
      customerNumber: vendor.customerNumber || "",
      minimumOrder: vendor.minimumOrder || "",
      orderDays: vendor.orderDays || [],
      deliveryDays: vendor.deliveryDays || [],
      notes: vendor.notes || "",
    });

    setEditingVendorId(vendor.id);
    setIsFormOpen(true);
  }

  function closeForm() {
    setFormData(emptyForm);
    setEditingVendorId(null);
    setIsFormOpen(false);
  }

  async function saveVendor() {
    if (!formData.name.trim()) {
      alert("Vendor name is required.");
      return;
    }

    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
      setNeedsLogin(true);
      return;
    }

    const existingVendor = vendors.find(
      (vendor) => vendor.id === editingVendorId
    );

    const payload = {
      organization_id: organizationId,
      vendor_number: existingVendor?.vendorNumber || generateVendorNumber(),
      vendor_name: formData.name.trim(),
      category: formData.category,
      phone: formData.phone.trim(),
      email: formData.email.trim() || null,
      website: formData.website.trim() || null,
      contact_name: formData.contactName.trim() || null,
      account_number: formData.customerNumber.trim() || null,
      minimum_order: formData.minimumOrder.trim() || null,
      order_days: formData.orderDays,
      delivery_days: formData.deliveryDays,
      notes: formData.notes.trim() || null,
      is_active: existingVendor?.active ?? true,
    };

    if (editingVendorId) {
      const { error } = await supabase
        .from("vendors")
        .update(payload)
        .eq("id", editingVendorId);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("vendors").insert(payload);

      if (error) {
        alert(error.message);
        return;
      }
    }

    await loadVendors();
    closeForm();
    setSelectedVendor(null);
  }

  async function toggleVendorActive(vendor: Vendor) {
    const { error } = await supabase
      .from("vendors")
      .update({ is_active: !vendor.active })
      .eq("id", vendor.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadVendors();
    setSelectedVendor(null);
  }

  async function deleteVendor(vendor: Vendor) {
    const confirmed = window.confirm(`Delete ${vendor.name}?`);
    if (!confirmed) return;

    const { error } = await supabase
      .from("vendors")
      .delete()
      .eq("id", vendor.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadVendors();
    setSelectedVendor(null);
  }

  function updateFormField<K extends keyof VendorFormData>(
    field: K,
    value: VendorFormData[K]
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  if (needsLogin) {
    return (
      <section className="rounded-2xl border bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-bold">Login Required</h1>
        <p className="mt-2 text-gray-600">
          Please log in to manage vendors.
        </p>
      </section>
    );
  }

  if (isFormOpen) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow md:p-8">
          <button
            onClick={closeForm}
            className="mb-5 rounded-lg border bg-white px-4 py-2 font-semibold hover:bg-gray-50"
          >
            ← Back to Vendors
          </button>

          <h1 className="text-3xl font-bold">
            {editingVendorId ? "Edit Vendor" : "Add Vendor"}
          </h1>

          <p className="mt-2 text-gray-600">
            Add vendor details, order days, delivery days, and account information.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FormInput
              label="Vendor Name"
              value={formData.name}
              onChange={(value) => updateFormField("name", value)}
              required
            />

            <FormSelect
              label="Category"
              value={formData.category}
              onChange={(value) =>
                updateFormField("category", value as VendorCategory)
              }
              options={["Pantry", "Bar", "Both"]}
            />

            <FormInput
              label="Phone"
              value={formData.phone}
              onChange={(value) => updateFormField("phone", value)}
              placeholder="555-555-5555"
            />

            <FormInput
              label="Email"
              value={formData.email}
              onChange={(value) => updateFormField("email", value)}
              placeholder="orders@example.com"
            />

            <FormInput
              label="Website"
              value={formData.website}
              onChange={(value) => updateFormField("website", value)}
              placeholder="https://vendorwebsite.com"
            />

            <FormInput
              label="Contact Name"
              value={formData.contactName}
              onChange={(value) => updateFormField("contactName", value)}
              placeholder="Sales rep name"
            />

            <FormInput
              label="Customer / Account Number"
              value={formData.customerNumber}
              onChange={(value) => updateFormField("customerNumber", value)}
              placeholder="Account #12345"
            />

            <FormInput
              label="Minimum Order"
              value={formData.minimumOrder}
              onChange={(value) => updateFormField("minimumOrder", value)}
              placeholder="$500 or 10 case minimum"
            />

            <DayPicker
              label="Order Days"
              selectedDays={formData.orderDays}
              onChange={(days) => updateFormField("orderDays", days)}
            />

            <DayPicker
              label="Delivery Days"
              selectedDays={formData.deliveryDays}
              onChange={(days) => updateFormField("deliveryDays", days)}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateFormField("notes", e.target.value)}
              className="mt-1 min-h-28 w-full rounded-lg border p-3"
              placeholder="Primary food vendor, liquor rep notes, delivery instructions, etc."
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={saveVendor}
              className="rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white hover:bg-orange-800"
            >
              Save Vendor
            </button>

            <button
              onClick={closeForm}
              className="rounded-xl border bg-white px-5 py-3 font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (selectedVendor) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow md:p-8">
          <button
            onClick={() => setSelectedVendor(null)}
            className="mb-5 rounded-lg border bg-white px-4 py-2 font-semibold hover:bg-gray-50"
          >
            ← Back to Vendors
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-700">
                {selectedVendor.vendorNumber}
              </p>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{selectedVendor.name}</h1>
                <span className="text-2xl text-yellow-500">🔒</span>
              </div>
              <p className="mt-2 text-gray-600">
                {selectedVendor.category} Vendor
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                selectedVendor.active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {selectedVendor.active ? "Active" : "Inactive"}
            </span>
          </div>

          {!selectedVendor.active ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <h3 className="font-bold text-red-800">Vendor Review Needed</h3>
              <p className="mt-2 text-sm text-red-700">
                This vendor is inactive. Later, Pantry and Bar Back items linked
                to this vendor should be flagged.
              </p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoCard label="Phone" value={selectedVendor.phone || "Not added"} />
            <InfoCard label="Email" value={selectedVendor.email || "Not added"} />
            <InfoCard
              label="Website"
              value={selectedVendor.website || "Not added"}
            />
            <InfoCard
              label="Contact Name"
              value={selectedVendor.contactName || "Not added"}
            />
            <InfoCard
              label="Customer Number"
              value={selectedVendor.customerNumber || "Not added"}
            />
            <InfoCard
              label="Minimum Order"
              value={selectedVendor.minimumOrder || "Not added"}
            />
            <InfoCard
              label="Order Days"
              value={
                selectedVendor.orderDays.length
                  ? selectedVendor.orderDays.join(", ")
                  : "Not added"
              }
            />
            <InfoCard
              label="Delivery Days"
              value={
                selectedVendor.deliveryDays.length
                  ? selectedVendor.deliveryDays.join(", ")
                  : "Not added"
              }
            />
          </div>

          <div className="mt-5 rounded-xl border bg-orange-50 p-4">
            <p className="text-sm font-semibold text-gray-700">Notes</p>
            <p className="mt-1 text-gray-700">
              {selectedVendor.notes || "No notes added."}
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <button
              onClick={() => alert("Order sheet feature coming soon.")}
              className="rounded-xl bg-orange-700 px-4 py-3 font-semibold text-white hover:bg-orange-800"
            >
              Generate Order Sheet
            </button>

            <button
              onClick={() => openEditForm(selectedVendor)}
              className="rounded-xl border bg-white px-4 py-3 font-semibold hover:bg-gray-50"
            >
              Edit Vendor
            </button>

            <button
              onClick={() => toggleVendorActive(selectedVendor)}
              className={`rounded-xl px-4 py-3 font-semibold ${
                selectedVendor.active
                  ? "bg-yellow-100 text-yellow-900 hover:bg-yellow-200"
                  : "bg-green-100 text-green-900 hover:bg-green-200"
              }`}
            >
              {selectedVendor.active ? "Mark Inactive" : "Reactivate Vendor"}
            </button>

            <button
              onClick={() => deleteVendor(selectedVendor)}
              className="rounded-xl bg-red-100 px-4 py-3 font-semibold text-red-800 hover:bg-red-200"
            >
              Delete Vendor
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Vendors</h1>
              <span className="text-2xl text-yellow-500">🔒</span>
            </div>
            <p className="mt-2 max-w-2xl text-gray-600">
              Manage vendor contacts, account numbers, order days, delivery
              days, inactive vendors, and future order-sheet workflows.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white hover:bg-orange-800"
          >
            + Add Vendor
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                categoryFilter === category
                  ? "bg-orange-700 text-white"
                  : "bg-orange-100 text-orange-800 hover:bg-orange-200"
              }`}
            >
              {category}
            </button>
          ))}

          <button
            onClick={() => setShowInactive((current) => !current)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              showInactive
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {showInactive ? "Showing Inactive" : "Hide Inactive"}
          </button>
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl border bg-orange-50 p-6 text-center">
            <h3 className="text-lg font-bold">Loading vendors...</h3>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.map((vendor) => (
              <button
                key={vendor.id}
                onClick={() => setSelectedVendor(vendor)}
                className="rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-orange-400 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-orange-700">
                      {vendor.vendorNumber}
                    </p>
                    <h2 className="mt-1 text-xl font-bold">{vendor.name}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {vendor.category} Vendor
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-yellow-500">🔒</span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        vendor.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vendor.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">Order Days:</span>{" "}
                    {vendor.orderDays.length
                      ? vendor.orderDays.join(", ")
                      : "Not added"}
                  </p>
                  <p>
                    <span className="font-semibold">Delivery Days:</span>{" "}
                    {vendor.deliveryDays.length
                      ? vendor.deliveryDays.join(", ")
                      : "Not added"}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    {vendor.phone || "Not added"}
                  </p>
                </div>

                {!vendor.active ? (
                  <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">
                    Linked inventory should be reviewed.
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        )}

        {!loading && filteredVendors.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-orange-50 p-6 text-center">
            <h3 className="text-lg font-bold">No vendors found</h3>
            <p className="mt-2 text-gray-600">
              Add a vendor or change your filters.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className="mt-1 text-gray-900">{value}</p>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-700">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="mt-1 w-full rounded-lg border p-3"
      />
    </label>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border bg-white p-3"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function DayPicker({
  label,
  selectedDays,
  onChange,
}: {
  label: string;
  selectedDays: string[];
  onChange: (days: string[]) => void;
}) {
  function toggleDay(day: string) {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((item) => item !== day));
      return;
    }

    onChange([...selectedDays, day]);
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {weekDays.map((day) => {
          const selected = selectedDays.includes(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`min-w-11 rounded-lg border px-3 py-2 text-sm font-semibold ${
                selected
                  ? "border-orange-700 bg-orange-700 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-orange-50"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}