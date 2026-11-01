'use client';

import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { siteConfig } from '@/app/lib/config';

Font.register({
  family: 'Cursive',
  src: '/fonts/cursive.ttf',
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#e0fdfd',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  watermark: {
    position: 'absolute',
    top: '35%',
    left: '30%',
    width: 200,
    opacity: 0.06,
    transform: 'rotate(-15deg)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: 1,
    borderColor: '#FCE7F3',
    paddingBottom: 20,
  },
  logo: {
    width: 80,
    height: 'auto',
  },
  brandName: {
    fontFamily: 'Cursive',
    fontSize: 32,
    color: '#b985e8',
    textAlign: 'right',
  },
  brandSubtitle: {
    fontSize: 8,
    color: '#78716C',
    letterSpacing: 2,
    textAlign: 'right',
    marginTop: 4,
  },
  clientSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  clientBox: {
    backgroundColor: '#FCE7F3',
    padding: 15,
    borderRadius: 5,
    width: '45%',
  },
  label: {
    fontSize: 9,
    color: '#b985e8',
    fontWeight: 'bold',
    marginBottom: 5,
    letterSpacing: 1,
  },
  text: {
    fontSize: 11,
    color: '#44403C',
    marginBottom: 4,
  },
  textLight: {
    fontSize: 10,
    color: '#78716C',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: 1,
    borderColor: '#9D174D',
    paddingBottom: 8,
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 9,
    color: '#9D174D',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderColor: '#FCE7F3',
    paddingVertical: 8,
    fontSize: 10,
    color: '#4403C',
  },
  colDesc: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '20%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right', fontWeight: 'bold' },
  
  // 🎨 ESTILOS MEJORADOS PARA TOTALES (Más espacio y jerarquía)
  totalSection: {
    marginTop: 30,
    alignItems: 'flex-end', // Alinea todo el bloque a la derecha
  },
  totalBox: {
    backgroundColor: '#FFFBF7', // Tono hueso muy suave y elegante
    border: '1pt solid #FCE7F3', // Borde sutil para definir el área
    borderRadius: 8,
    padding: 20, // Más espacio interno para que "respire"
    width: '45%', // Un poco más ancho para evitar compresión
    flexDirection: 'column', // Apila etiqueta y monto verticalmente
    alignItems: 'flex-end', // Alinea el texto a la derecha
  },
  totalLabel: {
    fontSize: 10,
    color: '#78716C', // Gris suave para no competir con el monto
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8, // Espacio entre la etiqueta y el número
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: 22, // Más grande para impacto visual
    fontWeight: 'bold',
    color: '#9D174D', // Color de marca
  },

  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: 1,
    borderColor: '#D4AF37',
    paddingTop: 15,
  },
  footerCursive: {
    fontFamily: 'Cursive',
    fontSize: 16,
    color: '#b985e8',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#78716C',
  },
});

interface PedidoPDFProps {
  pedido: any;
  tipo?: 'pedido' | 'presupuesto';
}

export const PedidoPDF = ({ pedido, tipo = 'pedido' }: PedidoPDFProps) => {
  const config = {
    pedido: {
      titulo: 'PEDIDO',
      labelTotal: 'TOTAL A PAGAR',
      mensajeCierre: '¡Gracias por confiar en Candy Ilusiones para hacer tus momentos especiales!',
      validez: 'Pago al retirar',
    },
    presupuesto: {
      titulo: 'PRESUPUESTO',
      labelTotal: 'TOTAL PRESUPUESTADO',
      mensajeCierre: '¡Gracias por confiar en Candy Ilusiones para hacer tus momentos especiales!',
      mensajevalidez: '¡Este presupuesto es válido por 15 días! Esperamos tu confirmación.',
      validez: 'Válido por: 15 días',
    },
  };

  const current: {
    titulo: string;
    labelTotal: string;
    mensajeCierre: string;
    mensajevalidez?: string;
    validez: string;
  } = config[tipo];
  const total = pedido?.productos?.reduce((acc: number, prod: any) => {
    const precio = prod.precioUnitario || prod.precio || 0;
    return acc + (prod.cantidad * precio);
  }, 0) || pedido?.total || 0;

  const logoSrc = "/img/logo-candy-removebg-preview.png";

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <Image style={styles.watermark} src={logoSrc} />

        <View style={styles.header}>
          <Image style={styles.logo} src={logoSrc} />
          <View>
            <Text style={styles.brandName}>Candy Ilusiones</Text>
            <Text style={styles.brandSubtitle}>PRODUCTOS PERSONALIZADOS CON AMOR</Text>
          </View>
        </View>

        <View style={styles.clientSection}>
          <View style={styles.clientBox}>
            <Text style={styles.label}>CLIENTE</Text>
            <Text style={styles.text}>{pedido.clienteNombre || 'Cliente'}</Text>
            <Text style={styles.textLight}>{pedido.clienteEmail || 'Sin email registrado'}</Text>
            <Text style={styles.textLight}>{pedido.clienteTelefono || 'Sin teléfono'}</Text>
          </View>
          <View style={{ width: '45%', alignItems: 'flex-end' }}>
            <Text style={[styles.label, { textAlign: 'right' }]}>
              {current.titulo} N° {pedido._id ? pedido._id.slice(-6).toUpperCase() : '000000'}
            </Text>
            <Text style={[styles.textLight, { marginTop: 5 }]}>
              Fecha: {pedido.createdAt ? new Date(pedido.createdAt).toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR')}
            </Text>
            <Text style={[styles.textLight, { marginTop: 5 }]}>{current.validez}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>DESCRIPCIÓN</Text>
          <Text style={styles.colQty}>CANT.</Text>
          <Text style={styles.colPrice}>PRECIO UNIT.</Text>
          <Text style={styles.colTotal}>TOTAL</Text>
        </View>

        {pedido.productos?.map((prod: any, index: number) => {
          const precio = prod.precioUnitario || prod.precio || 0;
          const subtotal = prod.cantidad * precio;
          
          return (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 0 ? { backgroundColor: '#FFFBF7' } : {}
              ]}
            >
              <Text style={styles.colDesc}>{prod.nombre || 'Producto'}</Text>
              <Text style={styles.colQty}>{prod.cantidad || 0}</Text>
              <Text style={styles.colPrice}>${precio.toLocaleString('es-AR')}</Text>
              <Text style={styles.colTotal}>${subtotal.toLocaleString('es-AR')}</Text>
            </View>
          );
        })}

        {/* 💰 5. TOTALES (DISEÑO PREMIUM MEJORADO) */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>{current.labelTotal}</Text> 
            <Text style={styles.totalAmount}>${total.toLocaleString('es-AR')}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerCursive}>{current.mensajeCierre}</Text>
          {current.mensajevalidez && (
            <Text style={styles.footerText}>{current.mensajevalidez}</Text>
          )} 
          <Text style={styles.footerText}>
              
            {siteConfig.companyName} -  {siteConfig.companyUrl} - {siteConfig.whatsapp} | {siteConfig.email}
          </Text>
        </View>

      </Page>
    </Document>
  );
};