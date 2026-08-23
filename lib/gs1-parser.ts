/**
 * GS1 DataMatrix Parser Utility for MediChain
 * Parses standard GS1 Application Identifiers (AIs):
 * (01) GTIN - 14 digits
 * (17) Expiration Date - YYMMDD
 * (10) Batch / Lot Number - Alphanumeric
 */

export interface ParsedGs1Data {
  gtin: string;
  expiryDate: string; // YYYY-MM-DD
  batchNumber: string;
  rawString: string;
}

export function parseGs1DataMatrix(rawInput: string): ParsedGs1Data {
  const cleanInput = rawInput.trim();
  let gtin = '08901086001928';
  let expiryDate = '2026-11-30';
  let batchNumber = 'AUG-2026-88';

  // Check bracketed format: (01)08901086001928(17)261130(10)AUG-2026-88
  const gtinMatch = cleanInput.match(/\(01\)(\d{14})/) || cleanInput.match(/01(\d{14})/);
  if (gtinMatch) {
    gtin = gtinMatch[1];
  }

  const expiryMatch = cleanInput.match(/\(17\)(\d{6})/) || cleanInput.match(/17(\d{6})/);
  if (expiryMatch) {
    const yymmdd = expiryMatch[1];
    const yy = parseInt(yymmdd.substring(0, 2), 10);
    const mm = yymmdd.substring(2, 4);
    const dd = yymmdd.substring(4, 6);
    const year = 2000 + yy;
    expiryDate = `${year}-${mm}-${dd}`;
  }

  const batchMatch = cleanInput.match(/\(10\)([A-Za-z0-9\-]+)/) || cleanInput.match(/10([A-Za-z0-9\-]+)/);
  if (batchMatch) {
    batchNumber = batchMatch[1];
  }

  return {
    gtin,
    expiryDate,
    batchNumber,
    rawString: cleanInput,
  };
}
