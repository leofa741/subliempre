'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaUserLock, FaLightbulb, FaMagic, FaArrowRight, FaPalette } from 'react-icons/fa';

export default function DisenoPersonalizadoCTA() {
  const { data: session, status } = useSession();

  const steps = [
    {
      icon: <FaUserLock className="w-6 h-6" />,
      title: '1. Inicia Sesión',
      description: 'Accede a tu cuenta para guardar tu historial, subir referencias y hacer seguimiento en tiempo real de tu idea.'
    },
    {
      icon: <FaPalette className="w-6 h-6" />,
      title: '2. Cuéntanos tu Idea',
      description: 'Completa un formulario simple: describe lo que imaginas, elige el tipo de producto y sube fotos de referencia.'
    },
    {
      icon: <FaMagic className="w-6 h-6" />,
      title: '3. Nosotros lo Creamos',
      description: 'Nuestro equipo revisará tu solicitud, te enviará una vista previa para tu aprobación y ¡lo haremos realidad!'
    }
  ];

  return (
    <section className="relative w-full py-16 sm:py-24 overflow-hidden">
      {/* ✨ Background ambiental con orbes sedosos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-4 border border-rose-200">
            <FaLightbulb className="w-3 h-3" />
            <span>Servicio Exclusivo</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-medium text-stone-800 mb-4 leading-tight">
            ¿Tienes una idea única? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">
              Nosotros la hacemos realidad.
            </span>
          </h2>
          <p className="text-stone-500 text-lg sm:text-xl font-light leading-relaxed">
            Desde tazas con fotos especiales hasta decoración temática para tu evento. 
            Solicita tu diseño 100% personalizado en 3 simples pasos.
          </p>
        </div>

        {/* Grid de Pasos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icono con fondo degradado */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-rose-600 mb-5 group-hover:scale-110 transition-transform duration-300 border border-rose-200">
                {step.icon}
              </div>
              
              <h3 className="text-xl font-serif font-semibold text-stone-800 mb-3">
                {step.title}
              </h3>
              <p className="text-stone-500 text-sm sm:text-base leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action (CTA) Dinámico */}
        <div className="text-center">
          {status === 'loading' ? (
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-stone-100 text-stone-400 font-bold">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Cargando...
            </div>
          ) : status === 'authenticated' ? (
            <Link 
              href="/profile/diseno-personalizado/nuevo"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-lg shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <FaMagic className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Crear mi Diseño Personalizado
              <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/login"
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-lg shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <FaUserLock className="w-5 h-5" />
                Iniciar Sesión para Empezar
                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
          
            </div>
          )}
        </div>

      </div>
    </section>
  );
}