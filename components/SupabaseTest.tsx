"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SupabaseTest() {
  const [name, setName] = useState("Checking Supabase...");

  useEffect(() => {
    async function loadOrganization() {
      const { data, error } = await supabase
        .from("organizations")
        .select("name")
        .limit(1);

      if (error) {
        setName(`Error: ${error.message}`);
        return;
      }

      setName(data?.[0]?.name ?? "No organization found");
    }

    loadOrganization();
  }, []);

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
      <strong>Supabase connected:</strong> {name}
    </div>
  );
}