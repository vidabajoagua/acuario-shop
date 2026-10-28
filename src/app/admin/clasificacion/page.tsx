import Link from "next/link";
import { ArrowLeft, ListTree } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createTaxonomyTerm, setTaxonomyTermActive, updateTaxonomyTerm } from "./actions";

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
        <p className="mt-3 text-muted-foreground">Las clasificaciones organizan productos dentro de una categoría y pueden tener niveles. Edita nombres y orden aquí; desactiva opciones antiguas en vez de borrarlas para conservar las relaciones existentes.</p>
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
        <p className="mt-1 text-sm text-muted-foreground">Puedes editar nombre, slug y orden. El estado se cambia por separado. No se elimina ningún registro.</p>
        <div className="mt-4 divide-y divide-border">
          {(terms ?? []).map((term) => (
            <div key={term.id} className="py-5">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{term.name}</p>
                  <p className="text-xs text-muted-foreground">{categoryNames.get(term.category_id) ?? "Categoría"}{term.parent_id ? ` · ${termNames.get(term.parent_id) ?? "Nivel superior"}` : " · Nivel principal"}</p>
                </div>
                <span className={term.is_active ? "text-xs text-emerald-700" : "text-xs text-muted-foreground"}>{term.is_active ? "Activa" : "Inactiva"}</span>
              </div>
              <form action={updateTaxonomyTerm} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_100px_auto]">
                <input type="hidden" name="id" value={term.id} />
                <div><label htmlFor={`term-name-${term.id}`} className="text-xs font-medium">Nombre</label><input id={`term-name-${term.id}`} name="name" required defaultValue={term.name} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" /></div>
                <div><label htmlFor={`term-slug-${term.id}`} className="text-xs font-medium">Slug</label><input id={`term-slug-${term.id}`} name="slug" required defaultValue={term.slug} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" /></div>
                <div><label htmlFor={`term-order-${term.id}`} className="text-xs font-medium">Orden</label><input id={`term-order-${term.id}`} name="sort_order" type="number" min="0" step="1" required defaultValue={term.sort_order} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" /></div>
                <div className="flex items-end"><button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">Guardar</button></div>
              </form>
              <form action={setTaxonomyTermActive} className="mt-2">
                <input type="hidden" name="id" value={term.id} />
                <input type="hidden" name="active" value={String(!term.is_active)} />
                <button type="submit" className="text-xs font-medium text-primary underline underline-offset-4">{term.is_active ? "Desactivar opción" : "Activar opción"}</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
