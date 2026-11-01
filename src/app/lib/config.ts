// src/lib/config.ts

export const siteConfig = {
  // 🏢 Datos de la Marca
  companyUrl : 'https://www.candyilusiones.com.ar',
  companyName: 'Candy Ilusiones',
  description: 'Productos personalizados con amor para hacer tus celebraciones inolvidables. Sublimación, decoración y detalles únicos en 3D.',
  
  // 📞 Contacto
  whatsapp: '5491137929744',
  whatsappMessage: 'Hola, me interesa consultar por un producto personalizado',
  email: 'hola.candyilusiones@gmail.com',
  address: 'Buenos Aires, Argentina',

  // 🖼️ Assets (Logos, Favicons)
  logo: {
    src: '/img/logo-candy-removebg-preview.png',
    alt: 'Logo de Candy Ilusiones',
    width: 160,
    height: 70,
  },

  // 🌐 Redes Sociales
  socials: {
    instagram: 'https://instagram.com/candy.ilusiones', // Pon el usuario real
    facebook: 'https://facebook.com/candy.ilusiones',
    tiktok: 'https://tiktok.com/@candy.ilusiones',
  },

  // 🔗 Enlaces rápidos del Footer
  footerLinks: [
    { label: 'Sublimación', href: '/catalogo?categoria=sublimacion' },
    { label: 'Remeras Personalizadas', href: '/catalogo?categoria=remeras' },
    { label: 'Decoración Cumpleaños', href: '/catalogo?categoria=cumpleaños' },
    { label: 'Tazas & Mugs', href: '/catalogo?categoria=tazas' },
  ]
} as const; // 'as const' hace que TypeScript infiera los tipos exactos y te avise si escribes mal una clave