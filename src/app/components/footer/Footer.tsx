'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback } from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const companyName = 'Candy Ilusiones';
  const [showShareModal, setShowShareModal] = useState(false);

  const watsapp = '5491141461312';
  const mensaje = 'Hola,%20me%20interesa%20consultar%20por%20un%20producto%20personalizado';
  const EMAIL_CANDY = 'hola.candyilusiones@gmail.com';

  // ────────────────────────────────────────────────────────
  // FUNCIONES DE COMPARTIR
  // ─────────────────────────────────────────────────────────
  const handleShareNative = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: companyName,
          text: 'Mirá estos productos personalizados increíbles 🎨✨',
          url: window.location.href,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setShowShareModal(true);
        }
      }
    } else {
      setShowShareModal(true);
    }
  }, []);

  const shareWhatsApp = useCallback(() => {
    const text = encodeURIComponent('Mirá esta tienda de productos personalizados, me encantó! 🎁');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
    setShowShareModal(false);
  }, []);

  const shareInstagram = useCallback(() => {
    window.open('https://www.instagram.com', '_blank');
    setShowShareModal(false);
  }, []);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareModal(false);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }, []);

  //  Paleta Premium Candy - Gradientes pastel suaves
  const gradients = {
    primary: 'from-purple-400 via-pink-400 to-cyan-400',
    accent: 'from-cyan-300 via-purple-400 to-pink-400',
    glow: 'from-purple-300/30 via-pink-300/30 to-cyan-300/30',
  };

  // ─────────────────────────────────────────────────────────
  // COMPONENTES AUXILIARES
  // ────────────────────────────────────────────────────────
  
  const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link 
      href={href} 
      className="group relative text-purple-600 hover:text-pink-500 transition-all duration-300 inline-flex items-center font-medium"
    >
      {children}
      {/* Underline animado con gradiente candy */}
      <span className={`absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r ${gradients.primary} transition-all duration-500 group-hover:w-full`} />
      {/* Icono arrow sutil */}
      <svg className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );

  const SocialButton = ({ href, icon, label, gradient }: { 
    href: string; 
    icon: React.ReactNode; 
    label: string;
    gradient: string;
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group relative w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 hover:bg-white transition-all duration-300 overflow-hidden border-2 border-purple-200 hover:border-pink-300 shadow-sm hover:shadow-md"
    >
      {/* Glow effect al hover */}
      <span className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500`} />
      {/* Icono con scale */}
      <span className="relative text-purple-500 group-hover:text-pink-500 group-hover:scale-110 transition-all duration-300">
        {icon}
      </span>
    </a>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          FOOTER CANDY PASTEL - LIGHT THEME
          ═══════════════════════════════════════════════════════ */}
      <footer className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 text-purple-900 overflow-hidden">
        
        {/* ✨ Background con gradientes ambientales Candy pastel */}
        <div className="absolute inset-0">
          {/* Glow superior sutil */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-r ${gradients.glow} opacity-60`} style={{ filter: 'blur(100px)' }} />
          
          {/* Orbes decorativos animados en tonos pastel */}
          <div className="absolute top-20 left-10 w-48 h-48 bg-purple-200/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-56 h-56 bg-cyan-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-pink-200/40 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-16 pb-8">
          
          {/* Grid principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            
            {/* ───────── COLUMNA 1-4: MARCA ───────── */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-block group mb-5">
                <div className="flex items-center space-x-3">
                  <span className="relative">
                    <span className={`absolute inset-0 bg-gradient-to-r ${gradients.accent} rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-700`} />
                    {/* Reemplaza con tu logo real de Candy Ilusiones */}
                    <Image
                      src="/img/logo-candy-removebg-preview.png"
                      alt={companyName}
                      width={180}
                      height={80}
                      className="relative transition-transform duration-500 group-hover:scale-[1.02] drop-shadow-md"
                    />
                  </span>
                </div>
              </Link>
              
              <p className="text-sm text-purple-700/90 leading-relaxed max-w-sm mb-6">
                Productos personalizados con amor para hacer tus celebraciones inolvidables. 
                Sublimación, decoración y detalles únicos que reflejan tu estilo.
              </p>

              {/* Botón Compartir Premium - Versión pastel */}
              <button
                onClick={handleShareNative}
                className={`group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl font-bold text-sm tracking-wide transition-all duration-500 overflow-hidden bg-gradient-to-r ${gradients.primary} text-white shadow-lg shadow-purple-300/40 hover:shadow-xl hover:shadow-pink-300/50 hover:scale-[1.02]`}
                aria-label="Compartir página"
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <svg className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="relative z-10">Compartir Tienda</span>
              </button>
            </div>

            {/* ───────── COLUMNA 5-7: CATEGORÍAS ───────── */}
            <div className="lg:col-span-3">
              <h3 className="text-sm tracking-[0.25em] uppercase text-purple-500 font-bold mb-5 relative inline-flex items-center">
                Categorías
                <span className={`absolute -bottom-2 left-0 w-8 h-px bg-gradient-to-r ${gradients.accent}`} />
              </h3>
              <ul className="space-y-3">
                {[
                  { label: 'Sublimación', href: '/productos?categoria=sublimacion' },
                  { label: 'Remeras Personalizadas', href: '/productos?categoria=remeras' },
                  { label: 'Decoración Cumpleaños', href: '/productos?categoria=cumpleaños' },
                  { label: 'Tazas & Mugs', href: '/productos?categoria=tazas' },
                ].map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* ───────── COLUMNA 8-9: SERVICIOS ───────── */}
            <div className="lg:col-span-2">
              <h3 className="text-sm tracking-[0.25em] uppercase text-purple-500 font-bold mb-5 relative inline-flex items-center">
                Servicios
                <span className={`absolute -bottom-2 left-0 w-8 h-px bg-gradient-to-r ${gradients.accent}`} />
              </h3>
              <ul className="space-y-3">
                {[
                  { label: 'Diseño a Medida', href: '/servicios/diseno' },
                  { label: 'Envíos Nacionales', href: '/envios' },
                  { label: 'Ventas Mayoristas', href: '/mayorista' },
                ].map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* ───────── COLUMNA 10-12: CONTACTO ───────── */}
            <div className="lg:col-span-3">
              <h3 className="text-sm tracking-[0.25em] uppercase text-purple-500 font-bold mb-5 relative inline-flex items-center">
                Contacto
                <span className={`absolute -bottom-2 left-0 w-8 h-px bg-gradient-to-r ${gradients.accent}`} />
              </h3>
              
              {/* Info de contacto */}
              <div className="space-y-4 mb-6">
                <a 
                  href={`https://wa.me/${watsapp}?text=${mensaje}`}
                  className="group flex items-center space-x-3 text-purple-600 hover:text-pink-600 transition-colors"
                >
                  <span className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradients.primary} flex items-center justify-center text-white text-sm shadow-lg shadow-purple-300/40 group-hover:shadow-pink-300/50 transition-shadow duration-300`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <span className="group-hover:text-pink-600 transition-colors font-semibold">+54 9 11 4146 1312</span>
                </a>
                
                <a 
                  href={`mailto:${EMAIL_CANDY}`} 
                  className="group flex items-center space-x-3 text-purple-600 hover:text-pink-600 transition-colors"
                >
                  <span className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradients.primary} flex items-center justify-center text-white text-sm shadow-lg shadow-purple-300/40 group-hover:shadow-pink-300/50 transition-shadow duration-300`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span className="group-hover:text-pink-600 transition-colors font-semibold text-sm break-all">{EMAIL_CANDY}</span>
                </a>
                
                <div className="flex items-center space-x-3 text-purple-600">
                  <span className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradients.primary} flex items-center justify-center text-white text-sm shadow-lg shadow-purple-300/40`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <span className="font-semibold">Buenos Aires, Argentina</span>
                </div>
              </div>

              {/* Redes Sociales Premium */}
              <div className="flex items-center gap-3">
                <SocialButton 
                  href="https://instagram.com" 
                  label="Instagram"
                  gradient="from-pink-400 via-rose-400 to-orange-300"
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  }
                />
                <SocialButton 
                  href={`https://wa.me/${watsapp}?text=${mensaje}`}
                  label="WhatsApp"
                  gradient="from-green-400 via-emerald-400 to-teal-300"
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  }
                />
              </div>
            </div>
          </div>

          {/* ───────── LÍNEA INFERIOR ───────── */}
          <div className="relative mt-16 pt-8 border-t border-purple-300/50">
            {/* Glow sutil en la línea */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r ${gradients.accent} opacity-80`} />
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p className="text-purple-600/80">
                © {currentYear} <span className="text-purple-700 font-bold">{companyName}</span>. Todos los derechos reservados.
              </p>
              
              <div className="flex items-center gap-6">
                <Link 
                  href="https://www.tumarca.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600/80 hover:text-pink-500 transition-colors relative group inline-flex items-center gap-1 font-medium"
                >
                  <span>Desarrollado por TuMarca.ar</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════
          MODAL COMPARTIR - CANDY PASTEL LIGHT
          ═══════════════════════════════════════════════════════ */}
      {showShareModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-purple-900/40 backdrop-blur-xl animate-fadeIn"
          onClick={() => setShowShareModal(false)}
        >
          {/* Glow ambiental del modal */}
          <div className={`absolute inset-0 bg-gradient-to-r ${gradients.glow} opacity-50`} style={{ filter: 'blur(100px)' }} />
          
          <div 
            className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl p-7 border-2 border-purple-200 shadow-2xl shadow-purple-200/50 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con gradiente */}
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${gradients.accent} opacity-80`} />
            
            <div className="flex justify-between items-center mb-7">
              <h3 className="text-lg font-bold tracking-wide text-purple-900">Compartir Tienda</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="group p-2 hover:bg-purple-100 rounded-lg transition-all duration-300"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5 text-purple-500 group-hover:text-pink-500 group-hover:rotate-90 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Opciones de compartir */}
            <div className="space-y-3">
              {/* WhatsApp */}
              <button
                onClick={shareWhatsApp}
                className="group w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 border-2 border-green-300 hover:border-green-400 rounded-xl transition-all duration-300"
              >
                <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-green-300/40 group-hover:shadow-green-300/60 transition-shadow duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </span>
                <div className="flex-1 text-left">
                  <span className="block text-purple-900 font-bold">WhatsApp</span>
                  <span className="block text-xs text-purple-600">Compartir por mensaje</span>
                </div>
                <svg className="w-5 h-5 text-purple-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Instagram */}
              <button
                onClick={shareInstagram}
                className="group w-full flex items-center gap-4 p-4 bg-gradient-to-r from-pink-100 via-rose-100 to-orange-100 hover:from-pink-200 hover:via-rose-200 hover:to-orange-200 border-2 border-pink-300 hover:border-pink-400 rounded-xl transition-all duration-300"
              >
                <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 via-rose-400 to-orange-300 flex items-center justify-center text-white shadow-lg shadow-pink-300/40 group-hover:shadow-pink-300/60 transition-shadow duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </span>
                <div className="flex-1 text-left">
                  <span className="block text-purple-900 font-bold">Instagram</span>
                  <span className="block text-xs text-purple-600">Visitar perfil</span>
                </div>
                <svg className="w-5 h-5 text-purple-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Copiar Link */}
              <button
                onClick={copyLink}
                className="group w-full flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-100 via-purple-100 to-pink-100 hover:from-cyan-200 hover:via-purple-200 hover:to-pink-200 border-2 border-cyan-300 hover:border-cyan-400 rounded-xl transition-all duration-300"
              >
                <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 flex items-center justify-center text-white shadow-lg shadow-purple-300/40 group-hover:shadow-purple-300/60 transition-shadow duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </span>
                <div className="flex-1 text-left">
                  <span className="block text-purple-900 font-bold">Copiar enlace</span>
                  <span className="block text-xs text-purple-600">Copiar URL al portapapeles</span>
                </div>
                <svg className="w-5 h-5 text-purple-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Botón cancelar */}
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-7 py-3.5 bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-900 rounded-xl transition-all duration-300 font-bold text-sm tracking-wide border-2 border-purple-200 hover:border-purple-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;