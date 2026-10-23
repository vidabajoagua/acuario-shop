"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (password !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) { setError("El enlace puede haber vencido o no ser válido. Solicita uno nuevo e inténtalo nuevamente."); return; }
      router.replace("/cuenta/login?passwordUpdated=1"); router.refresh();
    } catch { setError("Ocurrió un problema de conexión. Solicita un nuevo enlace e inténtalo nuevamente."); }
    finally { setLoading(false); }
  }
  const inputClass = "mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
  return <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16"><div className="w-full max-w-md">
    <div className="mb-8 text-center"><p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">VidaBajoAgua</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Crear contraseña nueva</h1><p className="mt-3 text-sm text-muted-foreground">Elige una contraseña segura para recuperar tu cuenta.</p></div>
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-background p-6 shadow-sm"><div className="space-y-5">
      <div><label htmlFor="password" className="text-sm font-medium">Nueva contraseña</label><input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Mínimo 8 caracteres" /></div>
      <div><label htmlFor="confirm-password" className="text-sm font-medium">Confirmar contraseña</label><input id="confirm-password" name="confirm_password" type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} placeholder="Repite la nueva contraseña" /></div>
      {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      <button type="submit" disabled={loading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader2 size={18} className="animate-spin" />Actualizando...</> : <><LockKeyhole size={18} />Guardar nueva contraseña</>}</button>
      <div className="border-t pt-5 text-center"><Link href="/cuenta/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">Volver a iniciar sesión</Link></div>
    </div></form>
  </div></main>;
}