import Link from "next/link";
import {
  ArrowRight,
  Package,
} from "lucide-react";

import type { CatalogProduct } from "@/types/catalog";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({
  product,
}: ProductCardProps) {
  const hasDiscount =
    product.compare_at_price !== null &&
    product.compare_at_price > product.price;

  const stock =
    product.inventory?.quantity ?? 0;

  const primaryImage =
    product.images
      ?.filter((image) => image.is_primary)
      .sort(
        (a, b) => a.sort_order - b.sort_order,
      )[0] ??
    product.images
      ?.slice()
      .sort(
        (a, b) => a.sort_order - b.sort_order,
      )[0];

  return (
<article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">      <Link href={`/producto/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={
                primaryImage.alt_text ??
                product.name
              }
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
              <Package
                size={42}
                strokeWidth={1.2}
                className="text-primary/50"
              />

              <span className="mt-3 text-xs">
                Imagen próximamente
              </span>
            </div>
          )}

          {product.is_featured && (
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Destacado
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-primary">
          {product.categories?.name ??
            "Sin categoría"}
        </p>

        <Link href={`/producto/${product.slug}`}>
          <h2 className="mt-2 text-lg font-semibold tracking-tight transition-colors hover:text-primary">
            {product.name}
          </h2>
        </Link>

        <p className="mt-2 h-12 line-clamp-2 overflow-hidden text-sm leading-6 text-muted-foreground">
            {product.short_description ??
            product.description ??
            ""}
        </p>

       <div className="mt-auto flex min-h-14 items-end justify-between gap-4 pt-5">
          <div>
            {hasDiscount && (
              <p className="text-sm text-muted-foreground line-through">
                $
                {product.compare_at_price?.toFixed(
                  2,
                )}
              </p>
            )}

            <p className="text-xl font-semibold text-foreground">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <Link
            href={`/producto/${product.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-transform group-hover:translate-x-0.5"
          >
            Ver producto
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-4 min-h-9 border-t border-border pt-3 text-xs text-muted-foreground">
          {stock > 0
            ? `${stock} disponibles`
            : "Agotado"}
        </div>
      </div>
    </article>
  );
}