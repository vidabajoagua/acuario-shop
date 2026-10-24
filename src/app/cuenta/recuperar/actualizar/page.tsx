"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck, Waves } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError("El enlace puede haber vencido o no ser válido. Solicita uno nuevo e inténtalo nuevamente.");
        return;
      }
      router.replace("/cuenta/login?passwordUpdated=1");
      router.refresh();
    } catch {
      setError("Ocurrió un problema de conexión. Solicita un nuevo enlace e inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <section className="relative w-full max-w-md">
        <Link href="/cuenta/login" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft size={16} /> Volver a iniciar sesión
        </Link>

        <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-xl shadow-black/5">
          <div className="bg-primary/[0.06] px-8 pb-7 pt-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <LockKeyhole size={26} strokeWidth={1.8} />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary">VidaBajoAgua</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Crea una nueva contraseña</h1>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
              Elige una contraseña segura para volver a acceder a tu cuenta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-7 sm:p-8">
            <div>
              <label htmlFor="password" className="text-sm font-medium">Nueva contraseña</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} placeholder="Mínimo 8 caracteres" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition hover:text-foreground">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Usa al menos 8 caracteres.</p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="text-sm font-medium">Confirmar contraseña</label>
              <div className="relative">
                <input id="confirm-password" name="confirm_password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} placeholder="Repite la nueva contraseña" />
                <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition hover:text-foreground">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p className={`mt-2 flex items-center gap-1.5 text-xs ${password === confirmPassword ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {password === confirmPassword && <CheckCircle2 size={14} />}
                  {password === confirmPassword ? "Las contraseñas coinciden" : "Las contraseñas deben coincidir"}
                </p>
              )}
            </div>

            {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

            <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:opacity-90 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <><Loader2 size={18} className="animate-spin" />Actualizando contraseña...</> : <><LockKeyhole size={18} />Guardar nueva contraseña</>}
            </button>

            <div className="flex items-start justify-center gap-2 border-t border-border pt-5 text-center text-xs leading-5 text-muted-foreground">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>Tu contraseña se actualiza de forma segura mediante Supabase.</span>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
