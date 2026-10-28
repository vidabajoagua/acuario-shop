"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


async function saveProductAttributeValues(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  productId: string,
  categoryId: string,
  formData: FormData,
) {
  const { data: definitions, error: definitionsError } = await supabase
    .from("product_attribute_definitions")
    .select("id, name, data_type, is_required, options")
    .eq("category_id", categoryId)
    .eq("is_active", true);
  if (definitionsError) throw new Error("No se pudieron validar los atributos del producto.");

  const values: { product_id: string; attribute_id: string; value: unknown }[] = [];
  for (const definition of definitions ?? []) {
    const key = `attribute_${definition.id}`;
    const submitted = formData.getAll(key).map((item) => String(item).trim()).filter(Boolean);
    if (definition.is_required && submitted.length === 0) {
      throw new Error(`El atributo "${definition.name}" es obligatorio.`);
    }
    if (submitted.length === 0) continue;
    let value: unknown;
    if (definition.data_type === "multiselect") {
      const allowed = Array.isArray(definition.options) ? definition.options : [];
      if (submitted.some((item) => !allowed.includes(item))) throw new Error(`Opción no válida para "${definition.name}".`);
      value = submitted;
    } else {
      const raw = submitted[0];
      if (definition.data_type === "select") {
        const allowed = Array.isArray(definition.options) ? definition.options : [];
        if (!allowed.includes(raw)) throw new Error(`Opción no válida para "${definition.name}".`);
        value = raw;
      } else if (definition.data_type === "number") {
        const numeric = Number(raw);
        if (!Number.isFinite(numeric)) throw new Error(`El atributo "${definition.name}" debe ser numérico.`);
        value = numeric;
      } else if (definition.data_type === "boolean") {
        if (raw !== "true" && raw !== "false") throw new Error(`Valor no válido para "${definition.name}".`);
        value = raw === "true";
      } else if (definition.data_type === "range") {
        const match = raw.match(/^\s*(-?\d+(?:\.\d+)?)\s*(?:-|–|a)\s*(-?\d+(?:\.\d+)?)\s*$/i);
        if (!match) throw new Error(`Usa un rango válido para "${definition.name}", por ejemplo 22-28.`);
        const min = Number(match[1]); const max = Number(match[2]);
        if (min > max) throw new Error(`El rango de "${definition.name}" debe empezar por el valor menor.`);
        value = { min, max };
      } else value = raw;
    }
    values.push({ product_id: productId, attribute_id: definition.id, value });
  }

  const { error: deleteError } = await supabase.from("product_attribute_values")
    .delete().eq("product_id", productId)
    .not("attribute_id", "in", `(${(definitions ?? []).map((d) => d.id).join(",")})`);
  if (deleteError && (definitions ?? []).length > 0) throw new Error("No se pudieron sincronizar los atributos del producto.");
  if (values.length) {
    const { error } = await supabase.from("product_attribute_values").upsert(values, { onConflict: "product_id,attribute_id" });
    if (error) throw new Error(`No se pudieron guardar las características: ${error.message}`);
  }
}

export async function createProduct(formData: FormData) {
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
    throw new Error("No tienes permisos para crear productos.");
  }

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
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

  const price = Number(formData.get("price"));

  const compareAtPriceRaw = String(
    formData.get("compare_at_price") ?? "",
  ).trim();

  const compareAtPrice = compareAtPriceRaw
    ? Number(compareAtPriceRaw)
    : null;

  const stock = Number(formData.get("stock"));

  const isActive =
    formData.get("is_active") === "on";

  const isFeatured =
    formData.get("is_featured") === "on";

  const slug = normalizeSlug(
    slugInput || name,
  );

  // Validaciones
  if (!name) {
    throw new Error("El nombre del producto es obligatorio.");
  }

  if (!categoryId) {
    throw new Error("Debes seleccionar una categoría.");
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
    throw new Error("El slug del producto no es válido.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("El precio no es válido.");
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

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error(
      "El stock debe ser un número entero mayor o igual a 0.",
    );
  }

  // Comprobar slug existente
  const { data: existingSlug } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingSlug) {
    throw new Error(
      `Ya existe un producto con el slug "${slug}".`,
    );
  }

  // Crear producto
  const { data: product, error: productError } =
    await supabase
      .from("products")
      .insert({
        category_id: categoryId,
        taxonomy_term_id: taxonomyTermId,
        name,
        slug,
        short_description:
          shortDescription || null,
        description: description || null,
        brand: brand || null,
        sku: sku || null,
        price,
        compare_at_price: compareAtPrice,
        is_active: isActive,
        is_featured: isFeatured,
      })
      .select("id")
      .single();

  if (productError || !product) {
    console.error(
      "Error creando producto:",
      productError,
    );

    throw new Error(
      productError?.message ??
        "No se pudo crear el producto.",
    );
  }

  try {
    await saveProductAttributeValues(supabase, product.id, categoryId, formData);
  } catch (attributeError) {
    await supabase.from("products").delete().eq("id", product.id);
    throw attributeError;
  }

  // Crear inventario
  const { error: inventoryError } =
    await supabase
      .from("inventory")
      .insert({
        product_id: product.id,
        quantity: stock,
      });

  if (inventoryError) {
    console.error(
      "Error creando inventario:",
      inventoryError,
    );

    // Intentar limpiar el producto creado
    await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    throw new Error(
      `Producto creado pero no se pudo crear el inventario: ${inventoryError.message}`,
    );
  }

  redirect("/admin/productos");
}