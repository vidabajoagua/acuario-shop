import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Tags,
  Image,
  ListTree,
  SlidersHorizontal,
  Store,
  LogOut,
  ClipboardList,
  Truck,
  CreditCard,
  BookOpen,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Productos",
    href: "/admin/productos",
    icon: Package,
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    icon: ClipboardList,
  },
  {
    href: "/admin/envios",
    label: "Envíos",
    icon: Truck,
  },
  {
    href: "/admin/pagos",
    label: "Pagos",
    icon: CreditCard,
  },
  {
    label: "Inventario",
    href: "/admin/inventario",
    icon: Boxes,
  },
  {
    label: "Guías",
    href: "/admin/guias",
    icon: BookOpen,
    children: [
      {
        label: "Categorías",
        href: "/admin/guias/categorias",
      },
    ],
  },
  {
    label: "Catálogo maestro",
    href: "/admin/categorias",
    icon: Tags,
    children: [
      { label: "Categorías", href: "/admin/categorias" },
      { label: "Marcas", href: "/admin/marcas" },
      { label: "Clasificaciones", href: "/admin/clasificacion" },
      { label: "Atributos por categoría", href: "/admin/atributos" },
    ],
  },
  {
    label: "Imágenes",
    href: "/admin/imagenes",
    icon: Image,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const adminName =
    [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ") || "Administrador";

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-border px-6 py-5">
              <Link
                href="/"
                className="text-xl font-semibold tracking-tight"
              >
                VidaBajoAgua
              </Link>

              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Administración
              </p>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>

                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="ml-7 flex items-center rounded-lg border-l border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </nav>

            <div className="border-t border-border p-4">
              <div className="mb-3 rounded-xl bg-muted px-4 py-3">
                <p className="text-sm font-medium">
                  {adminName}
                </p>

                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>

              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Store size={18} />
                Ver tienda
              </Link>
              <LogoutButton
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              />
            </div>
          </div>
        </aside>

        {/* Contenido */}
        <div className="min-w-0 flex-1">
          <header className="border-b border-border bg-background">
            <div className="flex h-16 items-center justify-between px-4 md:px-8">
              <div>
                <p className="text-sm font-medium">
                  Panel de administración
                </p>

                <p className="hidden text-xs text-muted-foreground sm:block">
                  Gestiona tu catálogo de VidaBajoAgua
                </p>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <Store size={16} />
                <span className="hidden sm:inline">
                  Ver tienda
                </span>
              </Link>
            </div>
          </header>

          <main className="p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}