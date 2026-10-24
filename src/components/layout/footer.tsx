import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-8">
        <div>
          <h3 className="text-lg font-semibold text-primary">
            VidaBajoAgua
          </h3>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Todo para crear, cuidar y disfrutar tu mundo acuático.
          </p>
        </div>

        <div>
          <h4 className="font-medium">Tienda</h4>

          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/tienda">Todos los productos</Link>
            <Link href="/tienda?categoria=plantas">Plantas</Link>
            <Link href="/tienda?categoria=accesorios">Accesorios</Link>
            <Link href="/tienda?categoria=iluminacion">
              Iluminación
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-medium">Ayuda</h4>

          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/envios">Envíos</Link>
            <Link href="/pagos">Métodos de pago</Link>
            <Link href="/faq">Preguntas frecuentes</Link>
            <Link href="/contacto">Contacto</Link>
          </div>
        </div>

        <div>
          <h4 className="font-medium">Información</h4>

          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/nosotros">Nosotros</Link>
            <Link href="/guias">Guías</Link>
            <Link href="/politicas">Políticas</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 VidaBajoAgua. Todos los derechos reservados.</p>

          <p>Ecuador 🇪🇨</p>
        </div>
      </div>
    </footer>
  );
}