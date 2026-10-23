"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AccountLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (signInError) { setError("El correo o la contraseña no son correctos."); return; }
      router.replace("/cuenta"); router.refresh();
    } catch { setError("Ocurrió un problema de conexión. Inténtalo nuevamente."); }
    finally { setLoading(false); }
  }
  const inputClass = "mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
  return <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-background p-6 shadow-sm"><div className="space-y-5">
    {searchParams.get("passwordUpdated") === "1" && <div role="status" className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm">Tu contraseña se actualizó correctamente. Inicia sesión con tu nueva contraseña.</div>}
    <div><label htmlFor="email" className="text-sm font-medium">Correo electrónico</label><input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="tu-correo@ejemplo.com" /></div>
    <div><label htmlFor="password" className="text-sm font-medium">Contraseña</label><input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" /></div>
    <div className="text-right"><Link href={`/cuenta/recuperar?email=${encodeURIComponent(email.trim())}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">¿Olvidaste tu contraseña?</Link></div>
    {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
    <button type="submit" disabled={loading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader2 size={18} className="animate-spin" />Iniciando sesión...</> : <><LogIn size={18} />Iniciar sesión</>}</button>
    <div className="border-t pt-5 text-center"><p className="text-sm text-muted-foreground">¿Aún no tienes una cuenta?</p><Link href="/cuenta/registro" className="mt-1 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">Crear una cuenta</Link></div>
  </div></form>;
}