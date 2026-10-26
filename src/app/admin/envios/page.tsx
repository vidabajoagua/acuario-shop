import { createAdminClient } from "@/lib/supabase/admin";
import { ShippingManager } from "./shipping-manager";
import { CoverageManager } from "./coverage-manager";

export default async function EnviosPage() {
  const admin = createAdminClient();

  const { data: settings, error } = await admin
    .from("shipping_settings")
    .select(`
      id,
      base_rate,
      included_distance_km,
      additional_km_rate,
      max_automatic_rate,
      free_shipping_minimum,
      automatic_shipping_enabled    `)
    .limit(1)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1>Envíos</h1>
        <p>
          Configura las tarifas y condiciones para el cálculo de envíos de
          VidaBajoAgua.
        </p>
      </div>

      <ShippingManager initialSettings={settings} />

      <CoverageManager />
    </div>
  );
}