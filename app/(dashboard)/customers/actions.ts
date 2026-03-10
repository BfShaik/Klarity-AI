"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { withCrudLogging } from "@/lib/crud-context";
import { ensureProfile } from "@/lib/ensure-profile";
import { useOracle } from "@/lib/db";
import * as oracleCustomers from "@/lib/oracle/tables/customers";

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to add a customer.");
  await ensureProfile(supabase, user);

  return withCrudLogging(
    { operation: "createCustomer", resource: "customers", userId: user.id },
    async () => {
      const name = (formData.get("name") as string)?.trim();
      if (!name) throw new Error("Customer name is required.");
      const notes = (formData.get("notes") as string)?.trim() || null;

      if (useOracle) {
        await oracleCustomers.insertCustomer(user.id, { name, notes });
      } else {
        const { error } = await supabase.from("customers").insert({
          user_id: user.id,
          name,
          notes,
        });
        if (error) throw error;
      }
      revalidatePath("/customers");
      revalidatePath("/notes/new");
      revalidatePath("/work-log");
    }
  );
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to update a customer.");
  return withCrudLogging(
    { operation: "updateCustomer", resource: "customers", userId: user.id },
    async () => {
      const name = (formData.get("name") as string)?.trim();
      if (!name) throw new Error("Customer name is required.");
      const notes = (formData.get("notes") as string)?.trim() || null;

      if (useOracle) {
        await oracleCustomers.updateCustomer(id, user.id, { name, notes });
      } else {
        const { error } = await supabase.from("customers").update({ name, notes, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
        if (error) throw error;
      }
      revalidatePath("/customers");
      revalidatePath("/notes/new");
      revalidatePath("/work-log");
    }
  );
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to delete a customer.");
  return withCrudLogging(
    { operation: "deleteCustomer", resource: "customers", userId: user.id },
    async () => {
      if (useOracle) {
        await oracleCustomers.deleteCustomer(id, user.id);
      } else {
        const { error } = await supabase.from("customers").delete().eq("id", id).eq("user_id", user.id);
        if (error) throw error;
      }
      revalidatePath("/customers");
      revalidatePath("/notes/new");
      revalidatePath("/work-log");
    }
  );
}
