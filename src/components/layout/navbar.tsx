"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";

import { CartButton } from "@/components/cart/cart-button";
import { AccountMenu } from "@/components/account/account-menu";
import { CatalogSearch } from "@/components/catalog/catalog-search";
import type { CatalogProduct } from "@/types/catalog";

const navigation = [
  { href: "/", label: "Inicio", matches: (path: string) => path === "/" },
  { href: "/tienda", label: "Tienda", matches: (path: string) => path === "/tienda" || path.startsWith("/producto/") },
  { href: "/guias", label: "Guías", matches: (path: string) => path === "/guias" || path.startsWith("/guias/") },
  { href: "/nosotros", label: "Nosotros", matches: (path: string) => path === "/nosotros" || path.startsWith("/nosotros/") },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [products, setProducts] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      try {
        const response = await fetch("/api/catalog/products", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setProducts(data ?? []);
      } catch {
        // La navegación sigue disponible si el catálogo no responde.
      }
    }
    loadProducts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  return (
    <header className="relative z-30 border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-4 md:gap-6">
          <Link href="/" className="shrink-0 text-xl font-semibold tracking-tight text-primary">
            VidaBajoAgua
          </Link>

          <nav aria-label="Navegación principal" className="hidden h-full items-center gap-1 md:flex">
            {navigation.map((item) => {
              const active = item.matches(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-full items-center px-4 text-sm font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[3px] after:rounded-t-full after:transition-all after:duration-200 ${
                    active
                      ? "text-emerald-800 after:bg-emerald-600"
                      : "text-foreground/80 after:bg-transparent hover:text-emerald-800 hover:after:bg-emerald-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <div className="hidden w-44 md:block lg:w-52">
              <CatalogSearch products={products} compact />
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen((open) => !open);
                setMobileMenuOpen(false);
              }}
              className="rounded-full p-2 transition-colors hover:bg-muted md:hidden"
              aria-label={mobileSearchOpen ? "Cerrar búsqueda" : "Buscar productos"}
            >
              {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            <AccountMenu />
            <CartButton />

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen((open) => !open);
                setMobileSearchOpen(false);
              }}
              className="rounded-full p-2 transition-colors hover:bg-muted md:hidden"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="border-t border-border py-3 md:hidden">
            <CatalogSearch products={products} />
          </div>
        )}

        {mobileMenuOpen && (
          <div className="border-t border-border py-3 md:hidden">
            <nav aria-label="Navegación móvil" className="flex flex-col gap-1">
              {navigation.map((item) => {
                const active = item.matches(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-xl border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                        : "border-transparent text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
