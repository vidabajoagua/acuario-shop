"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("Solo un administrador puede gestionar atributos.");
  return supabase;
}

function slugify(value: string) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function createAttributeDefinition(formData: FormData) {
  const supabase = await requireAdmin();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const dataType = String(formData.get("data_type") ?? "text");
  const unit = String(formData.get("unit") ?? "").trim();
  const rawOptions = String(formData.get("options") ?? "").trim();
  const isRequired = formData.get("is_required") === "on";
  const isFilterable = formData.get("is_filterable") === "on";
  const showOnProductPage = formData.get("show_on_product_page") === "on";
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const allowedTypes = ["text","number","boolean","select","multiselect","range"];
  if (!categoryId || !name || !slug) throw new Error("Categoría, nombre y slug son obligatorios.");
  if (!allowedTypes.includes(dataType)) throw new Error("Tipo de atributo no válido.");
  if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("El orden debe ser un entero no negativo.");
  const options = rawOptions ? rawOptions.split("\n").map((v) => v.trim()).filter(Boolean) : [];
  if (["select","multiselect"].includes(dataType) && options.length < 1) throw new Error("Los atributos de selección necesitan al menos una opción, una por línea.");
  if (!["select","multiselect"].includes(dataType) && options.length) throw new Error("Solo los tipos de selección admiten opciones.");
  const { error } = await supabase.from("product_attribute_definitions").insert({
    category_id: categoryId, name, slug, data_type: dataType, unit: unit || null,
    options, is_required: isRequired, is_filterable: isFilterable,
    show_on_product_page: showOnProductPage, sort_order: sortOrder,
  });
  if (error?.code === "23505") throw new Error("Ya existe un atributo con ese slug en esta categoría.");
  if (error) throw new Error("No se pudo guardar el atributo.");
  revalidatePath("/admin/atributos");
  revalidatePath("/admin/productos/nuevo");
  redirect("/admin/atributos");
}

export async function toggleAttributeStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) throw new Error("Atributo inválido.");
  const { error } = await supabase.from("product_attribute_definitions")
    .update({ is_active: active, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error("No se pudo cambiar el estado del atributo.");
  revalidatePath("/admin/atributos");
  revalidatePath("/admin/productos/nuevo");
  redirect("/admin/atributos");
}

export async function updateAttributeDefinition(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const dataType = String(formData.get("data_type") ?? "text");
  const unit = String(formData.get("unit") ?? "").trim();
  const rawOptions = String(formData.get("options") ?? "").trim();
  const isRequired = formData.get("is_required") === "on";
  const isFilterable = formData.get("is_filterable") === "on";
  const showOnProductPage = formData.get("show_on_product_page") === "on";
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const allowedTypes = ["text","number","boolean","select","multiselect","range"];
  if (!id || !categoryId || !name || !slug) throw new Error("ID, categoría, nombre y slug son obligatorios.");
  if (!allowedTypes.includes(dataType)) throw new Error("Tipo de atributo no válido.");
  if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("El orden debe ser un entero no negativo.");
  const options = rawOptions ? rawOptions.split("\n").map((v) => v.trim()).filter(Boolean) : [];
  if (["select","multiselect"].includes(dataType) && options.length < 1) throw new Error("Los atributos de selección necesitan al menos una opción, una por línea.");
  if (!["select","multiselect"].includes(dataType) && options.length) throw new Error("Solo los tipos de selección admiten opciones.");
  const { error } = await supabase.from("product_attribute_definitions").update({
    category_id: categoryId, name, slug, data_type: dataType, unit: unit || null,
    options, is_required: isRequired, is_filterable: isFilterable,
    show_on_product_page: showOnProductPage, sort_order: sortOrder, updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error?.code === "23505") throw new Error("Ya existe un atributo con ese slug en esta categoría.");
  if (error) throw new Error("No se pudo actualizar el atributo.");
  revalidatePath("/admin/atributos");
  revalidatePath("/admin/productos/nuevo");
  revalidatePath("/tienda");
  redirect("/admin/atributos?notice=updated");
}
