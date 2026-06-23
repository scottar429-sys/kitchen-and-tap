import { supabase } from "./supabaseClient";

export async function getCurrentOrganizationId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("organization_users")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data.organization_id;
}