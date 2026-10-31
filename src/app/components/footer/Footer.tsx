'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const companyName = 'Candy Ilusiones';
  const watsapp = '5491141461312';
  const mensaje = 'Hola,%20me%20interesa%20consultar%20por%20un%20producto%20personalizado';
  const EMAIL_CANDY = 'hola.candyilusiones@gmail.com';

  // Estado para la micro-interacción premium
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: companyName,
          text: 'Mirá estos productos personalizados increíbles 🎨✨',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error al compartir:', err);
      }
    } else {
      // Fallback premium para PC: copiar al portapapeles con feedback visual
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        
        // Volver al estado normal después de 2.5 segundos
        setTimeout(() => {
          setIsCopied(false);
        }, 2500);
      } catch (err) {
        console.error('Error al copiar:', err);
      }
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 text-purple-900 border-t border-purple-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        
        {/* Grid principal: 3 columnas equilibradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-8">
          
          {/* ───────── COLUMNA 1: MARCA ───────── */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/img/logo-candy-removebg-preview.png"
                alt={companyName}
                width={160}
                height={70}
                className="drop-shadow-sm hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-sm text-purple-700/90 leading-relaxed max-w-xs">
              Productos personalizados con amor para hacer tus celebraciones inolvidables. 
              Sublimación, decoración y detalles únicos.
            </p>
            
            {/* Botón con Micro-interacción Premium */}
            <button
              onClick={handleShare}
              disabled={isCopied}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-300 ${
                isCopied 
                  ? 'bg-green-500 text-white cursor-default scale-[1.02]' 
                  : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:shadow-lg hover:scale-[1.02]'
              }`}
            >
              {isCopied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ¡Enlace copiado!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Compartir Tienda
                </>
              )}
            </button>
          </div>

          {/* ───────── COLUMNA 2: CATEGORÍAS ───────── */}
          <div>
            <h3 className="text-sm tracking-wider uppercase text-purple-500 font-bold mb-4">Categorías</h3>
            <ul className="space-y-3">
              {[
                { label: 'Sublimación', href: '/catalogo?categoria=sublimacion' },
                { label: 'Remeras Personalizadas', href: '/catalogo?categoria=remeras' },
                { label: 'Decoración Cumpleaños', href: '/catalogo?categoria=cumpleaños' },
                { label: 'Tazas & Mugs', href: '/catalogo?categoria=tazas' },
              ].map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-purple-700 hover:text-pink-500 transition-colors duration-300 inline-flex items-center gap-1 group"
                  >
                    {item.label}
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ───────── COLUMNA 3: CONTACTO ───────── */}
          <div>
            <h3 className="text-sm tracking-wider uppercase text-purple-500 font-bold mb-4">Contacto</h3>
            <div className="space-y-4">
              <a 
                href={`https://wa.me/${watsapp}?text=${mensaje}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-purple-700 hover:text-pink-600 transition-colors"
              >
                <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <span className="font-medium">+54 9 11 4146 1312</span>
              </a>
              
              <a 
                href={`mailto:${EMAIL_CANDY}`} 
                className="group flex items-center gap-3 text-purple-700 hover:text-pink-600 transition-colors"
              >
                <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="font-medium text-sm break-all">{EMAIL_CANDY}</span>
              </a>
              
              <div className="flex items-center gap-3 text-purple-700">
                <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <span className="font-medium">Buenos Aires, Argentina</span>
              </div>

              {/* Redes Sociales */}
              <div className="flex items-center gap-3 pt-2">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-purple-200 text-purple-500 hover:text-pink-500 hover:border-pink-300 hover:shadow-md transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href={`https://wa.me/${watsapp}?text=${mensaje}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-purple-200 text-purple-500 hover:text-green-500 hover:border-green-300 hover:shadow-md transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ───────── LÍNEA INFERIOR ───────── */}
        <div className="mt-12 pt-8 border-t border-purple-200/60">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-purple-600/80">
            <p>
              © {currentYear} <span className="text-purple-700 font-bold">{companyName}</span>. Todos los derechos reservados.
            </p>
            
            <Link 
              href="https://www.tumarca.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500 transition-colors inline-flex items-center gap-1 font-medium"
            >
              <span>Desarrollado por TuMarca.ar</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;