import Link from "next/link";
import { ArrowLeft, ListTree } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createTaxonomyTerm } from "./actions";
import TaxonomyTermsTable from "./TaxonomyTermsTable";

export const dynamic = "force-dynamic";

export default async function ProductTaxonomyAdminPage() {
  const supabase = await createClient();
  const [
    { data: categories, error: categoriesError },
    { data: terms, error: termsError },
  ] = await Promise.all([
    supabase.from("categories").select("id,name").eq("is_active", true).order("sort_order").order("name"),
    supabase.from("product_taxonomy_terms").select("id,category_id,parent_id,name,slug,sort_order,is_active").order("category_id").order("sort_order").order("name"),
  ]);

  if (categoriesError) throw new Error(\`No se pudieron cargar las categorías: \${categoriesError.message}\`);
  if (termsError) throw new Error(\`No se pudo cargar la clasificación: \${termsError.message}\`);

  const categoryNames = new Map((categories ?? []).map((item) => [item.id, item.name]));
  const termNames = new Map((terms ?? []).map((item) => [item.id, item.name]));

  const tableTerms = (terms ?? []).map((term) => ({
    id: term.id,
    category_id: term.category_id,
    parent_id: term.parent_id,
    name: term.name,
    slug: term.slug,
    sort_order: term.sort_order,
    is_active: term.is_active,
    category_name: categoryNames.get(term.category_id) ?? "Categoría",
    parent_name: term.parent_id ? termNames.get(term.parent_id) ?? "Nivel superior" : "Nivel principal",
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Link href="/admin/productos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Volver a productos
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ListTree size={21} /></div>
          <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Catálogo</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Clasificación de productos</h1></div>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Organiza los productos por categoría y niveles. El orden define la posición de las opciones donde se utilice esta clasificación. Puedes desactivar opciones antiguas sin perder sus relaciones.</p>
      </div>

      <details className="rounded-2xl border border-border bg-background p-4 md:p-5">
        <summary className="cursor-pointer list-none text-base font-semibold">
          <span className="inline-flex items-center gap-2"><span className="text-primary">＋</span> Agregar opción</span>
          <p className="mt-1 text-xs font-normal text-muted-foreground">Abre el formulario solo cuando necesites registrar una nueva opción.</p>
        </summary>
        <form action={createTaxonomyTerm} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div><label htmlFor="category_id" className="text-xs font-medium">Categoría *</label><select id="category_id" name="category_id" required defaultValue="" className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"><option value="" disabled>Selecciona categoría</option>{(categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <div><label htmlFor="parent_id" className="text-xs font-medium">Depende de</label><select id="parent_id" name="parent_id" defaultValue="" className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"><option value="">Nivel principal</option>{(terms ?? []).filter((term) => term.is_active).map((term) => <option key={term.id} value={term.id}>{categoryNames.get(term.category_id) ?? "Categoría"} · {term.parent_id ? \`\${termNames.get(term.parent_id) ?? ""} / \` : ""}{term.name}</option>)}</select></div>
          <div><label htmlFor="name" className="text-xs font-medium">Nombre *</label><input id="name" name="name" required placeholder="Ej. Anubias" className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" /></div>
          <div><label htmlFor="slug" className="text-xs font-medium">Slug (opcional)</label><input id="slug" name="slug" placeholder="Se genera del nombre" className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" /></div>
          <div><label htmlFor="sort_order" className="text-xs font-medium">Orden de visualización</label><input id="sort_order" name="sort_order" type="number" min="0" step="1" defaultValue="0" className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" /><p className="mt-1 text-[11px] text-muted-foreground">Los números menores aparecen primero donde se aplique este orden.</p></div>
          <div className="flex items-end"><button type="submit" className="h-10 w-full rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 sm:w-auto">Guardar opción</button></div>
        </form>
      </details>

      <TaxonomyTermsTable terms={tableTerms} />
    </div>
  );
}
