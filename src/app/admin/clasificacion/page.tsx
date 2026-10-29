import Link from "next/link";
import { ArrowLeft, ListTree } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CreateTaxonomyTermForm from "./CreateTaxonomyTermForm";
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

      <CreateTaxonomyTermForm
        categories={(categories ?? []).map((category) => ({ id: category.id, name: category.name }))}
        terms={(terms ?? []).filter((term) => term.is_active).map((term) => ({
          id: term.id,
          category_id: term.category_id,
          parent_id: term.parent_id,
          name: term.name,
        }))}
      />

      <TaxonomyTermsTable terms={tableTerms} />
    </div>
  );
}
