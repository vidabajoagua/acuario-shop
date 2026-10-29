"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(value: string) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("Solo un administrador puede gestionar marcas.");
  return supabase;
}

export async function createBrand(formData: FormData) {
  const supabase = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const description = String(formData.get("description") ?? "").trim();
  const websiteUrl = String(formData.get("website_url") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  if (!name || !slug) throw new Error("Nombre de marca obligatorio.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("El slug no es válido.");
  if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("El orden debe ser un entero no negativo.");
  if (websiteUrl && !/^https?:\/\//i.test(websiteUrl)) throw new Error("La web debe comenzar con http:// o https://.");
  const { error } = await supabase.from("brands").insert({
    name, slug, description: description || null, website_url: websiteUrl || null, sort_order: sortOrder,
  });
  if (error?.code === "23505") throw new Error("Ya existe una marca con ese nombre o slug.");
  if (error) throw new Error("No se pudo guardar la marca.");
  revalidatePath("/admin/marcas");
  revalidatePath("/admin/productos/nuevo");
  redirect("/admin/marcas");
}

export async function toggleBrandStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) throw new Error("Marca inválida.");
  const { error } = await supabase.from("brands").update({ is_active: active, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error("No se pudo cambiar el estado de la marca.");
  revalidatePath("/admin/marcas");
  revalidatePath("/admin/productos/nuevo");
  redirect("/admin/marcas");
}

export async function updateBrand(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const description = String(formData.get("description") ?? "").trim();
  const websiteUrl = String(formData.get("website_url") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  if (!id || !name || !slug) throw new Error("ID, nombre y slug son obligatorios.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("El slug no es válido.");
  if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("El orden debe ser un entero no negativo.");
  if (websiteUrl && !/^https?:\/\//i.test(websiteUrl)) throw new Error("La web debe comenzar con http:// o https://.");
  const { error } = await supabase.from("brands").update({
    name, slug, description: description || null, website_url: websiteUrl || null,
    sort_order: sortOrder, updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error?.code === "23505") throw new Error("Ya existe otra marca con ese nombre o slug.");
  if (error) throw new Error("No se pudo actualizar la marca.");
  revalidatePath("/admin/marcas");
  revalidatePath("/admin/productos/nuevo");
  revalidatePath("/tienda");
  redirect("/admin/marcas?notice=updated");
}
