import Link from "next/link";
import { Check, Grid2X2, Sprout, Waves, type LucideIcon } from "lucide-react";

import type { ProductCategory } from "@/types/catalog";

type CategoryFilterProps = {
  categories: ProductCategory[];
  selectedCategory?: string;
  searchTerm?: string;
};

function getCategoryStyle(name: string): { icon: LucideIcon; tone: string; active: string } {
  const normalized = name.toLowerCase();
  if (/plant|flora|vegetal|musgo/.test(normalized)) {
    return {
      icon: Sprout,
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100",
      active: "border-emerald-700 bg-emerald-700 text-white shadow-md shadow-emerald-900/15",
    };
  }
  if (/ilumin|luz|led/.test(normalized)) {
    return {
      icon: Waves,
      tone: "border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-300 hover:bg-sky-100",
      active: "border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-900/15",
    };
  }
  return {
    icon: Waves,
    tone: "border-cyan-200 bg-cyan-50 text-cyan-800 hover:border-cyan-300 hover:bg-cyan-100",
    active: "border-cyan-700 bg-cyan-700 text-white shadow-md shadow-cyan-900/15",
  };
}

export function CategoryFilter({ categories, selectedCategory, searchTerm }: CategoryFilterProps) {
  function getCategoryHref(slug?: string) {
    const params = new URLSearchParams();
    if (slug) params.set("categoria", slug);
    if (searchTerm) params.set("busqueda", searchTerm);
    const query = params.toString();
    return query ? `/tienda?${query}` : "/tienda";
  }

  return (
    <div>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Link
          href={getCategoryHref()}
          aria-current={!selectedCategory ? "page" : undefined}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
            !selectedCategory
              ? "border-emerald-950 bg-emerald-950 text-white shadow-md shadow-emerald-950/15"
              : "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 hover:border-emerald-300 hover:from-emerald-100 hover:to-teal-100"
          }`}
        >
          <Grid2X2 size={16} strokeWidth={2.2} />
          Todos
          {!selectedCategory && <Check size={14} className="ml-0.5" />}
        </Link>

        {categories.map((category) => {
          const isSelected = selectedCategory === category.slug;
          const style = getCategoryStyle(category.name);
          const Icon = style.icon;
          return (
            <Link
              key={category.id}
              href={getCategoryHref(category.slug)}
              aria-current={isSelected ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
                isSelected ? style.active : style.tone
              }`}
            >
              <Icon size={16} strokeWidth={2.1} />
              {category.name}
              {isSelected && <Check size={14} className="ml-0.5" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
