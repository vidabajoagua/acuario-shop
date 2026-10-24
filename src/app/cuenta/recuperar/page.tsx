"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail, ShieldCheck, Waves } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get("email") ?? "");
    setInvalidLink(params.get("error") === "link-invalido");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSent(false);
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/cuenta/recuperar/actualizar")}`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo },
      );
      if (resetError) {
        setError("No pudimos procesar la solicitud. Verifica tu correo e inténtalo nuevamente.");
        return;
      }
      setSent(true);
    } catch {
      setError("Ocurrió un problema de conexión. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <section className="relative w-full max-w-md">
        <Link href="/tienda" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft size={16} /> Volver a la tienda
        </Link>

        <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-xl shadow-black/5">
          <div className="bg-primary/[0.06] px-8 pb-7 pt-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Waves size={27} strokeWidth={1.8} />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary">VidaBajoAgua</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Recupera tu cuenta</h1>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
              No te preocupes. Te enviaremos un enlace seguro para que puedas crear una nueva contraseña.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-7 sm:p-8">
            {invalidLink && (
              <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-5 text-foreground">
                El enlace de recuperación no es válido o ya venció. Solicita uno nuevo aquí.
              </div>
            )}

            {sent ? (
              <div role="status" className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-5 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <h2 className="mt-3 font-semibold">Revisa tu correo</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Si existe una cuenta asociada a ese correo, recibirás un enlace para recuperar el acceso. Revisa también la carpeta de spam.
                </p>
                <button type="button" onClick={() => setSent(false)} className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Enviar otra solicitud
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="email" className="text-sm font-medium">Correo electrónico</label>
                  <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="tu-correo@ejemplo.com" />
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">Usa el correo con el que creaste tu cuenta.</p>
                </div>

                {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

                <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:opacity-90 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? <><Loader2 size={18} className="animate-spin" />Enviando enlace...</> : <><Mail size={18} />Enviar enlace de recuperación</>}
                </button>
              </>
            )}

            <div className="flex items-start justify-center gap-2 border-t border-border pt-5 text-center text-xs leading-5 text-muted-foreground">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>Por seguridad, no indicamos si un correo está registrado.</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              ¿Recordaste tu contraseña?{" "}
              <Link href="/cuenta/login" className="font-semibold text-primary underline-offset-4 hover:underline">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
