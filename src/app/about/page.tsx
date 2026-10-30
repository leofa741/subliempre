'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────
// 🔹 ICONOS MINIMALISTAS (Estilo Candy Pastel)
// ─────────────────────────────────────────────────────────────
const Icons = {
  Heart: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  Quote: () => (
    <svg className="w-8 h-8 text-pink-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────
// 🔹 COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const timeline = [
    { year: '2015', title: 'El Inicio', desc: 'Comenzamos con pequeños proyectos de sublimación, enfocados en la calidad y el detalle.' },
    { year: '2018', title: 'Crecimiento', desc: 'Expandimos nuestra línea hacia la decoración de eventos y regalos personalizados.' },
    { year: '2021', title: 'Nace Candy Ilusiones', desc: 'Consolidamos nuestra marca con una visión clara: hacer realidad las ideas de nuestros clientes.' },
    { year: '2024', title: 'Comunidad', desc: 'Hoy somos una comunidad de miles de clientes que confían en nosotros para sus momentos especiales.' },
  ];

  const values = [
    { 
      icon: <Icons.Heart />, 
      title: 'Pasión por el detalle', 
      desc: 'Cada diseño, cada color y cada material es elegido pensando en cómo hará brillar tu evento o regalo.' 
    },
    { 
      icon: <Icons.Sparkles />, 
      title: 'Calidad Premium', 
      desc: 'Trabajamos con insumos de primera calidad que garantizan durabilidad, colores vibrantes y terminaciones impecables.' 
    },
    { 
      icon: <Icons.Check />, 
      title: 'Creatividad sin límites', 
      desc: 'No hay idea imposible. Nos adaptamos a tus gustos para crear productos 100% únicos y personalizados.' 
    },
  ];

  const stats = [
    { value: '5K+', label: 'Clientes felices' },
    { value: '100%', label: 'Personalización' },
    { value: '10+', label: 'Años de experiencia' },
  ];

  const testimonials = [
    { name: 'Valentina M.', role: 'Cliente desde 2022', text: 'La calidad de las tazas y remeras es increíble. Los colores no se desgastan y la atención fue súper rápida y cariñosa.' },
    { name: 'Camila R.', role: 'Cliente desde 2023', text: 'Me ayudaron a decorar todo el cumpleaños de mi hija. Quedé fascinada con el resultado, todo salió exactamente como lo soñé.' },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 text-purple-900 selection:bg-pink-200 overflow-x-hidden">
      
      {/* Fondo minimalista: orbes pastel muy sutiles y difusos */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] right-0 w-[800px] h-[800px] bg-purple-200/40 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-cyan-200/40 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-pink-200/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        
        {/* ═══════════════════════════════════════════════════════
            HERO SECTION - ESENCIA
            ═══════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mt-40 mb-24 sm:mb-32">
          
          {/* Imagen limpia y elegante */}
          <div className={`relative transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative aspect-[5/5] rounded-3xl overflow-hidden border-2 border-purple-200 bg-white shadow-xl shadow-purple-200/40">
              <Image
                src="/img/logo-candy-removebg-preview.png" // Reemplaza con una foto de tus productos o equipo
                alt="Equipo Candy Ilusiones"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent" />
            </div>
            {/* Decoración sutil de esquina pastel */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-pink-300 rounded-br-3xl hidden sm:block" />
            <div className="absolute -top-4 -left-4 w-24 h-24 border-l-2 border-t-2 border-cyan-300 rounded-tl-3xl hidden sm:block" />
          </div>

          {/* Contenido de texto */}
          <div className={`space-y-8 transition-all duration-1000 delay-200 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-pink-500 mb-4 block">
                Nuestra Esencia
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-purple-900 leading-[1.1]">
                Más que una tienda, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500">un espacio para tu creatividad.</span>
              </h1>
            </div>

            <p className="text-lg text-purple-700/90 leading-relaxed max-w-lg font-medium">
              En <span className="text-purple-900 font-bold">Candy Ilusiones</span> creemos que cada detalle cuenta. 
              Por eso, creamos cada producto personalizado no solo por su estética, sino por la emoción y la alegría que te brinda al verlo hecho realidad.
            </p>

            <ul className="space-y-4 pt-2">
              {[
                'Diseños 100% personalizados y adaptados a tu idea',
                'Materiales de primera calidad con colores vibrantes',
                'Atención cercana, rápida y con mucho cariño',
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-purple-800">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white flex items-center justify-center shadow-md shadow-purple-300/40">
                    <Icons.Check />
                  </span>
                  <span className="text-sm sm:text-base font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/productos"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-purple-300/40 hover:shadow-xl hover:shadow-pink-300/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Ver Productos</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300"><Icons.ArrowRight /></span>
              </Link>
              <Link
                href="/contacto"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-purple-200 bg-white/80 text-purple-700 font-bold text-sm tracking-wide transition-all duration-300 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600 active:scale-[0.98] shadow-sm"
              >
                <span>Contactanos</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            ESTADÍSTICAS - LIMPIO Y DIRECTO
            ═══════════════════════════════════════════════════════ */}
        <section className="py-12 border-y-2 border-purple-200/50 bg-white/60 backdrop-blur-sm rounded-3xl mb-24 sm:mb-32 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x-2 divide-purple-200/50">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2 p-4">
                <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 tracking-tight">{stat.value}</p>
                <p className="text-sm uppercase tracking-wider text-purple-600 font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            HISTORIA (TIMELINE) - MINIMALISTA PASTEL
            ═══════════════════════════════════════════════════════ */}
        <section className="mb-24 sm:mb-32">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 mb-4 block">Trayectoria</span>
            <h2 className="text-3xl sm:text-4xl font-black text-purple-900">Nuestra historia</h2>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Línea vertical sutil pastel */}
            <div className="absolute left-0 sm:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-300 via-pink-300 to-cyan-300 -translate-x-1/2 rounded-full" />
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`relative flex flex-col sm:flex-row gap-8 ${index % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>
                  {/* Punto en la línea */}
                  <div className="absolute left-0 sm:left-1/2 top-2 w-4 h-4 rounded-full bg-white border-4 border-pink-400 -translate-x-1/2 z-10 shadow-md shadow-pink-200/50" />
                  
                  <div className={`sm:w-1/2 ${index % 2 === 0 ? 'sm:pl-12 sm:text-left' : 'sm:pr-12 sm:text-right'} pl-8 sm:pl-0`}>
                    <span className="text-sm font-black text-pink-500 mb-1 block">{item.year}</span>
                    <h3 className="text-xl font-bold text-purple-900 mb-2">{item.title}</h3>
                    <p className="text-purple-700/80 text-sm leading-relaxed font-medium bg-white/60 p-4 rounded-2xl border border-purple-100 shadow-sm">{item.desc}</p>
                  </div>
                  <div className="hidden sm:block sm:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            VALORES / PILARES
            ═══════════════════════════════════════════════════════ */}
        <section className="mb-24 sm:mb-32">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 mb-4 block">Filosofía</span>
            <h2 className="text-3xl sm:text-4xl font-black text-purple-900">Lo que nos define</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="group p-8 rounded-3xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm hover:border-pink-300 hover:bg-pink-50/50 transition-all duration-500 shadow-lg shadow-purple-200/30 hover:shadow-xl hover:shadow-pink-200/40 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 text-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-pink-200">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-purple-900 mb-3">{value.title}</h3>
                <p className="text-purple-700/80 text-sm leading-relaxed font-medium">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            TESTIMONIOS - SUTILES Y ELEGANTES
            ═══════════════════════════════════════════════════════ */}
        <section className="mb-24 sm:mb-32">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 mb-4 block">Testimonios</span>
            <h2 className="text-3xl sm:text-4xl font-black text-purple-900">Lo que dicen nuestros clientes</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="relative p-8 rounded-3xl bg-white/90 backdrop-blur-xl border-2 border-purple-200 shadow-lg shadow-purple-200/30 hover:shadow-xl hover:shadow-pink-200/40 transition-all duration-300">
                <div className="absolute top-6 right-6 opacity-50">
                  <Icons.Quote />
                </div>
                <p className="text-purple-800 leading-relaxed font-medium mb-6 relative z-10 italic text-lg">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-purple-900 font-bold text-sm">{testimonial.name}</p>
                    <p className="text-purple-500 text-xs font-medium">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            CTA FINAL - LIMPIO Y ATRACTIVO
            ═══════════════════════════════════════════════════════ */}
        <section className="relative rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-cyan-100/50 backdrop-blur-sm p-8 sm:p-16 text-center overflow-hidden shadow-xl shadow-purple-200/40">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlOWQ1ZmYiLz48L3N2Zz4=')] opacity-40 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-purple-900">
              ¿Lista para crear algo <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500">único</span>?
            </h2>
            <p className="text-purple-700 font-medium text-lg">
              Escribinos por WhatsApp o visitá nuestro showroom. Estamos para asesorarte y hacer realidad tus ideas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href="https://wa.me/5491141461312?text=Hola,%20me%20interesa%20consultar%20por%20un%20producto%20personalizado%20🎨"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-green-300/40 hover:shadow-xl hover:shadow-green-300/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Icons.Heart />
                <span>Consultar por WhatsApp</span>
              </a>
              <Link
                href="/productos"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-purple-300 bg-white text-purple-700 font-bold text-sm tracking-wide transition-all duration-300 hover:border-pink-400 hover:bg-pink-50 hover:text-pink-600 active:scale-[0.98] shadow-sm"
              >
                <span>Ver Productos</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300"><Icons.ArrowRight /></span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}