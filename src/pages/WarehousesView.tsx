import React, { useState } from 'react';
import { useOmniStock } from '../context/OmniStockContext';
import { 
  Warehouse, 
  MapPin, 
  Building2, 
  ArrowRightLeft, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowRight,
  Boxes,
  Compass,
} from 'lucide-react';

export const WarehousesView: React.FC = () => {
  const { 
    warehouses, 
    items, 
    stockLevels, 
    stockUnits, 
    transfers, 
    createTransferOrder, 
    receiveTransferOrder, 
    setIsCreateWarehouseModalOpen,
    showNotification 
  } = useOmniStock();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0].id);
  const [selectedBin, setSelectedBin] = useState<string | null>('A1-R04-S2-B08');

  // Transfer Form State
  const [transferFrom, setTransferFrom] = useState(warehouses[0].code);
  const [transferTo, setTransferTo] = useState(warehouses[1]?.code || warehouses[0].code);
  const [transferSku, setTransferSku] = useState(items[0]?.sku || '');
  const [transferQty, setTransferQty] = useState(10);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const activeWarehouse = warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];

  const handleCreateTransfer = () => {
    if (transferFrom === transferTo) {
      showNotification('Source and Destination warehouse cannot be the same', 'error');
      return;
    }
    createTransferOrder(transferFrom, transferTo, transferSku, transferQty);
    setIsTransferModalOpen(false);
  };

  // 2D Grid Bin Generator
  const racks = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06'];
  const shelves = ['S3', 'S2', 'S1'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Multi-Facility Warehousing & Bin Location Matrix</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time capacity tracking, 2D rack-bin topology maps, and inter-facility stock transfer pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateWarehouseModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Register Facility</span>
          </button>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-sky-500/20"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>New Transfer Order</span>
          </button>
        </div>
      </div>

      {/* Warehouse Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {warehouses.map((wh) => {
          const isSelected = wh.id === selectedWarehouseId;
          const whStock = stockLevels.filter((s) => s.warehouseId === wh.id);
          const totalUnits = whStock.reduce((acc, s) => acc + s.qtyOnHand, 0);

          return (
            <div
              key={wh.id}
              onClick={() => setSelectedWarehouseId(wh.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-zinc-900 border-sky-500/80 shadow-lg shadow-sky-500/10'
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                  {wh.code}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {wh.capacityUtilization}% Capacity
                </span>
              </div>
              <div className="font-bold text-base text-white">{wh.name}</div>
              <div className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>{wh.city}, {wh.state}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-zinc-800 mt-4 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    wh.capacityUtilization > 85 ? 'bg-rose-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${wh.capacityUtilization}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-3 pt-2 border-t border-zinc-800/60">
                <span>{wh.binCount} Bins Active</span>
                <span className="text-zinc-300 font-semibold">{totalUnits.toLocaleString()} Units</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2D Interactive Bin Rack Map */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Aisle 1 Visual Rack Topology: {activeWarehouse.name} ({activeWarehouse.code})</span>
            </h2>
            <p className="text-xs text-zinc-400">Click any rack-shelf-bin cell to inspect allocated serial/lot inventory</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50" />
              <span className="text-zinc-300">Allocated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-zinc-800 border border-zinc-700" />
              <span className="text-zinc-300">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/50" />
              <span className="text-zinc-300">Reserved</span>
            </div>
          </div>
        </div>

        {/* 2D Grid Rack Layout */}
        <div className="overflow-x-auto">
          <div className="min-w-[650px] space-y-3">
            {shelves.map((shelf) => (
              <div key={shelf} className="flex items-center gap-3">
                <span className="w-12 text-right font-mono text-xs text-zinc-500 font-semibold">
                  {shelf} (High)
                </span>
                <div className="flex-1 grid grid-cols-6 gap-2">
                  {racks.map((rack) => {
                    const binCode = `A1-${rack}-${shelf}-B08`;
                    const isTarget = binCode === 'A1-R04-S2-B08';
                    const isSelected = selectedBin === binCode;
                    return (
                      <button
                        key={rack}
                        onClick={() => setSelectedBin(binCode)}
                        className={`p-3 rounded-xl border text-center transition-all group ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-400 shadow-md shadow-sky-500/10'
                            : isTarget
                            ? 'bg-emerald-500/10 border-emerald-500/40 hover:border-emerald-400'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="font-mono text-[11px] font-bold text-white group-hover:text-sky-300">
                          {rack}-{shelf}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {isTarget ? 'MacBook M4' : 'Available'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Bin Inspection Drawer */}
        {selectedBin && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Inspected Bin Location</div>
              <div className="font-mono text-sm font-bold text-sky-400">{selectedBin}</div>
              <div className="text-xs text-zinc-300 mt-0.5">
                {selectedBin === 'A1-R04-S2-B08'
                  ? 'MacBook Pro 16" M4 Max / 64GB / 2TB (Lot: SN-APL-2026-X991)'
                  : 'Empty Bin Cell (Available for inbound putaway scan)'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded text-xs font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                Barcode: LOC-{selectedBin.replace(/-/g, '')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Inter-Warehouse Transfer Pipeline */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-sky-400" />
              <span>Inter-Warehouse Inventory Transfers</span>
            </h3>
            <p className="text-xs text-zinc-400">Stock in-transit deductions and destination receipt reconciliations</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="pb-3 font-semibold">Transfer ID</th>
                <th className="pb-3 font-semibold">Source Facility</th>
                <th className="pb-3 font-semibold">Destination Facility</th>
                <th className="pb-3 font-semibold">SKU & Item</th>
                <th className="pb-3 font-semibold">Qty</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {transfers.map((tr) => (
                <tr key={tr.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 text-sky-400 font-bold">{tr.id}</td>
                  <td className="py-3 text-zinc-300">{tr.fromWarehouse}</td>
                  <td className="py-3 text-zinc-300">{tr.toWarehouse}</td>
                  <td className="py-3 font-sans">
                    <span className="font-mono text-zinc-200 mr-2">{tr.sku}</span>
                    <span className="text-zinc-400 text-xs">{tr.itemName}</span>
                  </td>
                  <td className="py-3 text-white font-bold">{tr.quantity}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border ${
                        tr.status === 'RECEIVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                      }`}
                    >
                      {tr.status === 'RECEIVED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {tr.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-sans">
                    {tr.status === 'IN_TRANSIT' ? (
                      <button
                        onClick={() => receiveTransferOrder(tr.id)}
                        className="px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-400 text-[11px] font-bold text-zinc-950 transition-colors shadow-sm"
                      >
                        Receive Scan
                      </button>
                    ) : (
                      <span className="text-[11px] text-zinc-500 font-mono">Reconciled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wide">Initiate Stock Transfer Order</h3>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Source Warehouse (Deduction)</label>
              <select
                value={transferFrom}
                onChange={(e) => setTransferFrom(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.code}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Destination Warehouse (Credit)</label>
              <select
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.code}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Select Item SKU</label>
              <select
                value={transferSku}
                onChange={(e) => setTransferSku(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white font-mono"
              >
                {items.map((i) => (
                  <option key={i.id} value={i.sku}>{i.sku} — {i.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Quantity</label>
              <input
                type="number"
                value={transferQty}
                onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTransfer}
                className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-bold text-zinc-950"
              >
                Dispatch Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
