import Link from "next/link";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAttributeDefinition, toggleAttributeStatus } from "./actions";

export const dynamic = "force-dynamic";
const typeLabels: Record<string,string> = { text:"Texto", number:"Número", boolean:"Sí / No", select:"Lista", multiselect:"Lista múltiple", range:"Rango" };

export default async function AttributesAdminPage() {
  const supabase = await createClient();
  const [{data: categories,error: categoriesError},{data: attributes,error: attributesError}] = await Promise.all([
    supabase.from("categories").select("id,name").order("sort_order").order("name"),
    supabase.from("product_attribute_definitions").select("id,category_id,name,slug,data_type,unit,options,is_required,is_filterable,show_on_product_page,is_active,sort_order").order("category_id").order("sort_order").order("name"),
  ]);
  if(categoriesError) throw new Error(`No se pudieron cargar las categorías: ${categoriesError.message}`);
  if(attributesError) throw new Error(`No se pudieron cargar los atributos: ${attributesError.message}`);
  const categoryNames = new Map((categories ?? []).map((c)=>[c.id,c.name]));
  return <div className="mx-auto max-w-5xl space-y-8">
    <div><Link href="/admin/productos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16}/> Volver a productos</Link>
      <div className="mt-6 flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><SlidersHorizontal size={24}/></div><div><p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Catálogo maestro</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Atributos por categoría</h1></div></div>
      <p className="mt-3 text-muted-foreground">Define campos reutilizables para las fichas de producto. Las opciones de listas se escriben una por línea. Los atributos iniciales de plantas están incluidos en la migración versionada.</p>
    </div>
    <section className="rounded-2xl border border-border bg-background p-6"><h2 className="text-lg font-semibold">Nuevo atributo</h2>
      <form action={createAttributeDefinition} className="mt-5 grid gap-5 md:grid-cols-2">
        <div><label htmlFor="category_id" className="text-sm font-medium">Categoría *</label><select id="category_id" name="category_id" required defaultValue="" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"><option value="" disabled>Selecciona categoría</option>{(categories??[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label htmlFor="name" className="text-sm font-medium">Nombre *</label><input id="name" name="name" required maxLength={120} placeholder="Ej. Iluminación requerida" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"/></div>
        <div><label htmlFor="slug" className="text-sm font-medium">Slug (opcional)</label><input id="slug" name="slug" placeholder="Se genera del nombre" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"/></div>
        <div><label htmlFor="data_type" className="text-sm font-medium">Tipo de dato *</label><select id="data_type" name="data_type" defaultValue="text" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm">{Object.entries(typeLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
        <div><label htmlFor="unit" className="text-sm font-medium">Unidad (opcional)</label><input id="unit" name="unit" placeholder="Ej. °C, cm, L/h" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"/></div>
        <div><label htmlFor="sort_order" className="text-sm font-medium">Orden</label><input id="sort_order" name="sort_order" type="number" min="0" step="1" defaultValue="0" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"/></div>
        <div className="md:col-span-2"><label htmlFor="options" className="text-sm font-medium">Opciones (solo listas)</label><textarea id="options" name="options" rows={4} placeholder={"Baja\nMedia\nAlta"} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"/><p className="mt-1 text-xs text-muted-foreground">Una opción por línea; obligatorio para Lista y Lista múltiple.</p></div>
        <div className="flex flex-wrap gap-5 md:col-span-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_required"/> Obligatorio</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_filterable"/> Usar como filtro</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="show_on_product_page" defaultChecked/> Mostrar en ficha pública</label></div>
        <div><button className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground">Guardar atributo</button></div>
      </form>
    </section>
    <section className="rounded-2xl border border-border bg-background p-6"><h2 className="text-lg font-semibold">Atributos registrados ({attributes?.length??0})</h2><div className="mt-4 divide-y divide-border">{(attributes??[]).map(a=><div key={a.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><p className="font-medium">{a.name}{a.unit ? ` (${a.unit})` : ""}</p><p className="text-xs text-muted-foreground">{categoryNames.get(a.category_id)??"Categoría"} · {typeLabels[a.data_type]??a.data_type}{a.is_required?" · Obligatorio":""}{a.is_filterable?" · Filtro":""}</p>{Array.isArray(a.options)&&a.options.length>0?<p className="mt-1 text-xs text-muted-foreground">Opciones: {a.options.join(", ")}</p>:null}</div><div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">{a.is_active?"Activo":"Inactivo"}</span><form action={toggleAttributeStatus}><input type="hidden" name="id" value={a.id}/><input type="hidden" name="active" value={String(!a.is_active)}/><button className="rounded-lg border border-border px-3 py-2 text-xs">{a.is_active?"Desactivar":"Activar"}</button></form></div></div>)}</div></section>
  </div>;
}
