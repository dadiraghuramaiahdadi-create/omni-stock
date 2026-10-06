import React, { useState } from 'react';
import { useOmniStock } from '../context/OmniStockContext';
import { PurchaseOrder, POStatus } from '../types';
import { 
  Truck, 
  PackageCheck, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Plus, 
  Building2,
  DollarSign,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const PurchasingView: React.FC = () => {
  const { 
    purchaseOrders, 
    items, 
    currentOrg, 
    receivePurchaseOrder, 
    showNotification 
  } = useOmniStock();

  const [receivingPo, setReceivingPo] = useState<PurchaseOrder | null>(null);
  const [receiveQuantity, setReceiveQuantity] = useState<number>(10);

  const handleConfirmReceipt = async () => {
    if (!receivingPo) return;
    const res = await receivePurchaseOrder(receivingPo.id, receiveQuantity);
    if (res.success) {
      setReceivingPo(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Procure-to-Pay (P2P) & Inbound Receiving</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Vendor master, automated Goods Receipt Notes (GRN), lot/serial allocation, and three-way invoice matching
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            showNotification('New RFQ draft initiated for Vendor: Apple Wholesale Direct', 'info');
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Inbound PO</span>
        </button>
      </div>

      {/* Lifecycle Stepper Graphic */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          Automated Three-Way Matching Flow:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 font-bold text-xs">
              1
            </div>
            <div>
              <div className="text-xs font-bold text-white">Purchase Order</div>
              <div className="text-[10px] text-zinc-400">Authorized vendor terms</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs">
              2
            </div>
            <div>
              <div className="text-xs font-bold text-white">Goods Receipt Note</div>
              <div className="text-[10px] text-zinc-400">Dock scan & lot allocation</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">
              3
            </div>
            <div>
              <div className="text-xs font-bold text-white">Vendor Bill Match</div>
              <div className="text-[10px] text-zinc-400">AP variance validation</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-xs">
              4
            </div>
            <div>
              <div className="text-xs font-bold text-white">Stock Credited</div>
              <div className="text-[10px] text-zinc-400">Available for checkout</div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="p-3.5 font-semibold">PO Number</th>
                <th className="p-3.5 font-semibold">Vendor Supplier</th>
                <th className="p-3.5 font-semibold">Item & Qty</th>
                <th className="p-3.5 font-semibold">Total PO Value</th>
                <th className="p-3.5 font-semibold">GRN Receipt #</th>
                <th className="p-3.5 font-semibold">Vendor Bill #</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {purchaseOrders.map((po) => {
                const isFullyReceived = po.status === 'RECEIVED';
                const firstLine = po.items[0];

                return (
                  <tr key={po.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3.5 text-sky-400 font-bold">{po.poNumber}</td>
                    <td className="p-3.5 font-sans text-zinc-200 font-semibold">{po.vendorName}</td>
                    <td className="p-3.5 font-sans">
                      {firstLine && (
                        <div>
                          <span className="font-mono text-white font-bold">{firstLine.quantityOrdered}x</span>{' '}
                          <span className="font-mono text-sky-400">{firstLine.sku}</span>
                          <div className="text-[10px] text-zinc-400">Recv: {firstLine.quantityReceived} units</div>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-zinc-100 font-bold">
                      {currentOrg.currencySymbol}{po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5">
                      {po.grnNumber ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {po.grnNumber}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">Pending Dock</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {po.billNumber ? (
                        <span className="text-indigo-400 font-medium">{po.billNumber}</span>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">Unbilled</span>
                      )}
                    </td>
                    <td className="p-3.5 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border ${
                          isFullyReceived
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : po.status === 'PARTIALLY_RECEIVED'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {po.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      {isFullyReceived ? (
                        <span className="text-xs text-zinc-500 font-mono">Matched 3-Way</span>
                      ) : (
                        <button
                          onClick={() => {
                            setReceivingPo(po);
                            setReceiveQuantity(firstLine?.quantityOrdered || 10);
                          }}
                          className="px-3 py-1 rounded bg-sky-500 hover:bg-sky-400 text-xs font-bold text-zinc-950 transition-colors shadow-sm"
                        >
                          Receive Dock GRN
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Goods Receipt Note (GRN) Receiving Modal */}
      {receivingPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-zinc-800 bg-zinc-950/60">
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 mb-1">
                <FileCheck className="w-4 h-4" />
                <span>INBOUND GOODS RECEIPT NOTE (GRN)</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Receive Shipment for {receivingPo.poNumber}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Vendor: {receivingPo.vendorName}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Quantity Physically Received</label>
                <input
                  type="number"
                  value={receiveQuantity}
                  onChange={(e) => setReceiveQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-sm font-mono text-white font-bold"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-2">
                <div className="font-semibold text-white">Automated Pipeline Triggers:</div>
                <ul className="space-y-1 text-[11px] text-zinc-400 list-disc list-inside font-mono">
                  <li>Creates immutable Goods Receipt Note (GRN)</li>
                  <li>Generates serial / lot tracking batch with 2028 expiry</li>
                  <li>Assigns putaway rack location in East Megahub</li>
                  <li>Generates matched vendor invoice in Accounts Payable</li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-end gap-2">
              <button
                onClick={() => setReceivingPo(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReceipt}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Generate GRN & Credit Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
