'use client';

import { PuffLoader } from 'react-spinners';
import { useContext } from 'react';
import { LoadingContext } from '@/app/context/LoadingContext';

// ─────────────────────────────────────────────────────────────
// 🔹 Tipos para las Props
// ─────────────────────────────────────────────────────────────
interface LoaderProps {
  message?: string;
  color?: string;
}

const Loader = ({ 
  message = 'Cargando...', 
  color = '#f472b6' // Rosa suave (pink-400) a juego con la marca
}: LoaderProps) => {
  const { isLoading } = useContext(LoadingContext);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-md bg-gradient-to-br from-rose-50/60 via-[#FFFBF7]/80 to-amber-50/60 transition-all duration-300">
      
      {/* Spinner */}
      <PuffLoader color={color} size={60} />
      
      {/* Mensaje de carga */}
      {message && (
        <p className="mt-6 text-stone-600 font-medium tracking-wider text-sm uppercase animate-pulse">
          {message}
        </p>
      )}
      
    </div>
  );
};

export default Loader;