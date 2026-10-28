import Link from "next/link";
import {
  ArrowLeft,
  Package,
} from "lucide-react";
import { notFound } from "next/navigation";

import { ImageManager } from "./image-manager";

import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "./actions";
import { ProductTaxonomyFields } from "../../product-taxonomy-fields";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // Obtener producto
  const { data: product, error: productError } =
    await supabase
      .from("products")
      .select(`
        id,
        category_id,
        taxonomy_term_id,
        name,
        slug,
        short_description,
        description,
        brand,
        sku,
        price,
        compare_at_price,
        is_active,
        is_featured
      `)
      .eq("id", id)
      .maybeSingle();

  if (productError) {
    throw new Error(
      `No se pudo cargar el producto: ${productError.message}`,
    );
  }

  if (!product) {
    notFound();
  }

  // Obtener categorías
  const {
    data: categories,
    error: categoriesError,
  } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (categoriesError) {
    throw new Error(
      `No se pudieron cargar las categorías: ${categoriesError.message}`,
    );
  }

  const { data: taxonomyTerms, error: taxonomyError } = await supabase
    .from("product_taxonomy_terms")
    .select("id, category_id, parent_id, name, slug, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (taxonomyError) {
    throw new Error(`No se pudo cargar la clasificación de productos: ${taxonomyError.message}`);
  }

  const { data: attributeDefinitions, error: attributesError } = await supabase
    .from("product_attribute_definitions")
    .select("id, category_id, name, slug, data_type, unit, options, is_required, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (attributesError) {
    throw new Error(`No se pudieron cargar los atributos del catálogo: ${attributesError.message}`);
  }

  // Obtener inventario
  const { data: inventory } =
  await supabase
    .from("inventory")
    .select("quantity")
    .eq("product_id", id)
    .maybeSingle();

const stock = inventory?.quantity ?? 0;

const { data: productImages, error: imagesError } =
  await supabase
    .from("product_images")
    .select(`
      id,
      product_id,
      storage_path,
      alt_text,
      sort_order,
      is_primary,
      created_at
    `)
    .eq("product_id", id)
    .order("sort_order", {
      ascending: true,
    });

if (imagesError) {
  throw new Error(
    `No se pudieron cargar las imágenes: ${imagesError.message}`,
  );
}

const images = (productImages ?? []).map((image) => ({
  ...image,
  url: supabase.storage
    .from("product-images")
    .getPublicUrl(image.storage_path)
    .data.publicUrl,
}));

const { data: existingAttributeValues, error: attributeValuesError } = await supabase
  .from("product_attribute_values")
  .select("attribute_id, value")
  .eq("product_id", id);
if (attributeValuesError) {
  throw new Error(`No se pudieron cargar los atributos del producto: ${attributeValuesError.message}`);
}
const initialAttributeValues = Object.fromEntries((existingAttributeValues ?? []).map((item) => [item.attribute_id, item.value]));


  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Encabezado */}
      <div>
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Volver a productos
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package size={24} />

          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Catálogo
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Editar producto
            </h1>
          </div>
        </div>

        <p className="mt-4 text-muted-foreground">
          Modifica la información de este producto.
        </p>
      </div>

      <form
        action={updateProduct.bind(
          null,
          product.id,
        )}
        className="space-y-6"
      >
        {/* Información principal */}
        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Información del producto
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Datos principales que verá el cliente.
            </p>
          </div>

          <div className="grid gap-5">
            {/* Nombre */}
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium"
              >
                Nombre *
              </label>

              <input
                id="name"
                name="name"
                required
                defaultValue={product.name}
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="text-sm font-medium"
              >
                Slug
              </label>

              <input
                id="slug"
                name="slug"
                defaultValue={product.slug}
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <p className="mt-1 text-xs text-muted-foreground">
                Se utiliza en la URL del producto.
              </p>
            </div>

            <ProductTaxonomyFields
              categories={categories ?? []}
              terms={taxonomyTerms ?? []}
              attributes={attributeDefinitions ?? []}
              initialAttributeValues={initialAttributeValues}
              initialCategoryId={product.category_id}
              initialTermId={product.taxonomy_term_id}
            />

            {/* Marca / SKU */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="brand"
                  className="text-sm font-medium"
                >
                  Marca
                </label>

                <input
                  id="brand"
                  name="brand"
                  defaultValue={
                    product.brand ?? ""
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="sku"
                  className="text-sm font-medium"
                >
                  SKU
                </label>

                <input
                  id="sku"
                  name="sku"
                  defaultValue={
                    product.sku ?? ""
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Descripción */}
        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Descripción
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Información que verá el cliente.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="short_description"
                className="text-sm font-medium"
              >
                Descripción corta
              </label>

              <textarea
                id="short_description"
                name="short_description"
                rows={3}
                defaultValue={
                  product.short_description ??
                  ""
                }
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Descripción completa
              </label>

              <textarea
                id="description"
                name="description"
                rows={6}
                defaultValue={
                  product.description ?? ""
                }
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </section>

        {/* Precio e inventario */}
        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Precio e inventario
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Modifica el precio y la existencia actual.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Precio */}
            <div>
              <label
                htmlFor="price"
                className="text-sm font-medium"
              >
                Precio *
              </label>

              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  defaultValue={product.price}
                  className="h-11 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Precio anterior */}
            <div>
              <label
                htmlFor="compare_at_price"
                className="text-sm font-medium"
              >
                Precio anterior
              </label>

              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>

                <input
                  id="compare_at_price"
                  name="compare_at_price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={
                    product.compare_at_price ??
                    ""
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="stock"
                className="text-sm font-medium"
              >
                Stock *
              </label>

              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={stock}
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </section>

        {/* Visibilidad */}
        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Visibilidad
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Controla cómo aparecerá el producto en la tienda.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={
                  product.is_active
                }
                className="mt-1 h-4 w-4 rounded border-border"
              />

              <span>
                <span className="block text-sm font-medium">
                  Producto activo
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  El producto podrá aparecer en la tienda.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={
                  product.is_featured
                }
                className="mt-1 h-4 w-4 rounded border-border"
              />

              <span>
                <span className="block text-sm font-medium">
                  Producto destacado
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  Marca el producto como destacado.
                </span>
              </span>
            </label>
          </div>
        </section>

<ImageManager
  productId={product.id}
  productSlug={product.slug}
  images={images}
/>

        {/* Acciones */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/admin/productos"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}