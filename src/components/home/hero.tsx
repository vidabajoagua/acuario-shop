import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/hero-aquascape.webp"
          alt="Aquascape plantado de VidaBajoAgua"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/45 to-transparent" />

      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background/30 via-transparent to-transparent" />

      <div className="mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-12 sm:min-h-[560px] md:px-8 md:py-14 lg:min-h-[600px]">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Naturaleza que{" "}
            <span className="text-primary">cobra vida.</span>
          </h1>

          <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg md:mt-4 md:text-xl">
            Todo para crear, cuidar y disfrutar tu mundo acuático.
            Descubre plantas, equipamiento y accesorios seleccionados
            para llevar tu acuario a otro nivel.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-6">
            <Link
              href="/tienda"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-medium text-primary-foreground shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Explorar tienda
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/tienda?categoria=plantas"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background/70 px-6 py-3.5 font-medium backdrop-blur-md transition hover:bg-background"
            >
              Descubrir plantas
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground sm:text-sm md:mt-7">
            <span>🌿 Plantas</span>
            <span>💧 Equipamiento</span>
            <span>🇪🇨 Envíos en Ecuador</span>
          </div>
        </div>
      </div>
    </section>
  );
}
