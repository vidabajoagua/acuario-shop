"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ShippingSettings = {
  base_rate: number;
  included_distance_km: number;
  additional_km_rate: number;
  max_automatic_rate: number;
  free_shipping_minimum: number;
  automatic_shipping_enabled: boolean;
};

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autorizado.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("No autorizado.");
  }
}

export async function updateShippingSettings(
  settings: ShippingSettings,
) {
  await requireAdmin();

  const admin = createAdminClient();

  if (settings.base_rate < 0) {
    throw new Error("La tarifa base no puede ser negativa.");
  }

  if (settings.included_distance_km < 0) {
    throw new Error("La distancia incluida no puede ser negativa.");
  }

  if (settings.additional_km_rate < 0) {
    throw new Error("El costo por km no puede ser negativo.");
  }

  if (settings.max_automatic_rate < 0) {
    throw new Error("El máximo automático no puede ser negativo.");
  }

  if (settings.free_shipping_minimum < 0) {
    throw new Error("El mínimo para envío gratis no puede ser negativo.");
  }

  const { data: existing, error: existingError } = await admin
    .from("shipping_settings")
    .select("id")
    .limit(1)
    .single();

  if (existingError || !existing) {
    throw new Error("No existe la configuración de envíos.");
  }

  const { error } = await admin
    .from("shipping_settings")
    .update({
      base_rate: settings.base_rate,
      included_distance_km: settings.included_distance_km,
      additional_km_rate: settings.additional_km_rate,
      max_automatic_rate: settings.max_automatic_rate,
      free_shipping_minimum: settings.free_shipping_minimum,
      automatic_shipping_enabled: settings.automatic_shipping_enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id);

  if (error) {
    console.error("Error actualizando configuración de envíos:", error);
    throw new Error("No se pudo guardar la configuración.");
  }

  revalidatePath("/admin/envios");
}