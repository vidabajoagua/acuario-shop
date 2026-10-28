import Link from "next/link";

import { ArrowLeft, Package, Truck } from "lucide-react";

import { getProductBySlug } from "@/lib/catalog/products";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductGallery } from "@/components/product/product-gallery";
export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
        <div className="text-center">
          <Package
            className="mx-auto text-primary"
            size={48}
          />

          <h1 className="mt-5 text-3xl font-semibold">
            Producto no encontrado
          </h1>

          <p className="mt-3 text-muted-foreground">
            El producto que buscas no está disponible.
          </p>

          <Link
            href="/tienda"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground"
          >
            <ArrowLeft size={18} />
            Volver a la tienda
          </Link>
        </div>
      </main>
    );
  }

  const stock =
  product.inventory?.quantity ?? 0;

const compareAtPrice =
  product.compare_at_price;

const hasComparePrice =
  compareAtPrice !== null &&
  compareAtPrice > product.price;

  function formatAttributeValue(value: unknown): string {
    if (value === null || value === undefined || value === "") return "";
    if (typeof value === "boolean") return value ? "Sí" : "No";
    if (typeof value === "number" || typeof value === "string") return String(value);
    if (Array.isArray(value)) return value.map((item) => String(item)).join(", ");
    if (typeof value === "object" && "min" in value && "max" in value) {
      const range = value as { min: unknown; max: unknown };
      return `${String(range.min)}–${String(range.max)}`;
    }
    return "";
  }

  const visibleAttributes = (product.attributes ?? [])
    .map((attribute) => ({ ...attribute, formattedValue: formatAttributeValue(attribute.value) }))
    .filter((attribute) => attribute.formattedValue !== "");

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
        <Link
          href="/tienda"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Volver a la tienda
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          {/* Galería */}
      <ProductGallery
        productName={product.name}
        images={product.images}
          />

          {/* Información */}
          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              {product.categories?.name ?? "Sin categoría"}
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              {product.name}
            </h1>

            {product.brand && (
              <p className="mt-3 text-sm text-muted-foreground">
                Marca: {product.brand}
              </p>
            )}

            <div className="mt-8">
              <p className="text-3xl font-semibold">
                ${product.price.toFixed(2)}
              </p>

              {hasComparePrice && (
                <p className="mt-1 text-sm text-muted-foreground line-through">
                  ${compareAtPrice.toFixed(2)}
                </p>
              )}
            </div>

            <div className="my-8 h-px bg-border" />

            <p className="text-base leading-8 text-muted-foreground">
              {product.description ??
                product.short_description ??
                ""}
            </p>

            {visibleAttributes.length > 0 && (
              <section className="mt-8 rounded-2xl border border-border p-5">
                <h2 className="text-lg font-semibold">Características y cuidados</h2>
                <dl className="mt-4 divide-y divide-border">
                  {visibleAttributes.map((attribute) => (
                    <div key={attribute.id} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-2 sm:gap-4">
                      <dt className="text-sm text-muted-foreground">{attribute.name}</dt>
                      <dd className="text-sm font-medium">
                        {attribute.formattedValue}{attribute.unit ? ` ${attribute.unit}` : ""}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <div className="mt-8 space-y-4">
              {/* Stock */}
              <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                <Package
                  size={20}
                  className="text-primary"
                />

                <div>
                  <p className="text-sm font-medium">
                    Disponibilidad
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {stock > 0
                      ? `${stock} unidades disponibles`
                      : "Agotado"}
                  </p>
                </div>
              </div>

              {/* Envíos */}
              <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                <Truck
                  size={20}
                  className="text-primary"
                />

                <div>
                  <p className="text-sm font-medium">
                    Envíos en Ecuador
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Consulta disponibilidad y cobertura.
                  </p>
                </div>
              </div>
            </div>

            <AddToCartButton
              productId={product.id}
              productName={product.name}
              disabled={stock === 0}
            />
          </div>
        </div>
      </section>
    </main>
  );
}