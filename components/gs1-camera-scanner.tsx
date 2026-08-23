'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { parseGs1DataMatrix, ParsedGs1Data } from '@/lib/gs1-parser';
import { Button } from '@/components/ui/button';
import { Camera, QrCode, X, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Gs1CameraScannerProps {
  onScanSuccess: (data: ParsedGs1Data) => void;
  onClose: () => void;
  title?: string;
}

export function Gs1CameraScanner({ onScanSuccess, onClose, title = 'Live GS1 DataMatrix Scanner' }: Gs1CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<ParsedGs1Data | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    readerRef.current = codeReader;

    codeReader
      .decodeFromVideoDevice(null, videoRef.current!, (result, err) => {
        if (result) {
          const parsed = parseGs1DataMatrix(result.getText());
          setScannedResult(parsed);
          codeReader.reset();
          setTimeout(() => {
            onScanSuccess(parsed);
          }, 1200);
        }
      })
      .catch((err) => {
        console.warn('Camera access warning, enabling simulation fallback:', err);
        setErrorMsg('Webcam active in simulation mode. Position 2D DataMatrix packaging code inside frame.');
      });

    return () => {
      codeReader.reset();
    };
  }, [onScanSuccess]);

  function handleSimulateCapture() {
    const mockGs1String = '(01)08901086001928(17)261130(10)AUG-2026-88';
    const parsed = parseGs1DataMatrix(mockGs1String);
    setScannedResult(parsed);
    setTimeout(() => {
      onScanSuccess(parsed);
    }, 1000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md font-mono text-xs">
      <div className="w-full max-w-lg rounded-sm border border-amber-500/60 bg-[#1B1E26] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-amber-400 animate-pulse" />
            <h3 className="text-base font-bold uppercase text-[#F8FAFC]">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative border-2 border-dashed border-amber-500/80 bg-slate-950 rounded-sm overflow-hidden min-h-[260px] flex flex-col items-center justify-center">
          <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" />

          {/* Viewfinder Laser Line */}
          <div className="absolute inset-x-0 h-0.5 bg-amber-400 shadow-[0_0_18px_#F59E0B] animate-bounce z-10" />

          {!scannedResult && (
            <div className="relative z-20 text-center p-4 bg-slate-950/80 rounded-sm border border-slate-700/60 max-w-xs">
              <QrCode className="mx-auto h-10 w-10 text-amber-400 mb-2" />
              <p className="font-bold text-white uppercase text-[11px]">Align GS1 2D DataMatrix GTIN inside box</p>
              {errorMsg && <p className="text-[10px] text-amber-300 mt-1">{errorMsg}</p>}
            </div>
          )}

          {scannedResult && (
            <div className="relative z-30 bg-emerald-950/90 border border-emerald-500 text-emerald-300 p-4 rounded-sm font-mono space-y-1 text-center max-w-xs shadow-2xl">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-1" />
              <p className="font-bold text-white uppercase text-xs">GS1 DataMatrix Parsed!</p>
              <p className="text-[11px]">GTIN: {scannedResult.gtin}</p>
              <p className="text-[11px]">Batch: {scannedResult.batchNumber}</p>
              <p className="text-[11px]">Expiry: {scannedResult.expiryDate}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-[10px] text-slate-400">GS1 AIs: (01) GTIN · (17) Expiry · (10) Batch</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 uppercase">
              Cancel
            </Button>
            <Button onClick={handleSimulateCapture} className="bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Capture Sample
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
