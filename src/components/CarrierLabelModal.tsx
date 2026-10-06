import React from 'react';
import { useOmniStock } from '../context/OmniStockContext';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Box } from 'lucide-react';

export const CarrierLabelModal: React.FC = () => {
  const { shippingLabelModalData, setShippingLabelModalData, showNotification } = useOmniStock();

  if (!shippingLabelModalData) return null;

  const { so, carrier, tracking } = shippingLabelModalData;

  const handlePrint = () => {
    window.print();
    showNotification(`Sent label for ${so.soNumber} to Zebra ZT411 Thermal Printer`, 'info');
  };

  const handleDownload = () => {
    showNotification(`Digital shipping label ${tracking}.pdf generated and downloaded`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Commercial Carrier Dispatch Label</h2>
              <p className="text-[11px] text-zinc-400">Generated for Sales Order {so.soNumber}</p>
            </div>
          </div>
          <button
            onClick={() => setShippingLabelModalData(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Thermal 4x6 Label Canvas */}
        <div className="p-6 flex flex-col items-center bg-zinc-950">
          <div className="w-full max-w-[380px] bg-white text-black p-5 rounded shadow-lg border border-zinc-300 font-sans text-xs select-none">
            {/* Top Carrier Line */}
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2">
              <div className="font-extrabold text-xl tracking-tighter uppercase font-mono">
                {carrier.split(' ')[0]}
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold uppercase tracking-wider">PRIORITY EXPRESS SERVICE</div>
                <div className="text-[10px] font-mono font-bold">ZONE: 04 | 2-DAY</div>
              </div>
            </div>

            {/* Shipper & Consignee */}
            <div className="grid grid-cols-2 gap-2 text-[10px] border-b border-black pb-2 mb-2">
              <div>
                <span className="font-bold text-zinc-600 block">SHIP FROM:</span>
                <div className="font-bold">OmniStock East Megahub</div>
                <div>420 Freightport Way</div>
                <div>Newark, NJ 07114</div>
              </div>
              <div>
                <span className="font-bold text-zinc-600 block">SHIP TO:</span>
                <div className="font-bold">{so.customerName}</div>
                <div>100 Enterprise Way, Suite 400</div>
                <div>Austin, TX 78701</div>
              </div>
            </div>

            {/* Package Details */}
            <div className="flex items-center justify-between text-[10px] border-b border-black pb-2 mb-3">
              <div>
                <span className="text-zinc-600 font-medium">WEIGHT:</span> <strong className="font-mono">4.8 LBS</strong>
              </div>
              <div>
                <span className="text-zinc-600 font-medium">DIM:</span> <strong className="font-mono">14x10x6 IN</strong>
              </div>
              <div>
                <span className="text-zinc-600 font-medium">REF:</span> <strong className="font-mono">{so.soNumber}</strong>
              </div>
            </div>

            {/* Scannable Barcode Mockup */}
            <div className="py-2 text-center border-b border-black mb-2">
              <div className="font-mono text-xs tracking-widest font-bold mb-1">
                TRACKING #: {tracking}
              </div>
              {/* Vector Barcode Representation */}
              <div className="h-14 w-full flex items-center justify-center gap-1 bg-black p-1">
                {[...Array(32)].map((_, i) => (
                  <div
                    key={i}
                    className="h-full bg-white"
                    style={{
                      width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1.5 : 2.5)}px`,
                      marginRight: `${(i % 4 === 0 ? 2 : 1)}px`
                    }}
                  />
                ))}
              </div>
              <div className="text-[9px] font-mono tracking-widest mt-1">420 78701 {tracking.replace(/[^0-9]/g, '').slice(0, 10)}</div>
            </div>

            {/* Footer Routing Block */}
            <div className="flex items-center justify-between text-[9px] font-bold font-mono">
              <span>ORD: {so.soNumber}</span>
              <span className="uppercase">{so.channel} FULFILLMENT</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Carrier Electronic Manifest Uploaded</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white border border-zinc-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-sky-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Label (4x6)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
