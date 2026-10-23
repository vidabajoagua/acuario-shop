"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RecoverPasswordPage() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSent(false); setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/cuenta/recuperar/actualizar")}`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
      if (resetError) { setError("No pudimos procesar la solicitud. Verifica el correo e inténtalo nuevamente."); return; }
      setSent(true);
    } catch { setError("Ocurrió un problema de conexión. Inténtalo nuevamente."); }
    finally { setLoading(false); }
  }
  const inputClass = "mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
  return <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16"><div className="w-full max-w-md">
    <div className="mb-8 text-center"><p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">VidaBajoAgua</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Recuperar contraseña</h1><p className="mt-3 text-sm text-muted-foreground">Te enviaremos un enlace para crear una contraseña nueva.</p></div>
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-background p-6 shadow-sm"><div className="space-y-5">
      <div><label htmlFor="email" className="text-sm font-medium">Correo electrónico</label><input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="tu-correo@ejemplo.com" /></div>
      {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      {sent && <div role="status" className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm">Si existe una cuenta asociada a ese correo, recibirás un enlace para recuperar el acceso. Revisa también la carpeta de correo no deseado.</div>}
      <button type="submit" disabled={loading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader2 size={18} className="animate-spin" />Enviando...</> : <><Mail size={18} />Enviar enlace de recuperación</>}</button>
      <div className="border-t pt-5 text-center"><Link href="/cuenta/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">Volver a iniciar sesión</Link></div>
    </div></form>
  </div></main>;
}