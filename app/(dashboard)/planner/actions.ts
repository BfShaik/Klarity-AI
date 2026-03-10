"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { withCrudLogging } from "@/lib/crud-context";
import { useOracle } from "@/lib/db";
import * as oraclePlans from "@/lib/oracle/tables/daily-plans";

export async function deletePlan(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to delete a plan.");
  return withCrudLogging(
    { operation: "deletePlan", resource: "daily_plans", userId: user.id },
    async () => {
      if (useOracle) {
        await oraclePlans.deleteDailyPlan(id, user.id);
      } else {
        const { error } = await supabase.from("daily_plans").delete().eq("id", id).eq("user_id", user.id);
        if (error) throw error;
      }
      revalidatePath("/planner");
    }
  );
}
