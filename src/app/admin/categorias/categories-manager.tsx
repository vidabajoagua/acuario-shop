"use client";

import { useState } from "react";
import {
  Check,
  Edit3,
  Image as ImageIcon,
  Loader2,
  Plus,
  Power,
  Trash2,
  X,
} from "lucide-react";

import {
  createCategory,
  deleteCategory,
  toggleCategoryStatus,
  updateCategory,
} from "./category-actions";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";


type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  product_count: number;
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
};

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  is_active: true,
  sort_order: 0,
};

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoriesManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null,
  );
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryToDelete, setCategoryToDelete] =
    useState<Category | null>(null);

  function openCreateForm() {
    setEditingCategory(null);
    setForm({
      ...EMPTY_FORM,
      sort_order:
        categories.length > 0
          ? Math.max(...categories.map((category) => category.sort_order)) + 1
          : 1,
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image_url: category.image_url ?? "",
      is_active: category.is_active,
      sort_order: category.sort_order,
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: editingCategory ? current.slug : createSlug(value),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const result = editingCategory
      ? await updateCategory(editingCategory.id, form)
      : await createCategory(form);

    if (!result.success) {
      setError(result.message);
      setSaving(false);
      return;
    }

    if (result.category) {
      const updatedCategory = {
        ...result.category,
        product_count: editingCategory?.product_count ?? 0,
      };

      setCategories((current) => {
        if (editingCategory) {
          return current
            .map((category) =>
              category.id === updatedCategory.id
                ? updatedCategory
                : category,
            )
            .sort(
              (a, b) =>
                a.sort_order - b.sort_order ||
                a.name.localeCompare(b.name),
            );
        }

        return [...current, updatedCategory].sort(
          (a, b) =>
            a.sort_order - b.sort_order || a.name.localeCompare(b.name),
        );
      });
    }

    setSuccess(result.message);
    setSaving(false);
    setShowForm(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
  }

  async function handleToggleStatus(category: Category) {
    setLoadingId(category.id);
    setError("");
    setSuccess("");

    const result = await toggleCategoryStatus(
      category.id,
      !category.is_active,
    );

    if (!result.success) {
      setError(result.message);
      setLoadingId(null);
      return;
    }

    if (result.category) {
      setCategories((current) =>
        current.map((item) =>
          item.id === category.id
            ? {
                ...item,
                is_active: result.category!.is_active,
                updated_at: result.category!.updated_at,
              }
            : item,
        ),
      );
    }

    setSuccess(result.message);
    setLoadingId(null);
  }

  async function handleDelete() {
    if (!categoryToDelete) return;

    setLoadingId(categoryToDelete.id);
    setError("");
    setSuccess("");

    const result = await deleteCategory(categoryToDelete.id);

    if (!result.success) {
      setError(result.message);
      setLoadingId(null);
      setCategoryToDelete(null);
      return;
    }

    setCategories((current) =>
      current.filter((category) => category.id !== categoryToDelete.id),
    );

    setSuccess(result.message);
    setLoadingId(null);
    setCategoryToDelete(null);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      {!showForm && (
        <div className="flex justify-end">
          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva categoría
          </Button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-sans text-xl font-semibold tracking-tight">
                {editingCategory
                  ? "Editar categoría"
                  : "Nueva categoría"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Define la información que utilizará la tienda para organizar
                los productos.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={closeForm}
              disabled={saving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="category-name"
                className="text-sm font-medium"
              >
                Nombre
              </label>

              <input
                id="category-name"
                value={form.name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleNameChange(event.target.value)
                }
                placeholder="Ej. Plantas"
                disabled={saving}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category-slug"
                className="text-sm font-medium"
              >
                Slug
              </label>

              <input
                id="category-slug"
                value={form.slug}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((current) => ({
                    ...current,
                    slug: createSlug(event.target.value),
                    }))
                }
                placeholder="plantas"
                disabled={saving}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />

              <p className="text-xs text-muted-foreground">
                Se utiliza en las URLs de la tienda.
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="category-description"
                className="text-sm font-medium"
              >
                Descripción
              </label>

              <textarea
                id="category-description"
                value={form.description}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setForm((current) => ({
                    ...current,
                    description: event.target.value,
                    }))
                }
                placeholder="Describe brevemente esta categoría."
                rows={4}
                disabled={saving}
                className="flex min-h-20 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="category-image"
                className="text-sm font-medium"
              >
                Imagen
              </label>

              <input
                id="category-image"
                type="url"
                value={form.image_url}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((current) => ({
                    ...current,
                    image_url: event.target.value,
                    }))
                }
                placeholder="https://..."
                disabled={saving}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />

              <p className="text-xs text-muted-foreground">
                Por ahora utilizaremos una URL de imagen.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category-order"
                className="text-sm font-medium"
              >
                Orden de aparición
              </label>

              <input
                id="category-order"
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((current) => ({
                    ...current,
                    sort_order: Number(event.target.value) || 0,
                    }))
                }
                disabled={saving}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <div className="flex items-center gap-3 self-end pb-2">
              <input
                id="category-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_active: event.target.checked,
                  }))
                }
                disabled={saving}
                className="h-4 w-4 rounded border-input"
              />

              <label
                htmlFor="category-active"
                className="text-sm font-medium"
              >
                Categoría activa
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingCategory ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-sans text-lg font-semibold tracking-tight">
            Categorías
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length}{" "}
            {categories.length === 1 ? "categoría registrada" : "categorías registradas"}
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>

            <h3 className="font-sans text-base font-semibold">
              No hay categorías
            </h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Crea la primera categoría para comenzar a organizar el catálogo.
            </p>

            <Button className="mt-5" onClick={openCreateForm}>
              <Plus className="mr-2 h-4 w-4" />
              Crear categoría
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-sans font-semibold tracking-tight">
                        {category.name}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          category.is_active
                            ? "bg-emerald-200 text-emerald-950"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {category.is_active ? "Activa" : "Inactiva"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      /{category.slug}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {category.product_count}{" "}
                        {category.product_count === 1
                          ? "producto"
                          : "productos"}
                      </span>

                      <span>Orden {category.sort_order}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditForm(category)}
                    className="rounded-xl border border-sky-300 bg-sky-100 text-sky-800 hover:bg-sky-200 hover:text-sky-950"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleToggleStatus(category)}
                    disabled={loadingId === category.id}
                    className={
                        category.is_active
                        ? "rounded-xl border border-emerald-300 bg-emerald-200 text-emerald-950 hover:bg-emerald-300 hover:text-emerald-950"
                        : "rounded-xl border border-amber-300 bg-amber-200 text-amber-950 hover:bg-amber-300 hover:text-amber-950"
                    }
                  >
                    {loadingId === category.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Power className="mr-2 h-4 w-4" />
                    )}

                    {category.is_active ? "Desactivar" : "Activar"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCategoryToDelete(category)}
                    disabled={
                      category.product_count > 0 ||
                      loadingId === category.id
                    }
                    className="rounded-xl border border-rose-300 bg-rose-100 text-rose-800 hover:bg-rose-200 hover:text-rose-950 disabled:border-border disabled:bg-muted disabled:text-muted-foreground"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open && !loadingId) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-lg font-semibold tracking-tight">
              Eliminar categoría
            </AlertDialogTitle>

            <AlertDialogDescription>
              ¿Seguro que deseas eliminar esta categoría?
            </AlertDialogDescription>

            {categoryToDelete && (
              <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4">
                <p className="font-medium">{categoryToDelete.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  /{categoryToDelete.slug}
                </p>
              </div>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
              Esta acción no se puede deshacer.
            </p>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(loadingId)}>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={Boolean(loadingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loadingId === categoryToDelete?.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Eliminar categoría
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}