import Link from "next/link";
import { ArrowLeft, ListTree } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createTaxonomyTerm } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProductTaxonomyAdminPage() {
  const supabase = await createClient();
  const [{ data: categories, error: categoriesError }, { data: terms, error: termsError }] = await Promise.all([
    supabase.from("categories").select("id,name").eq("is_active", true).order("sort_order").order("name"),
    supabase.from("product_taxonomy_terms").select("id,category_id,parent_id,name,slug,sort_order,is_active").order("category_id").order("sort_order").order("name"),
  ]);

  if (categoriesError) throw new Error(`No se pudieron cargar las categorías: ${categoriesError.message}`);
  if (termsError) throw new Error(`No se pudo cargar la clasificación: ${termsError.message}`);

  const categoryNames = new Map((categories ?? []).map((item) => [item.id, item.name]));
  const termNames = new Map((terms ?? []).map((item) => [item.id, item.name]));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link href="/admin/productos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Volver a productos
        </Link>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><ListTree size={24} /></div>
          <div><p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Catálogo</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Clasificación de productos</h1></div>
        </div>
        <p className="mt-3 text-muted-foreground">Administra tipos, especies, variedades y otros niveles de clasificación por categoría. La estructura admite niveles adicionales sin cambiar la base de datos.</p>
      </div>

      <section className="rounded-2xl border border-border bg-background p-6">
        <h2 className="text-lg font-semibold">Agregar opción</h2>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">Para crear una subclasificación, selecciona su nivel superior. Debe pertenecer a la misma categoría.</p>
        <form action={createTaxonomyTerm} className="grid gap-5 md:grid-cols-2">
          <div><label htmlFor="category_id" className="text-sm font-medium">Categoría *</label><select id="category_id" name="category_id" required defaultValue="" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"><option value="" disabled>Selecciona categoría</option>{(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label htmlFor="parent_id" className="text-sm font-medium">Depende de</label><select id="parent_id" name="parent_id" defaultValue="" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"><option value="">Nivel principal</option>{(terms ?? []).filter((t) => t.is_active).map((t) => <option key={t.id} value={t.id}>{categoryNames.get(t.category_id) ?? "Categoría"} · {t.parent_id ? `${termNames.get(t.parent_id) ?? ""} / ` : ""}{t.name}</option>)}</select><p className="mt-1 text-xs text-muted-foreground">La validación del servidor impide relacionar categorías distintas.</p></div>
          <div><label htmlFor="name" className="text-sm font-medium">Nombre *</label><input id="name" name="name" required placeholder="Ej. Anubias" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" /></div>
          <div><label htmlFor="slug" className="text-sm font-medium">Slug (opcional)</label><input id="slug" name="slug" placeholder="Se genera del nombre" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" /></div>
          <div><label htmlFor="sort_order" className="text-sm font-medium">Orden</label><input id="sort_order" name="sort_order" type="number" min="0" step="1" defaultValue="0" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" /></div>
          <div className="flex items-end"><button type="submit" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90">Guardar opción</button></div>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-background p-6">
        <h2 className="text-lg font-semibold">Opciones registradas</h2>
        <div className="mt-4 divide-y divide-border">{(terms ?? []).map((term) => <div key={term.id} className="flex flex-wrap items-center justify-between gap-2 py-3"><div><p className="font-medium">{term.name}</p><p className="text-xs text-muted-foreground">{categoryNames.get(term.category_id) ?? "Categoría"}{term.parent_id ? ` · ${termNames.get(term.parent_id) ?? "Nivel superior"}` : " · Nivel principal"} · {term.slug}</p></div><span className="text-xs text-muted-foreground">{term.is_active ? "Activa" : "Inactiva"}</span></div>)}</div>
      </section>
    </div>
  );
}
