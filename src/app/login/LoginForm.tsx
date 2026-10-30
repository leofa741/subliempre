'use client';

import { useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { AuthContext } from '../context/AuthContext';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────
// ICONOS SVG PREMIUM (Adaptados a la paleta Candy)
// ─────────────────────────────────────────────────────────────
const Icons = {
  Google: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
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
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaSolution, setCaptchaSolution] = useState(0);
  const [validation, setValidation] = useState({ email: false, password: false, captcha: false });

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/gestion';

  const { data: session, status } = useSession();
  const { setUserRole } = useContext(AuthContext);

  // ─────────────────────────────────────────────────────────
  // GENERAR CAPTCHA SIMPLE
  // ─────────────────────────────────────────────────────────
  const generateCaptcha = useCallback(() => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setCaptchaQuestion(`${n1} + ${n2}`);
    setCaptchaSolution(n1 + n2);
    setCaptchaAnswer('');
    setValidation(prev => ({ ...prev, captcha: false }));
  }, []);

  // ─────────────────────────────────────────────────────────
  // VALIDACIÓN EN TIEMPO REAL
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    setValidation(prev => ({
      ...prev,
      email: /\S+@\S+\.\S+/.test(email),
      password: password.length >= 6,
      captcha: Number(captchaAnswer) === captchaSolution && captchaAnswer !== '',
    }));
  }, [email, password, captchaAnswer, captchaSolution]);

  // ─────────────────────────────────────────────────────────
  // INICIALIZAR CAPTCHA
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  // ─────────────────────────────────────────────────────────
  // REDIRECCIÓN POST-LOGIN
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUserRole(session.user.role);
      router.push(callbackUrl);
    }
  }, [status, session, callbackUrl, setUserRole, router]);

  // ─────────────────────────────────────────────────────────
  // HANDLER DE LOGIN
  // ─────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validation.email || !validation.password || !validation.captcha) {
      setError('Por favor, verificá todos los campos.');
      return;
    }

    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error('Credenciales incorrectas');
        setError('Email o contraseña inválidos');
        generateCaptcha(); // Regenerar captcha tras error
      }
    } catch (err) {
      toast.error('Error de conexión');
      setError('No pudimos conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn('google', { callbackUrl });
  };

  // ─────────────────────────────────────────────────────────
  // LOADING STATE (Estilo Candy)
  // ─────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          <span className="text-stone-500 text-sm font-medium">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 overflow-hidden p-4 selection:bg-rose-200 selection:text-rose-900">

      {/* ✨ Background ambiental con orbes sedosos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-200/40 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-200/40 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-100/30 rounded-full blur-[120px]" />
      </div>

      {/* Card de login premium */}
      <div className="relative z-10 w-full max-w-md animate-fadeInUp">

        {/* Glow exterior suave */}
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-300 via-pink-300 to-amber-200 rounded-[2.5rem] opacity-30 blur-2xl" aria-hidden="true" />

        {/* Card principal con glassmorphism cremoso */}
        <div className="relative mt-30 bg-white/80 backdrop-blur-2xl rounded-[2rem] p-8 sm:p-10 border border-rose-100 shadow-[0_25px_50px_-12px_rgba(253,164,175,0.25)]">

          {/* Logo */}
          <div className="flex justify-center  mb-8">
            <div className="relative group">
              <span className="absolute inset-0 bg-gradient-to-r from-rose-300 to-pink-300 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" aria-hidden="true" />
              <Image
                src="/img/logo-candy-removebg-preview.png" 
                alt="Candy Ilusiones"
                width={200}
                height={80}
                className="relative transition-transform duration-500 group-hover:scale-[1.02] drop-shadow-sm"
              />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-3xl font-serif font-medium text-center text-stone-800 mb-2">
            Bienvenida de nuevo
          </h2>
          <p className="text-center text-stone-500 text-sm mb-8 font-light">
            Inicia sesión para crear momentos únicos ✨
          </p>

          {/* Google Sign In Premium */}
          <button
            onClick={handleGoogleLogin}
            className="group w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <span className="group-hover:scale-110 transition-transform duration-300">
              <Icons.Google />
            </span>
            <span className="text-stone-700 group-hover:text-stone-900 transition-colors text-sm font-semibold">
             Ingresar con Google
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
            <span className="text-stone-400 text-xs uppercase tracking-widest font-medium">o</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
          </div>

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
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
                Email
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
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-2xl bg-rose-50/50 border transition-all duration-300 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 ${
                    validation.password
                      ? 'border-emerald-300 focus:ring-emerald-200 bg-emerald-50/30'
                      : password
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-rose-200 focus:border-pink-300 focus:ring-pink-200'
                  }`}
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
              {password && !validation.password && (
                <p className="mt-2 text-xs text-rose-400 font-medium ml-1">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>

            {/* Captcha mejorado y suave */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
                Verificación
              </label>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50/50 border border-rose-200">
                <span className="text-lg font-serif font-medium text-stone-700 tracking-wider">
                  {captchaQuestion}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="?"
                  className={`w-20 px-3 py-2.5 rounded-xl bg-white border text-center font-semibold transition-all duration-300 ${
                    validation.captcha
                      ? 'border-emerald-300 text-emerald-600'
                      : captchaAnswer
                      ? 'border-rose-300 text-rose-600'
                      : 'border-rose-200 text-stone-700'
                  } focus:outline-none focus:ring-2 focus:ring-pink-200`}
                />
                {/* Refresh captcha */}
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-2.5 text-stone-400 hover:text-pink-500 hover:bg-white rounded-xl transition-all duration-300"
                  aria-label="Generar nueva verificación"
                >
                  <Icons.Refresh />
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <Link
                href="/reset-password"
                className="text-sm text-rose-500 hover:text-pink-600 font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button Premium */}
            <button
              type="submit"
              disabled={loading || !validation.email || !validation.password || !validation.captcha}
              className={`group relative w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-500 overflow-hidden ${
                loading || !validation.email || !validation.password || !validation.captcha
                  ? 'bg-stone-200 cursor-not-allowed text-stone-400'
                  : 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {/* Shine effect */}
              {!loading && validation.email && validation.password && validation.captcha && (
                <>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-white/40 transition-colors duration-300" />
                </>
              )}

              {loading ? (
                <>
                  <Icons.Spinner />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Iniciar sesión</span>
                  <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-rose-100 text-center">
            <p className="text-stone-500 text-sm">
              ¿No tenés una cuenta?{' '}
              <Link
                href="/register"
                className="text-rose-600 hover:text-pink-600 font-bold transition-colors"
              >
                Crear cuenta
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