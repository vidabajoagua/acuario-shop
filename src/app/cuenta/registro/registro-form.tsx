"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AccountRegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setRegisteredEmail("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { first_name: firstName.trim(), last_name: lastName.trim() } },
      });

      const alreadyRegistered =
        data.user?.identities?.length === 0 ||
        Boolean(signUpError && /already registered|already exists|user already|email.*(taken|registered|exists)|duplicate/i.test(signUpError.message));

      if (alreadyRegistered) {
        setRegisteredEmail(normalizedEmail);
        setPassword("");
        setConfirmPassword("");
        return;
      }
      if (signUpError) {
        setError("No pudimos completar el registro. Verifica los datos e inténtalo nuevamente.");
        return;
      }
      if (data.session) {
        router.replace("/cuenta");
        router.refresh();
        return;
      }
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch {
      setError("Ocurrió un problema de conexión. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-background p-6 shadow-sm">
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="first-name" className="text-sm font-medium">Nombre</label><input id="first-name" name="first_name" autoComplete="given-name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} placeholder="Fernando" /></div>
          <div><label htmlFor="last-name" className="text-sm font-medium">Apellido</label><input id="last-name" name="last_name" autoComplete="family-name" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} placeholder="Saltos" /></div>
        </div>
        <div><label htmlFor="email" className="text-sm font-medium">Correo electrónico</label><input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="tu-correo@ejemplo.com" /></div>
        <div><label htmlFor="password" className="text-sm font-medium">Contraseña</label><input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Mínimo 6 caracteres" /></div>
        <div><label htmlFor="confirm-password" className="text-sm font-medium">Confirmar contraseña</label><input id="confirm-password" name="confirm_password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} placeholder="Repite tu contraseña" /></div>
        {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
        {registeredEmail && <div role="alert" className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm"><p className="font-semibold">Esta cuenta ya está registrada</p><p>El correo electrónico ya está asociado a una cuenta. Puedes iniciar sesión o recuperar tu contraseña si la olvidaste.</p><div className="flex flex-wrap gap-x-4 gap-y-2"><Link href={`/cuenta/login?email=${encodeURIComponent(registeredEmail)}`} className="font-medium text-primary underline-offset-4 hover:underline">Iniciar sesión</Link><Link href={`/cuenta/recuperar?email=${encodeURIComponent(registeredEmail)}`} className="font-medium text-primary underline-offset-4 hover:underline">Recuperar contraseña</Link></div></div>}
        {success && <div role="status" className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm">Cuenta creada correctamente. Revisa tu correo electrónico para confirmar tu cuenta.</div>}
        <button type="submit" disabled={loading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader2 size={18} className="animate-spin" />Creando cuenta...</> : <><UserPlus size={18} />Crear cuenta</>}</button>
        <div className="border-t pt-5 text-center"><p className="text-sm text-muted-foreground">¿Ya tienes una cuenta?</p><Link href="/cuenta/login" className="mt-1 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">Iniciar sesión</Link></div>
      </div>
    </form>
  );
}
