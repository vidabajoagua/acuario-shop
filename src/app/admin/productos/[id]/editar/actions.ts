"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function updateProduct(
  productId: string,
  formData: FormData,
) {
  const supabase = await createClient();

  // Verificar sesión
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado.");
  }

  // Verificar rol
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    throw new Error(
      "No tienes permisos para editar productos.",
    );
  }

  // Obtener datos
  const name = String(
    formData.get("name") ?? "",
  ).trim();

  const slugInput = String(
    formData.get("slug") ?? "",
  ).trim();

  const categoryId = String(
    formData.get("category_id") ?? "",
  ).trim();

  const taxonomyTermId = String(
    formData.get("taxonomy_term_id") ?? "",
  ).trim() || null;

  const shortDescription = String(
    formData.get("short_description") ?? "",
  ).trim();

  const description = String(
    formData.get("description") ?? "",
  ).trim();

  const brand = String(
    formData.get("brand") ?? "",
  ).trim();

  const sku = String(
    formData.get("sku") ?? "",
  ).trim();

  const price = Number(
    formData.get("price"),
  );

  const compareAtPriceRaw = String(
    formData.get("compare_at_price") ?? "",
  ).trim();

  const compareAtPrice =
    compareAtPriceRaw !== ""
      ? Number(compareAtPriceRaw)
      : null;

  const stock = Number(
    formData.get("stock"),
  );

  const isActive =
    formData.get("is_active") === "on";

  const isFeatured =
    formData.get("is_featured") === "on";

  const slug = normalizeSlug(
    slugInput || name,
  );

  // Validaciones
  if (!productId) {
    throw new Error("Producto inválido.");
  }

  if (!name) {
    throw new Error(
      "El nombre del producto es obligatorio.",
    );
  }

  if (!categoryId) {
    throw new Error(
      "Debes seleccionar una categoría.",
    );
  }

  if (taxonomyTermId) {
    const { data: taxonomyTerm, error: taxonomyTermError } = await supabase
      .from("product_taxonomy_terms")
      .select("id, category_id")
      .eq("id", taxonomyTermId)
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .maybeSingle();

    if (taxonomyTermError || !taxonomyTerm) {
      throw new Error("La clasificación seleccionada no es válida para esta categoría.");
    }
  }

  if (!slug) {
    throw new Error(
      "El slug del producto no es válido.",
    );
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error(
      "El precio no es válido.",
    );
  }

  if (
    compareAtPrice !== null &&
    (!Number.isFinite(compareAtPrice) ||
      compareAtPrice < 0)
  ) {
    throw new Error(
      "El precio anterior no es válido.",
    );
  }

  if (
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    throw new Error(
      "El stock debe ser un número entero mayor o igual a 0.",
    );
  }

  // Comprobar slug duplicado
  const { data: existingSlug } =
    await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .neq("id", productId)
      .maybeSingle();

  if (existingSlug) {
    throw new Error(
      `Ya existe otro producto con el slug "${slug}".`,
    );
  }

  // Actualizar producto
  const { error: productError } =
    await supabase
      .from("products")
      .update({
        category_id: categoryId,
        taxonomy_term_id: taxonomyTermId,
        name,
        slug,
        short_description:
          shortDescription || null,
        description:
          description || null,
        brand: brand || null,
        sku: sku || null,
        price,
        compare_at_price: compareAtPrice,
        is_active: isActive,
        is_featured: isFeatured,
      })
      .eq("id", productId);

  if (productError) {
    console.error(
      "Error actualizando producto:",
      productError,
    );

    throw new Error(
      `No se pudo actualizar el producto: ${productError.message}`,
    );
  }

  // Buscar inventario existente
  const { data: existingInventory } =
    await supabase
      .from("inventory")
      .select("id")
      .eq("product_id", productId)
      .maybeSingle();

  if (existingInventory) {
    // Actualizar stock
    const { error: inventoryError } =
      await supabase
        .from("inventory")
        .update({
          quantity: stock,
        })
        .eq("id", existingInventory.id);

    if (inventoryError) {
      throw new Error(
        `El producto se actualizó, pero no se pudo actualizar el inventario: ${inventoryError.message}`,
      );
    }
  } else {
    // Crear inventario si no existe
    const { error: inventoryError } =
      await supabase
        .from("inventory")
        .insert({
          product_id: productId,
          quantity: stock,
        });

    if (inventoryError) {
      throw new Error(
        `El producto se actualizó, pero no se pudo crear el inventario: ${inventoryError.message}`,
      );
    }
  }

  // Actualizar páginas relacionadas
  revalidatePath("/admin/productos");
  revalidatePath("/tienda");
  revalidatePath(`/producto/${slug}`);

  redirect("/admin/productos");
}