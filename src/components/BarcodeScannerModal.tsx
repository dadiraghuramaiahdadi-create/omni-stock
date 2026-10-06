import React, { useState } from 'react';
import { useOmniStock } from '../context/OmniStockContext';
import { 
  Scan, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  MapPin, 
  Plus, 
  Minus, 
  RefreshCw,
  QrCode,
  Barcode as BarcodeIcon
} from 'lucide-react';

export const BarcodeScannerModal: React.FC = () => {
  const { 
    isBarcodeModalOpen, 
    setIsBarcodeModalOpen, 
    items, 
    stockLevels, 
    stockUnits, 
    warehouses,
    adjustStock,
    showNotification 
  } = useOmniStock();

  const [scannedCode, setScannedCode] = useState('');
  const [matchedItem, setMatchedItem] = useState<any | null>(null);
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SCANNING' | 'MATCHED' | 'NOT_FOUND'>('IDLE');

  if (!isBarcodeModalOpen) return null;

  const handleScanCode = (code: string) => {
    setScannedCode(code);
    setScanStatus('SCANNING');

    setTimeout(() => {
      const item = items.find((i) => i.barcode === code || i.sku.toLowerCase() === code.toLowerCase());
      if (item) {
        const itemStock = stockLevels.filter((s) => s.itemId === item.id);
        const onHand = itemStock.reduce((acc, c) => acc + c.qtyOnHand, 0);
        const reserved = itemStock.reduce((acc, c) => acc + c.qtyReserved, 0);
        const unit = stockUnits.find((u) => u.itemId === item.id);

        setMatchedItem({
          item,
          onHand,
          reserved,
          available: onHand - reserved,
          binLocation: unit?.binLocation || 'A1-R01-S1-B01',
          lotNumber: unit?.serialOrLotNumber || 'LOT-STANDARD-2026',
        });
        setScanStatus('MATCHED');
      } else {
        setMatchedItem(null);
        setScanStatus('NOT_FOUND');
      }
    }, 400);
  };

  const handleQuickDelta = async (delta: number) => {
    if (!matchedItem) return;
    const defaultWh = warehouses[0];
    await adjustStock(
      matchedItem.item.id,
      defaultWh.id,
      delta,
      delta > 0 ? 'RECEIVING_CORRECTION' : 'CYCLE_COUNT',
      'Adjustment via handheld barcode optical scanner'
    );
    // Update local preview
    setMatchedItem((prev: any) => ({
      ...prev,
      onHand: prev.onHand + delta,
      available: prev.available + delta,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Optical Barcode & RFID Scanner</h2>
              <p className="text-[11px] text-zinc-400">Standard Web API / Handheld Scanner Emulator (Code128, EAN-13, QR)</p>
            </div>
          </div>
          <button
            onClick={() => setIsBarcodeModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="p-6 space-y-5">
          <div className="relative w-full h-44 rounded-xl bg-zinc-950 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center overflow-hidden group">
            {/* Viewfinder Reticle Corners */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-sky-400" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-sky-400" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-sky-400" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-sky-400" />

            {/* Laser Scanning Line Animation */}
            <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] animate-bounce duration-1000" />

            <div className="text-center z-10 space-y-1">
              <div className="flex justify-center gap-3 text-zinc-600">
                <BarcodeIcon className="w-8 h-8 animate-pulse text-zinc-500" />
                <QrCode className="w-8 h-8 animate-pulse text-zinc-500" />
              </div>
              <p className="text-xs text-zinc-400 font-mono">Position barcode within bounding box</p>
              <p className="text-[10px] text-zinc-500 font-mono">Camera: Auto-focus continuous / 60 FPS</p>
            </div>
          </div>

          {/* Quick Preset Buttons (Simulates Handheld Laser Scan) */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Instant Hardware Laser Scan Triggers:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleScanCode('097855174086')}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-xs text-left transition-all"
              >
                <div>
                  <div className="font-mono text-sky-400 text-[11px]">097855174086 (EAN-13)</div>
                  <div className="text-zinc-300 text-[11px] truncate">MX Master 3S Mouse</div>
                </div>
                <Scan className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => handleScanCode('195949123456')}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-xs text-left transition-all"
              >
                <div>
                  <div className="font-mono text-rose-400 text-[11px]">195949123456 (Code128)</div>
                  <div className="text-zinc-300 text-[11px] truncate">MacBook Pro 16" M4</div>
                </div>
                <Scan className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => handleScanCode('884116416181')}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-xs text-left transition-all"
              >
                <div>
                  <div className="font-mono text-amber-400 text-[11px]">884116416181 (UPC-A)</div>
                  <div className="text-zinc-300 text-[11px] truncate">Dell UltraSharp 4K</div>
                </div>
                <Scan className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => handleScanCode('027242923485')}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-xs text-left transition-all"
              >
                <div>
                  <div className="font-mono text-emerald-400 text-[11px]">027242923485 (QR Code)</div>
                  <div className="text-zinc-300 text-[11px] truncate">Sony WH-1000XM5</div>
                </div>
                <Scan className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Scanned Result Card */}
          {scanStatus === 'MATCHED' && matchedItem && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                    <CheckCircle2 className="w-3 h-3" /> MATCH RESOLVED
                  </span>
                  <div className="font-bold text-sm text-white">{matchedItem.item.name}</div>
                  <div className="text-xs font-mono text-sky-400">{matchedItem.item.sku}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 uppercase">Available Stock</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">{matchedItem.available}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bin: <strong className="text-white">{matchedItem.binLocation}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-sky-400" />
                  <span>Lot: <strong className="text-white">{matchedItem.lotNumber}</strong></span>
                </div>
              </div>

              {/* Instant Floor Adjustment Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-400 font-medium">Floor Staff Quick Adjust:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickDelta(-1)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 border border-zinc-700 transition-colors"
                  >
                    <Minus className="w-3 h-3" /> 1 Pick
                  </button>
                  <button
                    onClick={() => handleQuickDelta(1)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-400 text-xs font-mono text-zinc-950 font-bold transition-colors shadow-sm"
                  >
                    <Plus className="w-3 h-3" /> 1 Restock
                  </button>
                </div>
              </div>
            </div>
          )}

          {scanStatus === 'NOT_FOUND' && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>No item matches barcode: <code className="font-mono font-bold text-white">{scannedCode}</code></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
