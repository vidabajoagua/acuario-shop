"use client";

import { useMemo, useState } from "react";
import { createTaxonomyTerm } from "./actions";

type Category = { id: string; name: string };
type Term = { id: string; category_id: string; parent_id: string | null; name: string };

export default function CreateTaxonomyTermForm({ categories, terms }: { categories: Category[]; terms: Term[] }) {
  const [categoryId, setCategoryId] = useState("");
  const [parentId, setParentId] = useState("");
  const parents = useMemo(() => terms.filter((term) => term.category_id === categoryId), [terms, categoryId]);

  function changeCategory(nextId: string) {
    setCategoryId(nextId);
    setParentId("");
  }

  return (
    <details className="rounded-2xl border border-border bg-background p-4 md:p-5">
      <summary className="cursor-pointer list-none text-base font-semibold">
        <span className="inline-flex items-center gap-2"><span className="text-primary">＋</span> Agregar opción</span>
        <p className="mt-1 text-xs font-normal text-muted-foreground">Elige primero una categoría para mostrar solo sus niveles relacionados.</p>
      </summary>
      <form action={createTaxonomyTerm} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <label htmlFor="category_id" className="text-xs font-medium">Categoría *</label>
          <select id="category_id" name="category_id" required value={categoryId} onChange={(event) => changeCategory(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
            <option value="">Selecciona categoría</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="parent_id" className="text-xs font-medium">Depende de</label>
          <select id="parent_id" name="parent_id" value={parentId} onChange={(event) => setParentId(event.target.value)} disabled={!categoryId} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-60">
            <option value="">Nivel principal</option>
            {parents.map((term) => <option key={term.id} value={term.id}>{term.parent_id ? "↳ " : ""}{term.name}</option>)}
          </select>
          <p className="mt-1 text-[11px] text-muted-foreground">Ejemplo: Lámparas → Lámpara patito → Bajo requerimiento.</p>
        </div>
        <div>
          <label htmlFor="name" className="text-xs font-medium">Nombre *</label>
          <input id="name" name="name" required placeholder="Ej. Lámpara patito" className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
        </div>
        <div>
          <label htmlFor="slug" className="text-xs font-medium">Slug (opcional)</label>
          <input id="slug" name="slug" placeholder="Se genera del nombre" className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
        </div>
        <div>
          <label htmlFor="sort_order" className="text-xs font-medium">Orden de visualización</label>
          <input id="sort_order" name="sort_order" type="number" min="0" step="1" defaultValue="0" className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
        </div>
        <div className="flex items-end">
          <button type="submit" className="h-10 w-full rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 sm:w-auto">Guardar opción</button>
        </div>
      </form>
    </details>
  );
}
