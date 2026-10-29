"use client";

import { useActionState, useMemo, useState } from "react";
import { Pencil, Power, Trash2 } from "lucide-react";
import { deleteTaxonomyTerm, setTaxonomyTermActive, updateTaxonomyTerm } from "./actions";

type TaxonomyTerm = {
  id: string;
  category_id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  category_name: string;
  parent_name: string;
};

export default function TaxonomyTermsTable({ terms }: { terms: TaxonomyTerm[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaxonomyTerm | null>(null);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteTaxonomyTerm, { error: null as string | null });

  const filteredTerms = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return terms.filter((term) => {
      const matchesStatus = status === "all" || (status === "active" && term.is_active) || (status === "inactive" && !term.is_active);
      const matchesSearch = !query || [term.name, term.slug, term.category_name, term.parent_name].some((value) => value.toLocaleLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [terms, search, status]);

  return (
    <section className="rounded-2xl border border-border bg-background p-4 md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><h2 className="text-base font-semibold">Gestionar opciones y niveles</h2><p className="mt-1 text-xs text-muted-foreground">Aquí administras los valores que aparecen en «Depende de»: edita su categoría y nivel superior, o desactiva y elimina opciones sin dependencias.</p></div>
        <span className="text-xs text-muted-foreground">{filteredTerms.length} de {terms.length} opciones</span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_190px]">
        <div><label htmlFor="taxonomy-search" className="sr-only">Buscar opciones</label><input id="taxonomy-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, slug o categoría…" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" /></div>
        <div><label htmlFor="taxonomy-status" className="sr-only">Filtrar por estado</label><select id="taxonomy-status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"><option value="all">Todas las opciones</option><option value="active">Solo activas</option><option value="inactive">Solo inactivas</option></select></div>
      </div>
      <div className="mt-3 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="px-3 py-3 font-medium">Opción</th><th className="px-3 py-3 font-medium">Categoría / nivel</th><th className="px-3 py-3 font-medium">Orden</th><th className="px-3 py-3 font-medium">Estado</th><th className="px-3 py-3 text-right font-medium">Acciones</th></tr></thead>
          <tbody>
            {filteredTerms.map((term) => (
              <tr key={term.id} className="border-t border-border align-middle">
                <td className="px-3 py-3"><p className="font-medium">{term.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{term.slug}</p></td>
                <td className="px-3 py-3"><p>{term.category_name}</p><p className="mt-0.5 text-xs text-muted-foreground">{term.parent_name}</p></td>
                <td className="px-3 py-3 tabular-nums">{term.sort_order}</td>
                <td className="px-3 py-3"><span className={term.is_active ? "inline-flex rounded-full bg-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-950" : "inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-900"}>{term.is_active ? "Activa" : "Inactiva"}</span></td>
                <td colSpan={editingId === term.id ? 5 : undefined} className={editingId === term.id ? "px-3 py-3 bg-muted/20" : "px-3 py-3 text-right"}>
                  {editingId !== term.id ? (
                    <div className="flex items-center justify-end gap-2"><button type="button" title="Editar clasificación" aria-label={`Editar ${term.name}`} onClick={() => setEditingId(term.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-300 bg-sky-100 text-sky-800 transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"><Pencil size={16} strokeWidth={1.7} /></button><form action={setTaxonomyTermActive}><input type="hidden" name="id" value={term.id} /><input type="hidden" name="active" value={String(!term.is_active)} /><button type="submit" title={term.is_active ? "Desactivar clasificación" : "Activar clasificación"} aria-label={term.is_active ? `Desactivar ${term.name}` : `Activar ${term.name}`} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#dedfd3] bg-transparent text-[#566055] transition-colors hover:bg-[#e9eadf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Power size={16} strokeWidth={1.7} /></button></form><button type="button" title="Eliminar clasificación" aria-label={`Eliminar ${term.name}`} onClick={() => setDeleteTarget(term)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-300 bg-rose-100 text-rose-800 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"><Trash2 size={16} strokeWidth={1.7} /></button></div>
                  ) : (
                    <div className="w-full min-w-[320px] rounded-xl border border-border bg-background p-4 text-left">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">Editar {term.name}</p>
                        <button type="button" onClick={() => setEditingId(null)} className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted">Cancelar</button>
                      </div>
                      <form action={updateTaxonomyTerm} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <input type="hidden" name="id" value={term.id} />
                        <div><label htmlFor={"term-name-" + term.id} className="text-xs font-medium">Nombre</label><input id={"term-name-" + term.id} name="name" required defaultValue={term.name} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm" /></div>
                        <div><label htmlFor={"term-slug-" + term.id} className="text-xs font-medium">Slug</label><input id={"term-slug-" + term.id} name="slug" required defaultValue={term.slug} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm" /></div>
                        <div><label htmlFor={"term-parent-" + term.id} className="text-xs font-medium">Depende de</label><select id={"term-parent-" + term.id} name="parent_id" defaultValue={term.parent_id ?? ""} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm"><option value="">Nivel principal</option>{terms.filter((candidate) => candidate.category_id === term.category_id && candidate.id !== term.id).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select><p className="mt-1 text-[11px] text-muted-foreground">Solo opciones de la misma categoría.</p></div>
                        <div><label htmlFor={"term-order-" + term.id} className="text-xs font-medium">Orden</label><input id={"term-order-" + term.id} name="sort_order" type="number" min="0" step="1" required defaultValue={term.sort_order} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm" /></div>
                        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 xl:col-span-4">
                          <button type="submit" className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">Guardar cambios</button>
                          <button type="button" onClick={() => setEditingId(null)} className="h-9 rounded-lg border border-border px-4 text-sm hover:bg-muted">Cancelar</button>
                        </div>
                      </form>
                      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-3">
                        <span className="text-xs text-muted-foreground">Usa los iconos de la fila para editar, activar/desactivar o eliminar.</span>
                      </div>
                    </div>
                  )}
                </td>           </tr>
            ))}
            {filteredTerms.length === 0 && <tr><td colSpan={5} className="px-3 py-10 text-center text-sm text-muted-foreground">No hay opciones que coincidan con la búsqueda y el filtro.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Desactivar conserva la opción y sus relaciones. La eliminación definitiva se evaluará después de comprobar las dependencias con productos.</p>
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteTarget(null); }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-taxonomy-title" className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">!</div>
              <div>
                <h3 id="delete-taxonomy-title" className="text-base font-semibold">¿Seguro que deseas eliminar esta clasificación?</h3>
                <p className="mt-2 text-sm text-muted-foreground">Vas a eliminar definitivamente <strong className="text-foreground">{deleteTarget.name}</strong>. Esta acción no se puede deshacer.</p>
                <p className="mt-2 text-sm text-muted-foreground">Solo se podrá eliminar si no tiene productos ni subclasificaciones asignados.</p>
              </div>
            </div>
            {deleteState.error && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><p className="font-semibold">No se pudo eliminar la clasificación</p><p className="mt-1">{deleteState.error}</p></div>}
            <form action={deleteAction} className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <input type="hidden" name="id" value={deleteTarget.id} />
              <button type="button" onClick={() => setDeleteTarget(null)} className="h-10 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted">Cancelar</button>
              <button type="submit" disabled={isDeleting} className="h-10 rounded-lg bg-red-700 px-4 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">{isDeleting ? "Eliminando…" : "Sí, eliminar"}</button>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
