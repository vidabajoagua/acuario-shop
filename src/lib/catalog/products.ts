import { createClient } from "@/lib/supabase/server";
import type {
  CatalogProduct,
  ProductCategory,
} from "@/types/catalog";

const BUCKET_NAME = "product-images";

const productSelect = `
  id,
  category_id,
  taxonomy_term_id,
  taxonomy:product_taxonomy_terms!products_taxonomy_term_id_fkey (
    id, category_id, parent_id, name, slug, sort_order
  ),
  name,
  slug,
  short_description,
  description,
  brand,
  sku,
  price,
  compare_at_price,
  is_active,
  is_featured,
  created_at,
  updated_at,

  categories (
    id,
    name,
    slug
  ),

  inventory (
    quantity
  ),

  images:product_images (
    id,
    product_id,
    storage_path,
    alt_text,
    sort_order,
    is_primary,
    created_at
  )
`;

function normalizeProduct(
  product: CatalogProduct,
  supabase: Awaited<ReturnType<typeof createClient>>,
): CatalogProduct {
  return {
    ...product,
    images: (product.images ?? []).map((image) => ({
      ...image,
      url: supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(image.storage_path).data.publicUrl,
    })),
  };
}

export async function getProducts(): Promise<CatalogProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("is_active", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `No se pudieron cargar los productos: ${error.message}`,
    );
  }

  return (data ?? []).map((product) =>
    normalizeProduct(
      product as unknown as CatalogProduct,
      supabase,
    ),
  );
}

export async function getProductBySlug(
  slug: string,
): Promise<CatalogProduct | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo cargar el producto: ${error.message}`,
    );
  }

  if (!data) {
    return null;
  }

  const { data: attributeValues, error: attributeValuesError } = await supabase
    .from("product_attribute_values")
    .select("attribute_id, value")
    .eq("product_id", data.id);

  if (attributeValuesError) {
    throw new Error(`No se pudieron cargar las características del producto: ${attributeValuesError.message}`);
  }

  const attributeIds = (attributeValues ?? []).map((item) => item.attribute_id);
  let attributes: NonNullable<CatalogProduct["attributes"]> = [];

  if (attributeIds.length > 0) {
    const { data: definitions, error: definitionsError } = await supabase
      .from("product_attribute_definitions")
      .select("id, name, unit, data_type")
      .in("id", attributeIds)
      .eq("is_active", true)
      .eq("show_on_product_page", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (definitionsError) {
      throw new Error(`No se pudieron cargar las características visibles: ${definitionsError.message}`);
    }

    const valuesByAttribute = new Map((attributeValues ?? []).map((item) => [item.attribute_id, item.value]));
    attributes = (definitions ?? []).map((definition) => ({
      ...definition,
      value: valuesByAttribute.get(definition.id),
    }));
  }

  return {
    ...normalizeProduct(data as unknown as CatalogProduct, supabase),
    attributes,
  };
}
export async function getCategories(): Promise<ProductCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug
    `)
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `No se pudieron cargar las categorías: ${error.message}`,
    );
  }

  return (data ?? []) as ProductCategory[];
}