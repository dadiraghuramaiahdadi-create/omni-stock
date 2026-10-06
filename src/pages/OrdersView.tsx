import React, { useState } from 'react';
import { useOmniStock } from '../context/OmniStockContext';
import { SalesOrder, CarrierName, SOStatus } from '../types';
import { 
  ShoppingCart, 
  PackageCheck, 
  Truck, 
  Printer, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { 
    salesOrders, 
    currentOrg, 
    fulfillSalesOrder, 
    setShippingLabelModalData, 
    getItemStockTotal,
    showNotification 
  } = useOmniStock();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [fulfillingOrder, setFulfillingOrder] = useState<SalesOrder | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierName>('FedEx Priority');

  const CARRIER_RATES: { name: CarrierName; transit: string; rate: number }[] = [
    { name: 'FedEx Priority', transit: 'Next Business Day', rate: 24.50 },
    { name: 'UPS Worldwide', transit: '2-Day Guaranteed', rate: 18.20 },
    { name: 'DHL Express', transit: 'Expedited Air', rate: 29.80 },
    { name: 'USPS Commercial', transit: '3-Day Ground', rate: 9.90 },
  ];

  const filteredOrders = salesOrders.filter((so) => {
    if (statusFilter === 'ALL') return true;
    return so.status === statusFilter;
  });

  const handleExecuteFulfillment = async () => {
    if (!fulfillingOrder) return;
    const res = await fulfillSalesOrder(fulfillingOrder.id, selectedCarrier);
    if (res.success && res.trackingNumber) {
      setShippingLabelModalData({
        so: fulfillingOrder,
        carrier: selectedCarrier,
        tracking: res.trackingNumber,
      });
      setFulfillingOrder(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Sales Orders & Automated Omnichannel Fulfillment</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Atomic batch pick lists, carrier rate comparison, and automated dispatch label generation
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['ALL', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="p-3.5 font-semibold">Order #</th>
                <th className="p-3.5 font-semibold">Channel</th>
                <th className="p-3.5 font-semibold">Customer</th>
                <th className="p-3.5 font-semibold">Allocated SKUs</th>
                <th className="p-3.5 font-semibold">Order Total</th>
                <th className="p-3.5 font-semibold">Tracking #</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filteredOrders.map((so) => {
                const isShipped = so.status === 'SHIPPED' || so.status === 'DELIVERED';
                return (
                  <tr key={so.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3.5 text-sky-400 font-bold">{so.soNumber}</td>
                    <td className="p-3.5 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {so.channel}
                      </span>
                    </td>
                    <td className="p-3.5 font-sans text-zinc-200 font-medium">{so.customerName}</td>
                    <td className="p-3.5 font-sans">
                      {so.items.map((i) => (
                        <div key={i.itemId} className="text-xs">
                          <span className="font-mono text-zinc-400">{i.quantity}x</span>{' '}
                          <span className="font-mono text-sky-400">{i.sku}</span>
                        </div>
                      ))}
                    </td>
                    <td className="p-3.5 text-zinc-100 font-bold">
                      {currentOrg.currencySymbol}{so.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5">
                      {so.trackingNumber ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Truck className="w-3.5 h-3.5" />
                          <span>{so.trackingNumber}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3.5 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border ${
                          so.status === 'DELIVERED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : so.status === 'SHIPPED'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            : so.status === 'PACKED'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {so.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      {isShipped ? (
                        <button
                          onClick={() => {
                            if (so.carrier && so.trackingNumber) {
                              setShippingLabelModalData({
                                so,
                                carrier: so.carrier,
                                tracking: so.trackingNumber,
                              });
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 border border-zinc-700 transition-colors"
                        >
                          View Label
                        </button>
                      ) : (
                        <button
                          onClick={() => setFulfillingOrder(so)}
                          className="px-3 py-1 rounded bg-sky-500 hover:bg-sky-400 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-sky-500/20"
                        >
                          Fulfill & Dispatch
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

      {/* Fulfillment & Carrier Dispatch Modal */}
      {fulfillingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-mono mb-1">
                <PackageCheck className="w-4 h-4" />
                <span>ORDER FULFILLMENT PIPELINE</span>
              </div>
              <h2 className="text-base font-bold text-white">
                Fulfill Order {fulfillingOrder.soNumber} ({fulfillingOrder.customerName})
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Executing atomic stock deduction with row-level locks and carrier dispatch booking
              </p>
            </div>

            {/* Carrier Rate Selection */}
            <div className="p-6 space-y-4">
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Select Optimal Carrier Route:
              </div>

              <div className="space-y-2">
                {CARRIER_RATES.map((carrier) => (
                  <label
                    key={carrier.name}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedCarrier === carrier.name
                        ? 'bg-sky-500/10 border-sky-400 shadow-md shadow-sky-500/10'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="carrier"
                        checked={selectedCarrier === carrier.name}
                        onChange={() => setSelectedCarrier(carrier.name)}
                        className="text-sky-500 focus:ring-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{carrier.name}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{carrier.transit}</div>
                      </div>
                    </div>
                    <div className="font-mono text-xs font-bold text-emerald-400">
                      ${carrier.rate.toFixed(2)}
                    </div>
                  </label>
                ))}
              </div>

              {/* Order Lines summary */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                <span className="font-semibold text-zinc-400 block mb-1">Stock Lines to Deduct:</span>
                {fulfillingOrder.items.map((line) => (
                  <div key={line.itemId} className="flex justify-between font-mono text-zinc-300">
                    <span>{line.quantity}x {line.name} ({line.sku})</span>
                    <span className="text-emerald-400">Available ✓</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-end gap-2">
              <button
                onClick={() => setFulfillingOrder(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteFulfillment}
                className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-sky-500/20"
              >
                Authorize Deduction & Print Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
