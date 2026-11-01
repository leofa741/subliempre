'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/app/lib/config';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: siteConfig.companyName,
          text: `Mirá estos productos personalizados increíbles de ${siteConfig.companyName} 🎨✨`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error al compartir:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } catch (err) {
        console.error('Error al copiar:', err);
      }
    }
  };

  const whatsappLink = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;

  return (
    <footer className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 text-purple-900 border-t border-purple-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-8">
          
          {/* ───────── COLUMNA 1: MARCA ───────── */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src={siteConfig.logo.src}
                alt={siteConfig.logo.alt}
                width={siteConfig.logo.width}
                height={siteConfig.logo.height}
                className="drop-shadow-sm hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-sm text-purple-700/90 leading-relaxed max-w-xs">
              {siteConfig.description}
            </p>
            
            <button
              onClick={handleShare}
              disabled={isCopied}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 ${
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
            <h3 className="text-sm tracking-wider uppercase text-purple-500 font-bold mb-6">Categorías</h3>
            <ul className="space-y-3">
              {siteConfig.footerLinks.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-purple-700 hover:text-pink-500 transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-300 group-hover:bg-pink-400 group-hover:scale-125 transition-all duration-300" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ───────── COLUMNA 3: CONTACTO (PREMIUM) ───────── */}
          <div>
            <h3 className="text-sm tracking-wider uppercase text-purple-500 font-bold mb-6">Contacto</h3>
            <div className="space-y-5">
              
              {/* WhatsApp */}
              <Link 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-start gap-4 group p-2 -mx-2 rounded-xl hover:bg-white/60 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-green-600 group-hover:from-green-200 group-hover:to-emerald-200 group-hover:scale-110 transition-all duration-300 shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">WhatsApp</span>
                  <span className="text-sm font-medium text-purple-800 group-hover:text-green-600 transition-colors duration-300">
                    +{siteConfig.whatsapp}
                  </span>
                </div>
              </Link>

              {/* Email */}
              <Link 
                href={`mailto:${siteConfig.email}`} 
                className="flex items-start gap-4 group p-2 -mx-2 rounded-xl hover:bg-white/60 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 group-hover:from-purple-200 group-hover:to-pink-200 group-hover:scale-110 transition-all duration-300 shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Email</span>
                  <span className="text-sm font-medium text-purple-800 group-hover:text-pink-600 transition-colors duration-300 break-all">
                    {siteConfig.email}
                  </span>
                </div>
              </Link>

              {/* Dirección */}
              <div className="flex items-start gap-4 group p-2 -mx-2 rounded-xl hover:bg-white/60 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-cyan-600 group-hover:from-cyan-200 group-hover:to-blue-200 group-hover:scale-110 transition-all duration-300 shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Dirección</span>
                  <span className="text-sm font-medium text-purple-800">
                    {siteConfig.address}
                  </span>
                </div>
              </div>

              {/* Redes Sociales */}
              <div className="pt-5 border-t border-purple-200/50">
                <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold mb-3">Síguenos en redes</p>
                <div className="flex items-center gap-3">
                  {siteConfig.socials.instagram && (
                    <Link 
                      href={siteConfig.socials.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-xl bg-white border border-purple-100 flex items-center justify-center text-purple-500 hover:text-pink-600 hover:border-pink-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </Link>
                  )}
                  {siteConfig.socials.facebook && (
                    <Link 
                      href={siteConfig.socials.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-xl bg-white border border-purple-100 flex items-center justify-center text-purple-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                      aria-label="Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </Link>
                  )}
                  {siteConfig.socials.tiktok && (
                    <Link 
                      href={siteConfig.socials.tiktok} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-xl bg-white border border-purple-100 flex items-center justify-center text-purple-500 hover:text-black hover:border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                      aria-label="TikTok"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ───────── LÍNEA INFERIOR ───────── */}
        <div className="mt-12 pt-8 border-t border-purple-200/60">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-purple-600/80">
            <p>
              © {currentYear} <span className="text-purple-700 font-bold">{siteConfig.companyName}</span>. Todos los derechos reservados.
            </p>
            <Link 
              href="https://www.tumarca.ar" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-pink-500 transition-colors inline-flex items-center gap-1.5 font-medium group"
            >
              <span>Desarrollado por TuMarca.ar</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;