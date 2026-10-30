'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Image from 'next/image';

// ─────────────────────────────────────────────────────────────
// ICONOS SVG PREMIUM (Consistentes con el Login)
// ─────────────────────────────────────────────────────────────
const Icons = {
  Mail: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  EyeOff: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Spinner: () => (
    <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [validation, setValidation] = useState({ 
    email: false, 
    password: false 
  });

  const router = useRouter();

  // ─────────────────────────────────────────────────────────
  // VALIDACIÓN EN TIEMPO REAL
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    setValidation({
      email: /\S+@\S+\.\S+/.test(email),
      password: password.length >= 6,
    });
  }, [email, password]);

  const isValidForm = () => validation.email && validation.password;

  // ─────────────────────────────────────────────────────────
  // HANDLER DE REGISTRO
  // ─────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidForm()) {
      setError('Por favor, ingresá un correo válido y una contraseña de al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('¡Registro exitoso! Bienvenida a Candy Ilusiones 🎨', { 
          theme: 'colored',
          style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
        });
        router.push('/login');
      } else {
        toast.error(data.message || 'Error al registrar usuario', { theme: 'colored' });
        setError(data.message || 'No pudimos completar el registro. Intentá de nuevo.');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor', { theme: 'colored' });
      setError('No pudimos conectar con el servidor. Verificá tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 overflow-hidden p-4 selection:bg-rose-200 selection:text-rose-900">

      {/* ✨ Background ambiental con orbes sedosos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-pink-200/40 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-200/40 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-100/30 rounded-full blur-[120px]" />
      </div>

      {/* Card de registro premium */}
      <div className="relative z-10 w-full mt-40 max-w-md animate-fadeInUp">

        {/* Glow exterior suave */}
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-300 via-pink-300 to-amber-200 rounded-[2.5rem] opacity-30 blur-2xl" aria-hidden="true" />

        {/* Card principal con glassmorphism cremoso */}
        <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2rem] p-8 sm:p-10 border border-rose-100 shadow-[0_25px_50px_-12px_rgba(253,164,175,0.25)]">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <span className="absolute inset-0 bg-gradient-to-r from-rose-300 to-pink-300 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" aria-hidden="true" />
              <Image
                src="/img/logo-candy-removebg-preview.png" 
                alt="Candy Ilusiones"
                width={180}
                height={70}
                className="relative transition-transform duration-500 group-hover:scale-[1.02] drop-shadow-sm"
              />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-3xl font-serif font-medium text-center text-stone-800 mb-2">
            Creá tu cuenta
          </h2>
          <p className="text-center text-stone-500 text-sm mb-8 font-light">
            Unite para acceder a diseños exclusivos y ofertas especiales ✨
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 animate-shake">
              <p className="text-rose-600 text-sm font-medium flex items-center gap-2">
                <Icons.X />
                {error}
              </p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleRegister} className="space-y-6">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                  <Icons.Mail />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className={`w-full pl-12 pr-10 py-3.5 rounded-2xl bg-rose-50/50 border transition-all duration-300 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 ${
                    validation.email
                      ? 'border-emerald-300 focus:ring-emerald-200 bg-emerald-50/30'
                      : email
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-rose-200 focus:border-pink-300 focus:ring-pink-200'
                  }`}
                  required
                />
                {email && (
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${validation.email ? 'text-emerald-500' : 'text-rose-400'}`}>
                    {validation.email ? <Icons.Check /> : <Icons.X />}
                  </span>
                )}
              </div>
            </div>

            {/* Password con toggle visibility */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                  <Icons.Lock />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-2xl bg-rose-50/50 border transition-all duration-300 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 ${
                    validation.password
                      ? 'border-emerald-300 focus:ring-emerald-200 bg-emerald-50/30'
                      : password
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-rose-200 focus:border-pink-300 focus:ring-pink-200'
                  }`}
                  required
                />
                {/* Toggle visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-pink-500 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
              </div>
              {password.length > 0 && !validation.password && (
                <p className="mt-2 text-xs text-rose-400 font-medium ml-1 flex items-center gap-1">
                  <Icons.X /> La contraseña debe tener al menos 6 caracteres
                </p>
              )}
            </div>

            {/* Submit Button Premium */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !isValidForm()}
                className={`group relative w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-500 overflow-hidden ${
                  loading || !isValidForm()
                    ? 'bg-stone-200 cursor-not-allowed text-stone-400'
                    : 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {/* Shine effect */}
                {!loading && isValidForm() && (
                  <>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-white/40 transition-colors duration-300" />
                  </>
                )}

                {loading ? (
                  <>
                    <Icons.Spinner />
                    <span>Creando tu cuenta...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Registrarme</span>
                    <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-rose-100 text-center">
            <p className="text-stone-500 text-sm">
              ¿Ya tenés una cuenta?{' '}
              <Link
                href="/login"
                className="text-rose-600 hover:text-pink-600 font-bold transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-stone-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Conexión segura • Tus datos están protegidos</span>
        </div>
      </div>
    </div>
  );
}