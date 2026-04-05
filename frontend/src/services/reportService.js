import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateDossier = (country, indicators, history) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SOVEREIGN RISK DOSSIER', 14, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`DATE: ${date}`, 160, 25);

  // Country Info
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.text(`${country.name} (${country.code})`, 14, 55);
  
  doc.setFontSize(12);
  doc.text(`OFFICIAL CURRENCY: ${country.currency_code}`, 14, 65);

  // Risk Rating Box
  const score = country.latest_stress?.score || 0;
  const level = country.latest_stress?.risk_level || 'UNKNOWN';
  
  doc.setDrawColor(200, 200, 200);
  doc.rect(140, 50, 55, 25);
  doc.setFontSize(8);
  doc.text('CURRENT STRESS SCORE', 145, 55);
  doc.setFontSize(16);
  doc.setTextColor(score > 70 ? 190 : 0, 0, 0); // Red if high
  doc.text(`${score.toFixed(1)} / 100`, 145, 65);
  doc.setFontSize(8);
  doc.text(`RATING: ${level}`, 145, 72);

  // Indicator Table
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Macroeconomic Indicators', 14, 85);
  
  const tableData = Object.entries(indicators).map(([key, val]) => [
    key.replace('_', ' ').toUpperCase(),
    val.value?.toFixed(2) || 'N/A',
    val.trend || '—',
    val.recorded_date ? new Date(val.recorded_date).getFullYear() : '—'
  ]);

  autoTable(doc, {
    startY: 90,
    head: [['Indicator', 'Value', 'Trend', 'Year']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] } // indigo-600
  });

  // AI Analyst Paragraph
  const finalY = (doc).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('AI Risk Intelligence Summary', 14, finalY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  const summary = `Based on the latest data, ${country.name} exhibits a ${level} risk profile. The primary drivers of instability are ${indicators.inflation?.trend === '↑' ? 'rising inflationary pressures' : 'macroeconomic fluctuations'}. Our predictive models indicate a sentiment level of ${country.sentiment?.label || 'Neutral'}.`;
  
  const splitText = doc.splitTextToSize(summary, 180);
  doc.text(splitText, 14, finalY + 10);

  // Crisis Probability Stamp
  doc.setDrawColor(score > 70 ? 220 : 100);
  doc.setLineWidth(1);
  doc.rect(140, finalY + 30, 55, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PROBABILITY', 145, finalY + 38);
  doc.setFontSize(14);
  doc.text(`${score > 50 ? 'ELEVATED' : 'STABLE'}`, 145, finalY + 46);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('CrisisMonitor Institutional EWS — Generated via Antigravity AI Engine.', 14, 285);

  doc.save(`${country.code}_Risk_Dossier.pdf`);
};
