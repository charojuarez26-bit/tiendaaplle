import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CashRegisterBreakdown } from '../services/cashRegisterService';
import { formatUSD, formatARS, formatDate } from './formatters';

export interface ArqueoDeclaration {
  declaredUSD?: number;
  declaredARS?: number;
  notes?: string;
}

export const generateCashClosePDF = (
  breakdown: CashRegisterBreakdown,
  arqueo?: ArqueoDeclaration
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado decorativo
  doc.setFillColor(29, 29, 31); // #1D1D1F
  doc.rect(0, 0, pageWidth, 5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(29, 29, 31);
  doc.text('World Apple', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(134, 134, 139);
  doc.text('Reporte Oficial de Cierre de Caja y Arqueo Diario', 14, 26);
  doc.text(`Fecha y Hora de Emisión: ${formatDate(new Date().toISOString())}`, 14, 31);

  // Badge de Arqueo
  doc.setFillColor(232, 240, 254);
  doc.setDrawColor(0, 113, 227);
  doc.roundedRect(pageWidth - 65, 14, 51, 14, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 113, 227);
  doc.text('ARQUEO CONFIRMADO', pageWidth - 60, 23);

  doc.setDrawColor(229, 229, 234);
  doc.line(14, 38, pageWidth - 14, 38);

  // Resumen Ejecutivo Superior
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(29, 29, 31);
  doc.text('RESUMEN GENERAL DEL PERÍODO', 14, 46);

  const startY = 52;
  const colW = (pageWidth - 28) / 3;

  // Tarjeta 1: Total Efectivo Físico USD
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(14, startY, colW - 3, 24, 2, 2, 'F');
  doc.setDrawColor(229, 229, 234);
  doc.roundedRect(14, startY, colW - 3, 24, 2, 2, 'D');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 115);
  doc.text('SALDO SISTEMA USD', 18, startY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(29, 29, 31);
  doc.text(formatUSD(breakdown.methods.efectivo_usd.saldo_usd), 18, startY + 16);

  // Tarjeta 2: Total Efectivo Físico ARS
  const col2X = 14 + colW;
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(col2X, startY, colW - 3, 24, 2, 2, 'F');
  doc.setDrawColor(229, 229, 234);
  doc.roundedRect(col2X, startY, colW - 3, 24, 2, 2, 'D');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 115);
  doc.text('SALDO SISTEMA ARS', col2X + 4, startY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(29, 29, 31);
  doc.text(formatARS(breakdown.methods.efectivo_ars.saldo_ars), col2X + 4, startY + 16);

  // Tarjeta 3: Cuentas y Tarjetas ARS
  const digitalArs =
    breakdown.methods.transferencia.saldo_ars +
    breakdown.methods.debito.saldo_ars +
    breakdown.methods.credito.saldo_ars;

  const col3X = 14 + colW * 2;
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(col3X, startY, colW - 3, 24, 2, 2, 'F');
  doc.setDrawColor(229, 229, 234);
  doc.roundedRect(col3X, startY, colW - 3, 24, 2, 2, 'D');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 115);
  doc.text('DIGITAL (BANCO / TARJETA)', col3X + 4, startY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 113, 227);
  doc.text(formatARS(digitalArs), col3X + 4, startY + 16);

  // Sección de Arqueo Físico (si fue ingresado)
  let tableStartY = startY + 34;

  if (arqueo && (arqueo.declaredUSD !== undefined || arqueo.declaredARS !== undefined)) {
    const diffUSD = (arqueo.declaredUSD ?? 0) - breakdown.methods.efectivo_usd.saldo_usd;
    const diffARS = (arqueo.declaredARS ?? 0) - breakdown.methods.efectivo_ars.saldo_ars;

    doc.setFillColor(245, 245, 247);
    doc.roundedRect(14, tableStartY, pageWidth - 28, 22, 2, 2, 'F');
    doc.setDrawColor(210, 210, 215);
    doc.roundedRect(14, tableStartY, pageWidth - 28, 22, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(29, 29, 31);
    doc.text('ARQUEO FÍSICO CONTADO EN CAJA:', 18, tableStartY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 85);
    doc.text(
      `Efectivo USD: Contado ${formatUSD(arqueo.declaredUSD || 0)} | Diferencia: ${
        diffUSD === 0 ? 'Exacto ($0)' : diffUSD > 0 ? `Sobrante +${formatUSD(diffUSD)}` : `Faltante -${formatUSD(Math.abs(diffUSD))}`
      }`,
      18,
      tableStartY + 12
    );

    doc.text(
      `Efectivo ARS: Contado ${formatARS(arqueo.declaredARS || 0)} | Diferencia: ${
        diffARS === 0 ? 'Exacto ($0)' : diffARS > 0 ? `Sobrante +${formatARS(diffARS)}` : `Faltante -${formatARS(Math.abs(diffARS))}`
      }`,
      18,
      tableStartY + 17
    );

    tableStartY += 28;
  }

  // Tabla discriminada por método de pago
  const methodNames: Record<string, string> = {
    efectivo_ars: 'Efectivo en Pesos (ARS)',
    efectivo_usd: 'Efectivo en Dólares (USD)',
    transferencia: 'Transferencias Bancarias',
    debito: 'Tarjetas de Débito',
    credito: 'Tarjetas de Crédito',
  };

  const tableBody = Object.entries(breakdown.methods).map(([key, data]) => {
    return [
      methodNames[key] || key,
      `${data.count} mov.`,
      key === 'efectivo_usd' ? formatUSD(data.ingresos_usd) : formatARS(data.ingresos_ars),
      key === 'efectivo_usd' ? formatUSD(data.egresos_usd) : formatARS(data.egresos_ars),
      key === 'efectivo_usd' ? formatUSD(data.saldo_usd) : formatARS(data.saldo_ars),
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: 14, right: 14 },
    head: [['Medio de Pago', 'Operaciones', 'Ingresos (+)', 'Egresos (-)', 'Saldo Neto']],
    body: tableBody,
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
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'right', cellWidth: 33, fontStyle: 'bold' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;

  // Firmas de Responsabilidad
  doc.setDrawColor(200, 200, 205);
  doc.line(20, finalY + 25, 80, finalY + 25);
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 115);
  doc.text('Firma Responsable de Caja', 30, finalY + 30);

  doc.line(pageWidth - 80, finalY + 25, pageWidth - 20, finalY + 25);
  doc.text('Firma Gerencia / Auditoría', pageWidth - 70, finalY + 30);

  // Pie de página
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 155);
  doc.text(
    `World Apple S.R.L. — Sistema de Caja Interno. Reporte de Arqueo Generado Automáticamente.`,
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  return doc;
};

export const downloadCashClosePDF = (
  breakdown: CashRegisterBreakdown,
  arqueo?: ArqueoDeclaration
) => {
  const doc = generateCashClosePDF(breakdown, arqueo);
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`Cierre_Caja_WorldApple_${dateStr}.pdf`);
};
