"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type CategoryOption = { id: string; name: string; slug: string };
type TaxonomyTerm = {
  id: string;
  category_id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  sort_order: number;
};

type Props = {
  categories: CategoryOption[];
  terms: TaxonomyTerm[];
  initialCategoryId?: string;
  initialTermId?: string | null;
};

export function ProductTaxonomyFields({
  categories,
  terms,
  initialCategoryId = "",
  initialTermId = null,
}: Props) {
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [selectedPath, setSelectedPath] = useState<string[]>(() => {
    if (!initialTermId) return [];
    const path: string[] = [];
    let current = terms.find((term) => term.id === initialTermId);
    while (current) {
      path.unshift(current.id);
      current = current.parent_id
        ? terms.find((term) => term.id === current?.parent_id)
        : undefined;
    }
    return path;
  });

  const categoryTerms = useMemo(
    () => terms.filter((term) => term.category_id === categoryId),
    [terms, categoryId],
  );

  const levels = useMemo(() => {
    const result: { parentId: string | null; selectedId: string; options: TaxonomyTerm[] }[] = [];
    let parentId: string | null = null;
    for (let depth = 0; depth <= selectedPath.length; depth += 1) {
      const options = categoryTerms
        .filter((term) => term.parent_id === parentId)
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
    setSelectedPath((current) => [
      ...current.slice(0, depth),
      ...(nextId ? [nextId] : []),
    ]);
  }

  return (
    <section className="rounded-2xl border border-border bg-background p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Clasificación del producto</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          La clasificación es configurable por categoría y admite niveles adicionales.
        </p>
      </div>

      <div className="grid gap-5">
        <div>
          <label htmlFor="category_id" className="text-sm font-medium">Categoría *</label>
          <select
            id="category_id"
            name="category_id"
            required
            value={categoryId}
            onChange={(event) => changeCategory(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="" disabled>Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        {levels.map((level, depth) => (
          <div key={`${categoryId}-${level.parentId ?? "root"}-${depth}`}>
            <label htmlFor={`taxonomy-level-${depth}`} className="text-sm font-medium">
              {depth === 0 ? "Tipo / clasificación" : depth === 1 ? "Especie / grupo" : `Subclasificación ${depth + 1}`}
            </label>
            <select
              id={`taxonomy-level-${depth}`}
              value={level.selectedId}
              onChange={(event) => changeLevel(depth, event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Sin especificar</option>
              {level.options.map((term) => (
                <option key={term.id} value={term.id}>{term.name}</option>
              ))}
            </select>
          </div>
        ))}

        <input type="hidden" name="taxonomy_term_id" value={selectedPath.at(-1) ?? ""} />
        <p className="text-xs text-muted-foreground">
          Puedes dejar la clasificación vacía si la categoría no requiere tipo o especie. Las opciones se administran en el catálogo de clasificación.
        </p>
      </div>
    </section>
  );
}
