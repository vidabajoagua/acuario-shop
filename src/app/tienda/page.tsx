import { CategoryFilter } from "@/components/catalog/category-filter";
import { CatalogSearch } from "@/components/catalog/catalog-search";
import { ProductGrid } from "@/components/product/product-grid";
import { getCategories, getProducts } from "@/lib/catalog/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tienda",
  description:
    "Explora plantas, iluminación, filtración, sustratos y accesorios para tu acuario.",
};

type TiendaPageProps = {
  searchParams: Promise<{
    categoria?: string;
    busqueda?: string;
  }>;
};

export default async function TiendaPage({ searchParams }: TiendaPageProps) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const selectedCategory = params.categoria;
  const searchTerm = params.busqueda?.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.categories?.slug === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.sku?.toLowerCase().includes(searchTerm) ||
      product.short_description?.toLowerCase().includes(searchTerm) ||
      product.categories?.name.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const selectedCategoryData = categories.find((category) => category.slug === selectedCategory);
  const categoryLabel = selectedCategoryData?.name ?? selectedCategory ?? "Todos los productos";

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(75,130,104,0.16),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(51,133,166,0.14),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-5 md:px-6 md:py-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
                VidaBajoAgua · Tienda de acuariofilia
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-4xl">
                Dale vida a tu acuario.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                Plantas, iluminación y esenciales para crear tu propio mundo bajo el agua.
              </p>
            </div>
            <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-border/80 bg-card/80 px-3 py-2 shadow-sm backdrop-blur">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <span className="text-lg">✦</span>
              </span>
              <div>
                <p className="text-base font-semibold leading-4">{filteredProducts.length}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {filteredProducts.length === 1 ? "producto disponible" : "productos disponibles"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 border-b border-border/80 bg-background/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Explora por categoría
            </p>
            <CategoryFilter categories={categories} selectedCategory={selectedCategory} searchTerm={params.busqueda} />
          </div>
          <div className="w-full lg:max-w-sm">
            <CatalogSearch products={products} value={params.busqueda} selectedCategory={selectedCategory} />
          </div>
        </div>
      </section>

      <section className="py-7 md:py-9">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Encuentra tus favoritos</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                {searchTerm
                  ? `Resultados para "${params.busqueda}"`
                  : selectedCategory
                    ? `Productos de ${categoryLabel}`
                    : "Descubre el catálogo"}
              </h2>
            </div>
            <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? "artículo" : "artículos"}
            </span>
          </div>
          <ProductGrid products={filteredProducts} />
        </div>
      </section>
    </main>
  );
}
