import Link from "next/link";
import { ArrowLeft, Tags } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createBrand, toggleBrandStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function BrandsAdminPage() {
  const supabase = await createClient();
  const { data: brands, error } = await supabase.from("brands")
    .select("id,name,slug,description,website_url,is_active,sort_order,created_at")
    .order("sort_order").order("name");
  if (error) throw new Error(`No se pudieron cargar las marcas: ${error.message}`);

  return <div className="mx-auto max-w-5xl space-y-8">
    <div>
      <Link href="/admin/productos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16}/> Volver a productos</Link>
      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Tags size={24}/></div>
        <div><p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Catálogo maestro</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Marcas</h1></div>
      </div>
      <p className="mt-3 text-muted-foreground">Registra marcas una sola vez para mantener un catálogo consistente. Desactivar una marca no elimina productos relacionados.</p>
    </div>
    <section className="rounded-2xl border border-border bg-background p-6">
      <h2 className="text-lg font-semibold">Agregar marca</h2>
      <form action={createBrand} className="mt-5 grid gap-5 md:grid-cols-2">
        <div><label htmlFor="name" className="text-sm font-medium">Nombre *</label><input id="name" name="name" required maxLength={120} placeholder="Ej. Seachem" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"/></div>
        <div><label htmlFor="slug" className="text-sm font-medium">Slug (opcional)</label><input id="slug" name="slug" placeholder="Se genera del nombre" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"/></div>
        <div><label htmlFor="description" className="text-sm font-medium">Descripción</label><input id="description" name="description" maxLength={500} className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"/></div>
        <div><label htmlFor="website_url" className="text-sm font-medium">Sitio web</label><input id="website_url" name="website_url" type="url" placeholder="https://" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"/></div>
        <div><label htmlFor="sort_order" className="text-sm font-medium">Orden</label><input id="sort_order" name="sort_order" type="number" min="0" step="1" defaultValue="0" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"/></div>
        <div className="flex items-end"><button className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground">Guardar marca</button></div>
      </form>
    </section>
    <section className="rounded-2xl border border-border bg-background p-6">
      <h2 className="text-lg font-semibold">Marcas registradas ({brands?.length ?? 0})</h2>
      <div className="mt-4 divide-y divide-border">{(brands ?? []).map((brand) => <div key={brand.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div><p className="font-medium">{brand.name}</p><p className="text-xs text-muted-foreground">{brand.slug}{brand.website_url ? ` · ${brand.website_url}` : ""}{brand.description ? ` · ${brand.description}` : ""}</p></div>
        <div className="flex items-center gap-3"><span className={brand.is_active ? "text-xs text-emerald-700" : "text-xs text-muted-foreground"}>{brand.is_active ? "Activa" : "Inactiva"}</span><form action={toggleBrandStatus}><input type="hidden" name="id" value={brand.id}/><input type="hidden" name="active" value={String(!brand.is_active)}/><button className="rounded-lg border border-border px-3 py-2 text-xs">{brand.is_active ? "Desactivar" : "Activar"}</button></form></div>
      </div>)}</div>
    </section>
  </div>;
}
