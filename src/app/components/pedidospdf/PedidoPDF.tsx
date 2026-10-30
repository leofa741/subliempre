import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Registramos fuentes elegantes (Times-Roman para títulos, Helvetica para texto)
Font.register({
  family: 'Times-Roman',
  fonts: [{ src: 'https://fonts.gstatic.com/s/timesnewroman/v1/TimesNewRoman.ttf' }] // Fallback seguro
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFBF7', // Fondo cremoso
    fontFamily: 'Helvetica',
    color: '#44403C', // stone-700
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#FCE7F3', // rose-100
  },
  brandSection: {
    flexDirection: 'column',
  },
  brandName: {
    fontSize: 28,
    fontFamily: 'Times-Roman',
    color: '#BE185D', // rose-700
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 10,
    color: '#9D174D', // rose-800
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  documentInfo: {
    textAlign: 'right',
  },
  docTitle: {
    fontSize: 18,
    fontFamily: 'Times-Roman',
    color: '#BE185D',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  docDate: {
    fontSize: 10,
    color: '#78716C', // stone-500
  },
  clientSection: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#FFF1F2', // rose-50
    borderRadius: 8,
    border: 1,
    borderColor: '#FCE7F3',
  },
  clientTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#BE185D',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  clientText: {
    fontSize: 11,
    color: '#44403C',
    marginBottom: 4,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FCE7F3', // rose-100
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottom: 1,
    borderBottomColor: '#FEE2E2', // rose-100
    fontSize: 11,
  },
  col1: { width: '50%', fontWeight: 'bold', color: '#1C1917' },
  col2: { width: '15%', textAlign: 'center', color: '#57534E' },
  col3: { width: '15%', textAlign: 'right', color: '#57534E' },
  col4: { width: '20%', textAlign: 'right', fontWeight: 'bold', color: '#1C1917' },
  
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalsBox: {
    width: '40%',
    padding: 15,
    backgroundColor: '#FFFBF7',
    borderRadius: 8,
    border: 1,
    borderColor: '#FCE7F3',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 11,
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTop: 2,
    borderTopColor: '#FCE7F3',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#BE185D',
  },
  notesSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F0FDFA', // teal-50 (suave)
    borderRadius: 8,
    border: 1,
    borderColor: '#CCFBF1',
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F766E',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 10,
    color: '#115E59',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#A8A29E',
    borderTop: 1,
    borderTopColor: '#E7E5E4',
    paddingTop: 15,
  },
});

interface PedidoPDFProps {
  pedido: any;
}

export const PedidoPDF = ({ pedido }: PedidoPDFProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandSection}>
            <Text style={styles.brandName}>Candy Ilusiones</Text>
            <Text style={styles.brandTagline}>Productos Personalizados con Amor</Text>
            <Text style={{...styles.clientText, marginTop: 8, fontSize: 9}}>📍 Buenos Aires, Argentina</Text>
            <Text style={{...styles.clientText, fontSize: 9}}>📱 +54 9 11 4146 1312</Text>
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.docTitle}>Comprobante de Pedido</Text>
            <Text style={styles.docDate}>Nº {pedido._id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.docDate}>Fecha: {formatDate(pedido.createdAt)}</Text>
            <Text style={styles.docDate}>Entrega estimada: {formatDate(pedido.fechaEntregaEstimada)}</Text>
          </View>
        </View>

        {/* Datos del Cliente */}
        <View style={styles.clientSection}>
          <Text style={styles.clientTitle}>Datos de la Clienta</Text>
          <Text style={styles.clientText}><Text style={{fontWeight: 'bold'}}>Nombre:</Text> {pedido.clienteNombre}</Text>
          <Text style={styles.clientText}><Text style={{fontWeight: 'bold'}}>Teléfono:</Text> {pedido.clienteTelefono}</Text>
        </View>

        {/* Tabla de Productos */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Producto</Text>
            <Text style={styles.col2}>Cant.</Text>
            <Text style={styles.col3}>Precio Unit.</Text>
            <Text style={styles.col4}>Subtotal</Text>
          </View>
          {pedido.productos.map((item: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.nombre}</Text>
              <Text style={styles.col2}>{item.cantidad}</Text>
              <Text style={styles.col3}>{formatPrice(item.precioUnitario)}</Text>
              <Text style={styles.col4}>{formatPrice(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Total del Pedido:</Text>
              <Text>{formatPrice(pedido.total)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Seña / Adelanto:</Text>
              <Text style={{color: '#059669'}}>- {formatPrice(pedido.seña)}</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text>Saldo Pendiente:</Text>
              <Text>{formatPrice(pedido.saldoPendiente)}</Text>
            </View>
          </View>
        </View>

        {/* Notas */}
        {pedido.notas && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Observaciones</Text>
            <Text style={styles.notesText}>{pedido.notas}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>¡Gracias por confiar en nosotras para hacer tus momentos especiales! 💜</Text>
          <Text style={{marginTop: 4}}>Candy Ilusiones © {new Date().getFullYear()} • Todos los derechos reservados</Text>
        </View>

      </Page>
    </Document>
  );
};