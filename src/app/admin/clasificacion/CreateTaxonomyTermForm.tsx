"use client";

import { useMemo, useState } from "react";
import { createTaxonomyTerm } from "./actions";

type Category = { id: string; name: string };
type Term = { id: string; category_id: string; parent_id: string | null; name: string };

export default function CreateTaxonomyTermForm({ categories, terms }: { categories: Category[]; terms: Term[] }) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [parentId, setParentId] = useState("");
  const parents = useMemo(
    () => terms.filter((term) => term.category_id === categoryId),
    [terms, categoryId],
  );

  function changeCategory(nextId: string) {
    setCategoryId(nextId);
    setParentId("");
  }

  return (
    <section className="rounded-2xl border border-border bg-background p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Agregar opción</h2>
          <p className="mt-1 text-xs text-muted-foreground">Registra una nueva clasificación cuando la necesites.</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
          <span aria-hidden="true">＋</span> Nueva opción
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="new-taxonomy-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="new-taxonomy-title" className="text-lg font-semibold">Nueva opción de clasificación</h3>
                <p className="mt-1 text-sm text-muted-foreground">Selecciona la categoría para mostrar solo sus niveles relacionados.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar formulario" className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">Cerrar</button>
            </div>

            <form action={createTaxonomyTerm} onSubmit={() => setOpen(false)} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <p className="mt-1 text-[11px] text-muted-foreground">La lista se administra en «Gestionar opciones y niveles», debajo de este panel.</p>
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
                <p className="mt-1 text-[11px] text-muted-foreground">Los números menores aparecen primero donde se utilice el orden.</p>
              </div>
              <div className="flex items-end justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border border-border px-4 text-sm hover:bg-muted">Cancelar</button>
                <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">Guardar opción</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
