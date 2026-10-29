"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function normalizeSlug(value: string) {
  return value.trim().toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function createTaxonomyTerm(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const { data: profile } = await supabase.from("profiles")
    .select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("Solo un administrador puede gestionar la clasificación.");

  const categoryId = String(formData.get("category_id") ?? "").trim();
  const parentId = String(formData.get("parent_id") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  const slug = normalizeSlug(String(formData.get("slug") ?? "").trim() || name);
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!categoryId || !name || !slug) throw new Error("Categoría, nombre y slug son obligatorios.");
  if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("El orden debe ser un entero no negativo.");

  if (parentId) {
    const { data: parent, error } = await supabase.from("product_taxonomy_terms")
      .select("id, category_id").eq("id", parentId).eq("category_id", categoryId).maybeSingle();
    if (error || !parent) throw new Error("El nivel superior debe pertenecer a la misma categoría.");
  }

  const { error } = await supabase.from("product_taxonomy_terms").insert({
    category_id: categoryId, parent_id: parentId, name, slug, sort_order: sortOrder,
  });
  if (error) {
    if (error.code === "23505") throw new Error("Ya existe una clasificación con ese slug en ese nivel.");
    throw new Error(`No se pudo guardar la clasificación: ${error.message}`);
  }

  revalidatePath("/admin/clasificacion");
  revalidatePath("/admin/productos/nuevo");
  redirect("/admin/clasificacion");
}


async function requireTaxonomyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");
  const { data: profile } = await supabase.from("profiles")
    .select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("Solo un administrador puede gestionar la clasificación.");
  return supabase;
}

export async function updateTaxonomyTerm(formData: FormData) {
  const supabase = await requireTaxonomyAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = normalizeSlug(String(formData.get("slug") ?? "").trim() || name);
  const parentId = String(formData.get("parent_id") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  if (!id || !name || !slug) throw new Error("Nombre y slug son obligatorios.");
  if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("El orden debe ser un entero no negativo.");

  const { data: currentTerm, error: currentTermError } = await supabase
    .from("product_taxonomy_terms").select("id,category_id").eq("id", id).maybeSingle();
  if (currentTermError || !currentTerm) throw new Error("No se encontró la clasificación que deseas editar.");

  if (parentId) {
    if (parentId === id) throw new Error("Una opción no puede depender de sí misma.");
    const { data: parent, error: parentError } = await supabase
      .from("product_taxonomy_terms").select("id,category_id,parent_id").eq("id", parentId).maybeSingle();
    if (parentError || !parent || parent.category_id !== currentTerm.category_id) {
      throw new Error("El nivel superior debe pertenecer a la misma categoría.");
    }
    let ancestorId: string | null = parent.id;
    const visited = new Set<string>();
    while (ancestorId) {
      if (ancestorId === id) throw new Error("No puedes asignar una opción dentro de sus propios niveles descendientes.");
      if (visited.has(ancestorId)) throw new Error("Se detectó un ciclo en la clasificación; revisa sus niveles.");
      visited.add(ancestorId);
      const { data: ancestor, error: ancestorError } = await supabase
        .from("product_taxonomy_terms").select("parent_id").eq("id", ancestorId).maybeSingle();
      if (ancestorError) throw new Error("No se pudo validar la jerarquía de la clasificación.");
      ancestorId = ancestor?.parent_id ?? null;
    }
  }

  const { error } = await supabase.from("product_taxonomy_terms")
    .update({ name, slug, sort_order: sortOrder, parent_id: parentId })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") throw new Error("Ya existe una clasificación con ese slug en ese nivel.");
    throw new Error(`No se pudo actualizar la clasificación: ${error.message}`);
  }
  revalidatePath("/admin/clasificacion");
  revalidatePath("/admin/productos/nuevo");
  redirect("/admin/clasificacion");
}

export async function setTaxonomyTermActive(formData: FormData) {
  const supabase = await requireTaxonomyAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) throw new Error("Falta la clasificación que deseas actualizar.");

  const { error } = await supabase.from("product_taxonomy_terms")
    .update({ is_active: active }).eq("id", id);
  if (error) throw new Error(`No se pudo cambiar el estado: ${error.message}`);
  revalidatePath("/admin/clasificacion");
  revalidatePath("/admin/productos/nuevo");
  redirect("/admin/clasificacion");
}

export async function deleteTaxonomyTerm(formData: FormData) {
  const supabase = await requireTaxonomyAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Falta la clasificación que deseas eliminar.");

  const { count: assignedProducts, error: productsError } = await supabase
    .from("products").select("id", { count: "exact", head: true }).eq("taxonomy_term_id", id);
  if (productsError) throw new Error("No se pudo comprobar si hay productos asignados; no se eliminó la opción.");
  if ((assignedProducts ?? 0) > 0) throw new Error("No se puede eliminar: hay productos asignados a esta clasificación. Desactívala o reasigna esos productos primero.");

  const { count: childTerms, error: childrenError } = await supabase
    .from("product_taxonomy_terms").select("id", { count: "exact", head: true }).eq("parent_id", id);
  if (childrenError) throw new Error("No se pudo comprobar si tiene subclasificaciones; no se eliminó la opción.");
  if ((childTerms ?? 0) > 0) throw new Error("No se puede eliminar: esta opción tiene subclasificaciones. Reasigna o elimina primero sus niveles inferiores.");

  const { error } = await supabase.from("product_taxonomy_terms").delete().eq("id", id);
  if (error) throw new Error(`No se pudo eliminar la clasificación: ${error.message}`);

  revalidatePath("/admin/clasificacion");
  revalidatePath("/admin/productos/nuevo");
  redirect("/admin/clasificacion");
}

