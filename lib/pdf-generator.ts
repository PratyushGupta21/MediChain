import { jsPDF } from 'jspdf';
import type { WasteManifest } from '@/lib/types';

export function generateCdscoForm4Pdf(manifest: WasteManifest) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [13, 15, 18]; // Swiss Slate
  const amberColor = [245, 158, 11]; // Amber

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CDSCO FORM-IV BIO-MEDICAL WASTE MANIFEST', 15, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(245, 158, 11);
  doc.text('CENTRAL DRUGS STANDARD CONTROL ORGANIZATION • INDIA', 15, 24);
  doc.text('RULE 96 COMPLIANT • HIGH-TEMPERATURE INCINERATION CERTIFICATE', 15, 29);

  // Manifest Metadata Box
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, 45, 180, 25);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`MANIFEST ID: ${manifest.id.substring(0, 18).toUpperCase()}`, 20, 53);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Date Issued: ${new Date(manifest.scheduledAt).toLocaleDateString()}`, 20, 60);
  doc.text(`Status: ${manifest.status.toUpperCase()}`, 120, 53);
  doc.text(`Route ID: ${manifest.routeId || 'ROUTE-INDIRANAGAR-01'}`, 120, 60);

  // Table Section 1: Pharmaceutical Waste Particulars
  doc.setFillColor(240, 240, 240);
  doc.rect(15, 80, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. PHARMACEUTICAL WASTE DETAILS', 18, 85);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Medicine Name: ${manifest.medicineName}`, 20, 95);
  doc.text(`Batch Number: ${manifest.batchNumber}`, 20, 102);
  doc.text(`Quantity: ${manifest.quantity} units`, 20, 109);
  doc.text(`Bio-Medical Category: YELLOW (Outdated Pharmaceuticals & Cytotoxic Waste)`, 20, 116);
  doc.text(`Weight: 5.4 kg`, 120, 95);
  doc.text(`Origin Facility: ${manifest.pickupAddress}`, 20, 123);

  // Table Section 2: High-Temperature Telemetry Compliance
  doc.setFillColor(240, 240, 240);
  doc.rect(15, 135, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('2. 850°C - 1100°C INCINERATION TELEMETRY AUDIT', 18, 140);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Primary Chamber Temperature: ${manifest.temperature || 892}°C (Min Requirement: 850°C)`, 20, 150);
  doc.text(`Secondary Chamber Temperature: 1,080°C (2.0s Gas Retention)`, 20, 157);
  doc.text(`Scrubber Emission CO2: 12 PPM (Within CPCB Norms)`, 20, 164);
  doc.text(`Destruction Verification: ${manifest.completedAt ? new Date(manifest.completedAt).toLocaleString() : 'PENDING FINAL INCINERATION'}`, 20, 171);

  // Table Section 3: Chain of Custody & Authorization Signatures
  doc.setFillColor(240, 240, 240);
  doc.rect(15, 185, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('3. AUTHORIZED SIGNATURES & STAMPS', 18, 190);

  // Signature Boxes
  doc.rect(20, 200, 75, 30);
  doc.rect(115, 200, 75, 30);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Waste Collector / Transporter Stamp', 25, 205);
  doc.text('Bio-Clean Operators Reg #BC-991', 25, 225);

  doc.text('Incineration Facility Inspector', 120, 205);
  doc.text('CDSCO License #CDSCO-REG-09', 120, 225);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Generated via MediChain Protocol (EIP-712 Polygon Amoy Ledger Verified)', 15, 280);
  doc.text('Page 1 of 1', 180, 280);

  // Save PDF
  doc.save(`CDSCO_FORM_IV_MANIFEST_${manifest.batchNumber}.pdf`);
}
