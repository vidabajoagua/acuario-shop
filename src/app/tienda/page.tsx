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
    <div className="min-h-screen">
      <section className="relative isolate overflow-hidden border-b border-emerald-950/10 bg-gradient-to-br from-emerald-50 via-[#f8f7ef] to-cyan-50">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full bg-teal-300/25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-3 md:px-8 md:py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/10 bg-white/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-900">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                VidaBajoAgua · tienda acuática
              </p>
              <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-emerald-950 md:text-2xl">
                Dale vida a tu acuario.
              </h1>
              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-600 md:text-sm">
                Plantas, iluminación y esenciales para crear tu propio mundo bajo el agua.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/80 bg-white/75 px-3 py-2 shadow-sm backdrop-blur">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <span className="text-lg">✦</span>
              </span>
              <div>
                <p className="text-base font-semibold leading-4 text-emerald-950">{filteredProducts.length}</p>
                <p className="mt-0.5 text-[10px] text-slate-600">{filteredProducts.length === 1 ? "producto disponible" : "productos disponibles"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 border-b border-border/80 bg-background/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:px-8 lg:flex-row lg:items-center lg:justify-between">
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
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Encuentra tus favoritos</p>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
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
    </div>
  );
}
