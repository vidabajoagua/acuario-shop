import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Fish,
  Waves,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const sections = [
  {
    title: "Biblioteca",
    description:
      "Guías prácticas sobre ciclado, habitantes, mantenimiento, plantas y aquascaping.",
    href: "/guias/biblioteca",
    icon: BookOpen,
    tone: "from-emerald-600/90 via-emerald-500/80 to-teal-400/80",
    iconBg: "bg-white/95 text-emerald-700",
    label: "Leer y aprender",
  },
  {
    title: "Herramientas",
    description:
      "Calculadoras para convertir medidas y tomar decisiones antes de montar tu acuario.",
    href: "/guias/herramientas",
    icon: Calculator,
    tone: "from-sky-600/90 via-cyan-500/80 to-blue-400/80",
    iconBg: "bg-white/95 text-sky-700",
    label: "Calcular",
  },
  {
    title: "Primer acuario",
    description:
      "Empieza por los fundamentos: montaje, agua, filtración y estabilidad biológica.",
    href: "/guias/biblioteca?categoria=ciclado",
    icon: Waves,
    tone: "from-violet-600/90 via-purple-500/80 to-fuchsia-400/80",
    iconBg: "bg-white/95 text-violet-700",
    label: "Empezar",
  },
  {
    title: "Plantas y habitantes",
    description:
      "Explora la biblioteca por categorías y encuentra temas específicos para tu montaje.",
    href: "/guias/biblioteca",
    icon: Fish,
    tone: "from-amber-500/95 via-orange-400/85 to-rose-400/80",
    iconBg: "bg-white/95 text-amber-700",
    label: "Explorar temas",
  },
];

export default async function GuiasPage() {
  const supabase = await createClient();

  const { data: featuredGuides, error } = await supabase
    .from("guides")
    .select("id, slug, title, category:guide_categories(name)")
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(4);

  if (error) throw new Error(error.message);

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(75,130,104,0.16),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(51,133,166,0.14),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              VidaBajoAgua · Centro de conocimiento
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-4xl">
              Aprende. Calcula. Diseña.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
              Todo lo que necesitas para entender mejor tu acuario, reunido en un solo lugar.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.title}
                  href={section.href}
                  className="group overflow-hidden rounded-3xl border border-white/50 bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={"relative flex h-24 items-center justify-center overflow-hidden bg-gradient-to-br sm:h-28 " + section.tone}>
                    <div className="absolute -right-8 -top-10 size-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-12 -left-8 size-36 rounded-full bg-black/5" />
                    <div className={"relative flex size-12 items-center justify-center rounded-full shadow-lg " + section.iconBg}>
                      <Icon className="size-5" strokeWidth={1.8} />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-base font-semibold tracking-tight">{section.title}</h2>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                      {section.description}
                    </p>
                    <span className="mt-3 inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                      {section.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Destacadas
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Empieza por aquí
            </h2>
          </div>
          <Link
            href="/guias/biblioteca"
            className="hidden items-center gap-1 text-sm font-medium text-primary sm:flex"
          >
            Ver biblioteca
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {(featuredGuides ?? []).length > 0 ? (
          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(featuredGuides ?? []).map((guide) => {
              const category = Array.isArray(guide.category)
                ? guide.category[0]
                : guide.category;

              return (
                <Link
                  key={guide.id}
                  href={"/guias/" + guide.slug}
                  className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/25 hover:shadow-sm"
                >
                  <p className="text-xs uppercase tracking-[0.14em] text-primary">
                    {category?.name}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-5">
                    {guide.title}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Leer
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <Link
            href="/guias/biblioteca"
            className="mt-6 block rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
          >
            Explora la biblioteca para encontrar la primera guía que necesitas.
          </Link>
        )}
      </section>
    </main>
  );
}
