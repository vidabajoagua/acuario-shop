"use client";

import { useState, useTransition } from "react";
import { updateShippingSettings } from "./shipping-actions";
import { CoverageManager } from "./coverage-manager";

type ShippingSettings = {
  id: string;
  base_rate: number;
  included_distance_km: number;
  additional_km_rate: number;
  max_automatic_rate: number;
  free_shipping_minimum: number;
  automatic_shipping_enabled: boolean;
};

type Props = {
  initialSettings: ShippingSettings;
};

export function ShippingManager({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateField(
        field: keyof ShippingSettings,
        value: string | number | boolean | null,
        ) {
        setSettings((current) => ({
            ...current,
            [field]: value,
        }));
}

  function save() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        await updateShippingSettings({
  base_rate: settings.base_rate,
  included_distance_km:
    settings.included_distance_km,
  additional_km_rate:
    settings.additional_km_rate,
  max_automatic_rate:
    settings.max_automatic_rate,
  free_shipping_minimum:
    settings.free_shipping_minimum,
  automatic_shipping_enabled:
    settings.automatic_shipping_enabled,
});

        setMessage("Configuración guardada correctamente.");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo guardar la configuración.",
        );
      }
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Configuración de tarifas
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Estos valores serán utilizados posteriormente por el checkout
            para calcular el costo de envío.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Tarifa base
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={settings.base_rate}
              onChange={(e) =>
  updateField(
    "base_rate",
    Number(e.target.value),
  )
}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Distancia incluida
            </label>

            <input
              type="number"
              min="0"
              step="0.1"
              value={settings.included_distance_km}
              onChange={(e) =>
  updateField(
    "included_distance_km",
    Number(e.target.value),
  )
}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <p className="mt-1 text-xs text-muted-foreground">
              Kilómetros incluidos en la tarifa base.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Costo por km adicional
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={settings.additional_km_rate}
              onChange={(e) =>
  updateField(
    "additional_km_rate",
    Number(e.target.value),
  )
}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Máximo automático
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={settings.max_automatic_rate}
              onChange={(e) =>
  updateField(
    "max_automatic_rate",
    Number(e.target.value),
  )
}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Envío gratis desde
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={settings.free_shipping_minimum}
              onChange={(e) =>
  updateField(
    "free_shipping_minimum",
    Number(e.target.value),
  )
}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <p className="mt-1 text-xs text-muted-foreground">
              Se aplicará al subtotal de productos.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Envío automático
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Permite calcular automáticamente el envío para las direcciones
            que estén dentro de la cobertura configurada.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            updateField(
              "automatic_shipping_enabled",
              !settings.automatic_shipping_enabled,
            )
          }
          className={
            settings.automatic_shipping_enabled
              ? "rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
              : "rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
          }
        >
          {settings.automatic_shipping_enabled
            ? "Envío automático activado"
            : "Envío automático desactivado"}
        </button>
      </div>


      <div className="flex items-center justify-between gap-4">
        <div className="text-sm">
          {message && (
            <span className="text-emerald-700">{message}</span>
          )}

          {error && (
            <span className="text-destructive">{error}</span>
          )}
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={save}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
  <CoverageManager />
}