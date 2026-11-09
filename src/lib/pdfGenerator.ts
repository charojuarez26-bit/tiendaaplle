import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Order } from '../types/database';
import { formatUSD, formatARS, formatDate } from './formatters';

export const generateOrderReceiptPDF = (order: Order): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // --- HEADER / LOGO STYLING ---
  // Barra superior decorativa Azul Apple
  doc.setFillColor(0, 113, 227); // #0071E3
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Título de la tienda
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(29, 29, 31); // #1D1D1F
  doc.text('World Apple', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(134, 134, 139); // #86868B
  doc.text('Tienda Oficial de iPhones y Accesorios', 14, 26);
  doc.text('Buenos Aires, Argentina • www.worldapple.com', 14, 31);

  // Badge de Estado (Aprobado y Cobrado o Pendiente)
  const isApproved = order.status === 'aprobado_cobrado';
  if (isApproved) {
    doc.setFillColor(236, 253, 245); // Emerald-50
    doc.setDrawColor(52, 199, 89); // Apple Green
    doc.roundedRect(pageWidth - 65, 14, 51, 14, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text('● PAGO APROBADO', pageWidth - 60, 23);
  } else {
    doc.setFillColor(254, 243, 199); // Amber-50
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(pageWidth - 65, 14, 51, 14, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.text('● PEDIDO PENDIENTE', pageWidth - 62, 23);
  }

  // Línea divisoria
  doc.setDrawColor(229, 229, 234);
  doc.setLineWidth(0.5);
  doc.line(14, 38, pageWidth - 14, 38);

  // --- DATOS DEL PEDIDO Y CLIENTE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(29, 29, 31);
  doc.text('COMPROBANTE DE COMPRA', 14, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 115);

  // Columna Izquierda: Información de la orden
  doc.text(`Número de Orden:`, 14, 53);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  doc.text(`${order.id}`, 46, 53);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 110, 115);
  doc.text(`Fecha y Hora:`, 14, 59);
  doc.setTextColor(29, 29, 31);
  doc.text(`${formatDate(order.created_at)}`, 46, 59);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 110, 115);
  doc.text(`Cotización Aplicada:`, 14, 65);
  doc.setTextColor(29, 29, 31);
  doc.text(`1 USD = ${formatARS(order.exchange_rate_used)}`, 46, 65);

  // Columna Derecha: Información del Cliente
  const colRightX = pageWidth / 2 + 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 110, 115);
  doc.text(`Cliente:`, colRightX, 53);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  doc.text(`${order.customer_name}`, colRightX + 28, 53);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 110, 115);
  doc.text(`WhatsApp:`, colRightX, 59);
  doc.setTextColor(29, 29, 31);
  doc.text(`${order.customer_phone}`, colRightX + 28, 59);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 110, 115);
  doc.text(`Modalidad:`, colRightX, 65);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 113, 227); // Azul Apple
  const deliveryLabel =
    order.delivery_type === 'envio'
      ? `Envío (${order.delivery_address || 'Dirección acordada'})`
      : 'Retiro en Sucursal Central';
  doc.text(deliveryLabel, colRightX + 28, 65, { maxWidth: 60 });

  // --- TABLA DE ITEMS (jspdf-autotable) ---
  const tableRows = order.items.map((item) => {
    const variantDesc = [
      item.selected_storage,
      item.selected_color,
      item.category === 'usado' ? 'Certificado' : item.category === 'nuevo' ? 'Sellado' : null,
    ]
      .filter(Boolean)
      .join(' • ');

    const itemTitle = variantDesc ? `${item.name}\n(${variantDesc})` : item.name;

    return [
      itemTitle,
      `${item.quantity}`,
      formatUSD(item.unit_price_usd),
      formatUSD(item.subtotal_usd),
      formatARS(item.subtotal_usd * order.exchange_rate_used),
    ];
  });

  autoTable(doc, {
    startY: 75,
    margin: { left: 14, right: 14 },
    head: [['Producto / Variantes', 'Cant.', 'Precio Unit. (USD)', 'Subtotal USD', 'Subtotal ARS']],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      fillColor: [245, 245, 247],
      textColor: [29, 29, 31],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 4,
    },
    bodyStyles: {
      textColor: [29, 29, 31],
      fontSize: 8.5,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'right', cellWidth: 33 },
    },
    didDrawPage: () => {},
  });

  // Posición después de la tabla
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // --- RECUADRO DE TOTALES ---
  const totalsBoxX = pageWidth - 90;
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(totalsBoxX, finalY, 76, 32, 2, 2, 'F');
  doc.setDrawColor(229, 229, 234);
  doc.roundedRect(totalsBoxX, finalY, 76, 32, 2, 2, 'D');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 115);
  doc.text('Medio de Pago:', totalsBoxX + 4, finalY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  const paymentLabel = order.payment_method
    ? order.payment_method.replace('_', ' ').toUpperCase()
    : 'EFECTIVO / TRANSF.';
  doc.text(paymentLabel, totalsBoxX + 72, finalY + 7, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 110, 115);
  doc.text('Total Dólares:', totalsBoxX + 4, finalY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(29, 29, 31);
  doc.text(formatUSD(order.total_usd), totalsBoxX + 72, finalY + 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 115);
  doc.text('Total Pesos (ARS):', totalsBoxX + 4, finalY + 24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 113, 227); // Azul Apple
  doc.text(formatARS(order.total_ars), totalsBoxX + 72, finalY + 24, { align: 'right' });

  // --- TÉRMINOS Y CONDICIONES / GARANTÍA ---
  const legalY = Math.max(finalY + 45, 235);
  doc.setDrawColor(229, 229, 234);
  doc.line(14, legalY - 6, pageWidth - 14, legalY - 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(29, 29, 31);
  doc.text('POLÍTICAS DE GARANTÍA Y SOPORTE WORLD APPLE', 14, legalY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(134, 134, 139);
  const legalText =
    '• Los iPhones nuevos cuentan con 1 año de garantía oficial Apple internacional ante cualquier falla de hardware.\n' +
    '• Los iPhones usados certificados cuentan con 6 meses de garantía escrita con cobertura de servicio técnico World Apple.\n' +
    '• Conserve este comprobante digital o impreso para validar la garantía y realizar gestiones de postventa.\n' +
    '• Soporte oficial vía WhatsApp: +54 9 11 5566-7788 | Horario de atención: Lunes a Sábados 10:00 a 19:30 hs.';
  doc.text(legalText, 14, legalY + 5, { maxWidth: pageWidth - 28 });

  // Pie de página minimalista
  doc.setFontSize(7);
  doc.setTextColor(170, 170, 175);
  doc.text(
    `World Apple S.R.L. — Documento generado el ${new Date().toLocaleDateString('es-AR')}. No válido como factura fiscal tipo A.`,
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  return doc;
};

// Utilidad para descargar directamente el comprobante
export const downloadReceiptPDF = (order: Order) => {
  const doc = generateOrderReceiptPDF(order);
  const cleanId = order.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
  doc.save(`Ticket_WorldApple_${cleanId}.pdf`);
};
