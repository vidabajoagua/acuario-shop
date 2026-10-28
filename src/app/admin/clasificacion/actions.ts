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
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  if (!id || !name || !slug) throw new Error("Nombre y slug son obligatorios.");
  if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("El orden debe ser un entero no negativo.");

  const { error } = await supabase.from("product_taxonomy_terms")
    .update({ name, slug, sort_order: sortOrder })
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
