import Link from "next/link";
import { Heart, Leaf, ShieldCheck, Waves } from "lucide-react";

const values = [
  {
    icon: Leaf,
    title: "Pasión por lo natural",
    text: "Nos inspira la belleza de los acuarios plantados y el equilibrio entre plantas, agua, luz y vida.",
  },
  {
    icon: Waves,
    title: "Aprender y compartir",
    text: "Queremos que cada persona encuentre información práctica para tomar mejores decisiones en el cuidado de su acuario.",
  },
  {
    icon: ShieldCheck,
    title: "Compra clara",
    text: "Buscamos explicar con transparencia las características de los productos, los pagos y las condiciones de entrega.",
  },
  {
    icon: Heart,
    title: "Acompañamiento",
    text: "La experiencia no termina con la compra: queremos ayudarte a elegir y cuidar mejor tu pequeño ecosistema.",
  },
];

export const metadata = {
  title: "Nosotros",
  description: "Conoce la propuesta y los valores de VidaBajoAgua.",
};

export default function NosotrosPage() {
  return (
    <main className="min-h-[60vh] bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(75,130,104,0.16),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(51,133,166,0.14),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              Nuestra esencia · VidaBajoAgua
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-4xl">
              Creamos espacio para la vida bajo el agua.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
              VidaBajoAgua es un espacio para descubrir plantas, equipamiento y accesorios para acuarios, con una experiencia de compra sencilla y contenido que acompaña a los aficionados en cada etapa.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="grid gap-3 sm:grid-cols-2">
          {values.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/25"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Icon size={22} strokeWidth={1.8} />
              </span>
              <h2 className="mt-4 font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-emerald-950 p-6 text-white md:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            Un acuario se construye con conocimiento y cuidado.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            Por eso reunimos una tienda y un centro de guías: para que encuentres productos útiles y recursos que te ayuden a utilizarlos responsablemente.
          </p>
          <Link
            href="/guias"
            className="mt-4 inline-flex rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-50"
          >
            Explorar guías
          </Link>
        </div>
      </section>
    </main>
  );
}
