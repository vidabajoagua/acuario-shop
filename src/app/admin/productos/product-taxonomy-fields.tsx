"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type CategoryOption = { id: string; name: string; slug: string };
type TaxonomyTerm = {
  id: string; category_id: string; parent_id: string | null; name: string; slug: string; sort_order: number;
};
type AttributeDefinition = {
  id: string; category_id: string; name: string; slug: string; data_type: string;
  unit: string | null; options: string[] | null; is_required: boolean; is_active: boolean; sort_order: number;
};
type Props = {
  categories: CategoryOption[];
  terms: TaxonomyTerm[];
  attributes?: AttributeDefinition[];
  initialAttributeValues?: Record<string, unknown>;
  initialCategoryId?: string;
  initialTermId?: string | null;
};

export function ProductTaxonomyFields({
  categories, terms, attributes = [], initialAttributeValues = {},
  initialCategoryId = "", initialTermId = null,
}: Props) {
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [selectedPath, setSelectedPath] = useState<string[]>(() => {
    if (!initialTermId) return [];
    const path: string[] = [];
    let current = terms.find((term) => term.id === initialTermId);
    while (current) {
      path.unshift(current.id);
      current = current.parent_id ? terms.find((term) => term.id === current?.parent_id) : undefined;
    }
    return path;
  });

  const categoryTerms = useMemo(() => terms.filter((term) => term.category_id === categoryId), [terms, categoryId]);
  const categoryAttributes = useMemo(
    () => attributes.filter((attribute) => attribute.category_id === categoryId && attribute.is_active)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    [attributes, categoryId],
  );
  const levels = useMemo(() => {
    const result: { parentId: string | null; selectedId: string; options: TaxonomyTerm[] }[] = [];
    let parentId: string | null = null;
    for (let depth = 0; depth <= selectedPath.length; depth += 1) {
      const options = categoryTerms.filter((term) => term.parent_id === parentId)
        .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
      if (!options.length) break;
      const selectedId = selectedPath[depth] ?? "";
      result.push({ parentId, selectedId, options });
      if (!selectedId) break;
      const selected = options.find((term) => term.id === selectedId);
      if (!selected) break;
      parentId = selected.id;
    }
    return result;
  }, [categoryTerms, selectedPath]);

  function changeCategory(nextCategoryId: string) {
    setCategoryId(nextCategoryId);
    setSelectedPath([]);
  }
  function changeLevel(depth: number, nextId: string) {
    setSelectedPath((current) => [...current.slice(0, depth), ...(nextId ? [nextId] : [])]);
  }

  return (
    <>
      <section className="rounded-2xl border border-border bg-background p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Clasificación del producto</h2>
          <p className="mt-1 text-sm text-muted-foreground">La clasificación es configurable por categoría y admite niveles adicionales.</p>
        </div>
        <div className="grid gap-5">
          <div>
            <label htmlFor="category_id" className="text-sm font-medium">Categoría *</label>
            <select id="category_id" name="category_id" required value={categoryId}
              onChange={(event) => changeCategory(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="" disabled>Selecciona una categoría</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          {levels.map((level, depth) => (
            <div key={`${categoryId}-${level.parentId ?? "root"}-${depth}`}>
              <label htmlFor={`taxonomy-level-${depth}`} className="text-sm font-medium">
                {depth === 0 ? "Tipo / clasificación" : depth === 1 ? "Especie / grupo" : `Subclasificación ${depth + 1}`}
              </label>
              <select id={`taxonomy-level-${depth}`} value={level.selectedId}
                onChange={(event) => changeLevel(depth, event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm">
                <option value="">Sin especificar</option>
                {level.options.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
              </select>
            </div>
          ))}
          <input type="hidden" name="taxonomy_term_id" value={selectedPath.at(-1) ?? ""} />
          <p className="text-xs text-muted-foreground">Puedes dejar la clasificación vacía si la categoría no requiere tipo o especie.</p>
        </div>
      </section>

      {categoryId && categoryAttributes.length > 0 && (
        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Características específicas</h2>
            <p className="mt-1 text-sm text-muted-foreground">Campos definidos para la categoría seleccionada. Usa información verificada del producto.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {categoryAttributes.map((attribute) => {
              const initial = initialAttributeValues[attribute.id];
              const value = initial == null
                ? ""
                : attribute.data_type === "range" && typeof initial === "object" && "min" in initial && "max" in initial
                  ? `${String((initial as { min: unknown }).min)}-${String((initial as { max: unknown }).max)}`
                  : Array.isArray(initial) ? initial.join(", ") : String(initial);
              const inputClass = "mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm";
              return <div key={attribute.id} className={["text","range","multiselect"].includes(attribute.data_type) ? "md:col-span-2" : ""}>
                <label htmlFor={`attribute-${attribute.id}`} className="text-sm font-medium">
                  {attribute.name}{attribute.unit ? ` (${attribute.unit})` : ""}{attribute.is_required ? " *" : ""}
                </label>
                {attribute.data_type === "select" || attribute.data_type === "multiselect" ? (
                  attribute.data_type === "select" ? <select id={`attribute-${attribute.id}`} name={`attribute_${attribute.id}`} required={attribute.is_required} defaultValue={value} className={inputClass}>
                    <option value="">Sin especificar</option>{(attribute.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select> : <div className="mt-2 grid gap-2 sm:grid-cols-2">{(attribute.options ?? []).map((option) => <label key={option} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name={`attribute_${attribute.id}`} value={option} defaultChecked={Array.isArray(initial) ? initial.includes(option) : typeof initial === "string" && initial.split(", ").includes(option)} />{option}
                  </label>)}</div>
                ) : attribute.data_type === "boolean" ? <select id={`attribute-${attribute.id}`} name={`attribute_${attribute.id}`} required={attribute.is_required} defaultValue={value} className={inputClass}>
                  <option value="">Sin especificar</option><option value="true">Sí</option><option value="false">No</option>
                </select> : attribute.data_type === "number" ? <input id={`attribute-${attribute.id}`} name={`attribute_${attribute.id}`} type="number" step="any" required={attribute.is_required} defaultValue={value} className={inputClass}/> :
                  attribute.data_type === "range" ? <input id={`attribute-${attribute.id}`} name={`attribute_${attribute.id}`} placeholder="Ej. 22-28" required={attribute.is_required} defaultValue={value} className={inputClass}/> :
                  <input id={`attribute-${attribute.id}`} name={`attribute_${attribute.id}`} required={attribute.is_required} defaultValue={value} className={inputClass}/>}
              </div>;
            })}
          </div>
        </section>
      )}
      <div className="text-sm"><Link href="/admin/clasificacion" className="text-primary underline underline-offset-4">Administrar clasificaciones</Link><span className="mx-2 text-muted-foreground">·</span><Link href="/admin/atributos" className="text-primary underline underline-offset-4">Administrar atributos</Link></div>
    </>
  );
}
