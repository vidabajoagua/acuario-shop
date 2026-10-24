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
    const matchesCategory =
      !selectedCategory || product.categories?.slug === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.sku?.toLowerCase().includes(searchTerm) ||
      product.short_description?.toLowerCase().includes(searchTerm) ||
      product.categories?.name.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const selectedCategoryData = categories.find(
    (category) => category.slug === selectedCategory,
  );
  const categoryLabel =
    selectedCategoryData?.name ?? selectedCategory ?? "Todos los productos";

  return (
    <div className="min-h-screen">
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                VidaBajoAgua
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                Nuestra tienda
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Encuentra todo para tu mundo acuático.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredProducts.length}</span>{" "}
              {filteredProducts.length === 1 ? "producto disponible" : "productos disponibles"}
            </p>
          </div>
        </div>
      </section>

      <section className="py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Explorar catálogo
              </p>
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                searchTerm={params.busqueda}
              />
            </div>
            <div className="w-full lg:max-w-sm">
              <CatalogSearch
                products={products}
                value={params.busqueda}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>

          <div className="mb-5 flex items-end justify-between gap-3 border-b border-border/70 pb-3">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              {searchTerm
                ? `Resultados para "${params.busqueda}"`
                : selectedCategory
                  ? `Productos de ${categoryLabel}`
                  : "Todos los productos"}
            </h2>
            <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">
              {filteredProducts.length} {filteredProducts.length === 1 ? "artículo" : "artículos"}
            </span>
          </div>

          <ProductGrid products={filteredProducts} />
        </div>
      </section>
    </div>
  );
}
