'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import Image from 'next/image';

// Registrar fuente Helvetica (ya viene con @react-pdf/renderer)
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helvetica/v12/HELVETICA.woff', fontWeight: 'normal' },
        { src: 'https://fonts.gstatic.com/s/helvetica/v12/HELVETICA_BOLD.woff', fontWeight: 'bold' }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
        borderBottom: 1,
        borderColor: '#FCE7F3',
        paddingBottom: 20,
    },
    brandName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#9D174D',
    },
    brandSubtitle: {
        fontSize: 10,
        color: '#78716C',
        marginTop: 4,
        letterSpacing: 1,
    },
    logo: {
        width: 80,
        height: 'auto',
    },
    projectInfo: {
        alignItems: 'flex-end',
    },
    projectTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#44403C',
        marginBottom: 4,
    },
    projectDate: {
        fontSize: 10,
        color: '#78716C',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#44403C',
        marginBottom: 15,
        marginTop: 10,
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
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: 1,
        borderColor: '#FCE7F3',
        paddingVertical: 8,
        fontSize: 10,
        color: '#44403C',
    },
    colDesc: { width: '50%' },
    colQty: { width: '15%', textAlign: 'center' },
    colPrice: { width: '20%', textAlign: 'right' },
    colTotal: { width: '15%', textAlign: 'right', fontWeight: 'bold' },
    totalSection: {
        marginTop: 30,
        alignItems: 'flex-end',
    },
    totalBox: {
        backgroundColor: '#FFFBF7',
        border: '1pt solid #FCE7F3',
        borderRadius: 8,
        padding: 20,
        width: '45%',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: 9,
        color: '#78716C',
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#9D174D',
    },
    totalAmountFinal: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#9D174D',
        marginTop: 4,
    },
    notesBox: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#FFF1F2',
        borderRadius: 8,
        border: '1pt solid #FECDD3',
    },
    notesTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9D174D',
        marginBottom: 5,
    },
    notesText: {
        fontSize: 10,
        color: '#44403C',
        lineHeight: 1.5,
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
        fontSize: 8,
        color: '#78716C',
    },
    manualBadge: {
        fontSize: 7,
        color: '#92400E',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 3,
        marginLeft: 5,
        fontWeight: 'bold',
    },
});

interface InsumoPDF {
    nombre: string;
    unidadMedida: string;
    costoUnitario: number;
    cantidad: number;
    subtotal: number;
    esPersonalizado?: boolean;
}

interface DatosPresupuesto {
    nombreProyecto: string;
    notasInternas?: string;
    insumos: InsumoPDF[];
    costoTotal: number;
    precioFinal: number;
    fecha: string;
}

export const PresupuestoInternoPDF = ({ datos }: { datos: DatosPresupuesto }) => {
      const logoSrc = "/img/logo-candy-removebg-preview.png";
    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Encabezado */}

                <View style={styles.header}>
                    <Image style={styles.logo} src={logoSrc}  alt="Logo Candy Ilusiones" />
                  
                </View>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brandName}>Candy Ilusiones</Text>
                        <Text style={styles.brandSubtitle}>PRESUPUESTO INTERNO DE COSTOS</Text>
                    </View>
                    <View style={styles.projectInfo}>
                        <Text style={styles.projectTitle}>Proyecto: {datos.nombreProyecto}</Text>
                        <Text style={styles.projectDate}>Fecha: {datos.fecha}</Text>
                    </View>
                </View>

                {/* Tabla de Insumos */}
                <Text style={styles.sectionTitle}>Desglose de Materiales y Costos</Text>

                <View style={styles.tableHeader}>
                    <Text style={styles.colDesc}>Descripción</Text>
                    <Text style={styles.colQty}>Cant.</Text>
                    <Text style={styles.colPrice}>Costo Unit.</Text>
                    <Text style={styles.colTotal}>Subtotal</Text>
                </View>

                {datos.insumos.map((prod, index) => (
                    <View
                        key={index}
                        style={[
                            styles.tableRow,
                            index % 2 === 0 ? { backgroundColor: '#FFFBF7' } : {}
                        ]}
                    >
                        <View style={styles.colDesc}>
                            <Text>{prod.nombre}</Text>
                            {prod.esPersonalizado && (
                                <Text style={styles.manualBadge}>MANUAL</Text>
                            )}
                        </View>
                        <Text style={styles.colQty}>{prod.cantidad}</Text>
                        <Text style={styles.colPrice}>${prod.costoUnitario.toLocaleString('es-AR')}</Text>
                        <Text style={styles.colTotal}>${prod.subtotal.toLocaleString('es-AR')}</Text>
                    </View>
                ))}

                {/* Totales */}
                <View style={styles.totalSection}>
                    <View style={styles.totalBox}>
                        <Text style={styles.totalLabel}>Costo Total de Producción</Text>
                        <Text style={styles.totalAmount}>${datos.costoTotal.toLocaleString('es-AR')}</Text>

                        <View style={{ marginTop: 15, width: '100%', height: 1, backgroundColor: '#FCE7F3' }} />

                        <Text style={{ ...styles.totalLabel, marginTop: 10, color: '#9D174D' }}>
                            Precio Final Sugerido
                        </Text>
                        <Text style={styles.totalAmountFinal}>
                            ${datos.precioFinal.toLocaleString('es-AR')}
                        </Text>
                    </View>
                </View>

                {/* Notas Internas */}
                {datos.notasInternas && (
                    <View style={styles.notesBox}>
                        <Text style={styles.notesTitle}>📝 NOTAS INTERNAS:</Text>
                        <Text style={styles.notesText}>{datos.notasInternas}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Documento generado para uso interno · Candy Ilusiones</Text>
                    <Text style={{ marginTop: 4 }}>www.candyilusiones.com.ar</Text>
                </View>

            </Page>
        </Document>
    );
};