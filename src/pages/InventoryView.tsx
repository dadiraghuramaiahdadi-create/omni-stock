import React, { useState, useMemo } from 'react';
import { useOmniStock } from '../context/OmniStockContext';
import { Item, AdjustmentReason } from '../types';
import { 
  Search, 
  ArrowUpDown, 
  AlertTriangle, 
  SlidersHorizontal, 
  Download, 
  Plus, 
  Minus, 
  MapPin, 
  Package, 
  CheckCircle2, 
  X,
  FileSpreadsheet,
  Layers,
  Building2,
  Barcode as BarcodeIcon,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { 
    items, 
    stockLevels, 
    stockUnits, 
    warehouses, 
    currentOrg, 
    getItemStockTotal, 
    adjustStock,
    setIsCreateItemModalOpen,
    showNotification 
  } = useOmniStock();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPTIMAL' | 'LOW' | 'CRITICAL'>('ALL');
  const [sortField, setSortField] = useState<'sku' | 'name' | 'available' | 'valuation'>('available');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  
  // Quick Adjust Drawer State
  const [adjustingItem, setAdjustingItem] = useState<Item | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<AdjustmentReason>('CYCLE_COUNT');
  const [adjustWarehouseId, setAdjustWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Enriched Items
  const enrichedItems = useMemo(() => {
    return items.map((item) => {
      let onHand = 0;
      let reserved = 0;

      if (selectedWarehouse === 'ALL') {
        const total = getItemStockTotal(item.id);
        onHand = total.onHand;
        reserved = total.reserved;
      } else {
        const sl = stockLevels.find((s) => s.itemId === item.id && s.warehouseId === selectedWarehouse);
        onHand = sl?.qtyOnHand || 0;
        reserved = sl?.qtyReserved || 0;
      }

      const available = onHand - reserved;
      const valuation = onHand * item.costPrice;

      let status: 'OPTIMAL' | 'LOW' | 'CRITICAL' = 'OPTIMAL';
      if (available <= item.reorderPoint / 2) {
        status = 'CRITICAL';
      } else if (available <= item.reorderPoint) {
        status = 'LOW';
      }

      const units = stockUnits.filter((u) => u.itemId === item.id);

      return {
        ...item,
        onHand,
        reserved,
        available,
        valuation,
        status,
        units,
      };
    });
  }, [items, stockLevels, stockUnits, selectedWarehouse, getItemStockTotal]);

  // Filtering
  const filteredItems = useMemo(() => {
    return enrichedItems
      .filter((item) => {
        const matchesSearch =
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.barcode.includes(searchQuery) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [enrichedItems, searchQuery, statusFilter, sortField, sortAsc]);

  const toggleSort = (field: 'sku' | 'name' | 'available' | 'valuation') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItemIds(filteredItems.map((i) => i.id));
    } else {
      setSelectedItemIds([]);
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['SKU,Name,Category,Barcode,On Hand,Reserved,Available,Reorder Point,Cost Price,Selling Price,Valuation']
        .concat(
          filteredItems.map(
            (i) =>
              `"${i.sku}","${i.name}","${i.category}","${i.barcode}",${i.onHand},${i.reserved},${i.available},${i.reorderPoint},${i.costPrice},${i.sellingPrice},${i.valuation}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `omnistock-inventory-${currentOrg.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported ${filteredItems.length} inventory records to CSV`, 'success');
  };

  const handleExecuteAdjustment = async () => {
    if (!adjustingItem || adjustDelta === 0) return;
    await adjustStock(
      adjustingItem.id,
      adjustWarehouseId,
      adjustDelta,
      adjustReason,
      adjustNotes || 'Manual ledger reconciliation'
    );
    setAdjustingItem(null);
    setAdjustDelta(0);
    setAdjustNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Real-Time Multi-Tenant Inventory Ledger</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Row-level locked stock accounts with atomic reserved allocations across all regional fulfillment centers
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateItemModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Item SKU</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, name, barcode (e.g. 097855)..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
          />
        </div>

        {/* Multi-Warehouse Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
            <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-zinc-400 text-[11px]">Facility:</span>
            <select
              aria-label="Filter by Facility"
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer flex-1"
            >
              <option value="ALL" className="bg-zinc-900 text-white">All Warehouses (Aggregate Global)</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id} className="bg-zinc-900 text-white">
                  {wh.name} ({wh.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['ALL', 'OPTIMAL', 'LOW', 'CRITICAL'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
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

      {/* Virtualized Enterprise Data Table */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-zinc-700 bg-zinc-800 text-sky-500 focus:ring-0 cursor-pointer"
                    checked={selectedItemIds.length > 0 && selectedItemIds.length === filteredItems.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-3.5 font-semibold">
                  <button
                    onClick={() => toggleSort('sku')}
                    className="flex items-center gap-1.5 hover:text-white"
                  >
                    SKU & Description
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="p-3.5 font-semibold">Barcode / UOM</th>
                <th className="p-3.5 font-semibold">On Hand</th>
                <th className="p-3.5 font-semibold">Reserved</th>
                <th className="p-3.5 font-semibold">
                  <button
                    onClick={() => toggleSort('available')}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Available
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="p-3.5 font-semibold">Reorder Pt</th>
                <th className="p-3.5 font-semibold">
                  <button
                    onClick={() => toggleSort('valuation')}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Total Valuation
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="p-3.5 font-semibold">Health</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filteredItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-zinc-800/40 transition-colors group ${
                      isSelected ? 'bg-sky-500/5' : ''
                    }`}
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-zinc-700 bg-zinc-800 text-sky-500 focus:ring-0 cursor-pointer"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(item.id)}
                      />
                    </td>
                    <td className="p-3.5 font-sans">
                      <div className="font-mono text-sky-400 font-bold">{item.sku}</div>
                      <div className="text-xs text-zinc-200 truncate max-w-[240px]">{item.name}</div>
                      <div className="text-[10px] text-zinc-500">{item.category}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1 text-zinc-300">
                        <BarcodeIcon className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.barcode}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">Unit: {item.uom}</span>
                    </td>
                    <td className="p-3.5 text-zinc-200 font-semibold">{item.onHand.toLocaleString()}</td>
                    <td className="p-3.5 text-amber-400/90 font-medium">
                      {item.reserved > 0 ? `-${item.reserved}` : '0'}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-bold ${
                          item.status === 'CRITICAL'
                            ? 'text-rose-400'
                            : item.status === 'LOW'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {item.available.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3.5 text-zinc-400">{item.reorderPoint}</td>
                    <td className="p-3.5 text-zinc-200 font-medium">
                      {currentOrg.currencySymbol}{item.valuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border ${
                          item.status === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                            : item.status === 'LOW'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      <button
                        onClick={() => {
                          setAdjustingItem(item);
                          setAdjustWarehouseId(warehouses[0].id);
                          setAdjustDelta(0);
                        }}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors shadow-sm"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-800 bg-zinc-950/60 text-xs text-zinc-400">
          <div>
            Showing <strong className="text-zinc-200">{filteredItems.length}</strong> of {items.length} inventory lines
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Aggregate Units: {filteredItems.reduce((acc, i) => acc + i.onHand, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Stock Adjustment Modal / Drawer */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Adjust Physical Stock Ledger</h3>
                  <p className="text-[11px] font-mono text-sky-400">{adjustingItem.sku} — {adjustingItem.name}</p>
                </div>
              </div>
              <button
                onClick={() => setAdjustingItem(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Target Warehouse</label>
                <select
                  value={adjustWarehouseId}
                  onChange={(e) => setAdjustWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Adjustment Reason Code</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value as AdjustmentReason)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="CYCLE_COUNT">Cycle Count Physical Audit</option>
                  <option value="DAMAGED_GOODS">Damaged Goods / Scrap</option>
                  <option value="THEFT_LOSS">Theft / Shrinkage Loss</option>
                  <option value="RECEIVING_CORRECTION">Receiving Discrepancy Correction</option>
                  <option value="RETURN_RESTOCK">Customer Return Restock</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Quantity Increment / Decrement</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdjustDelta((d) => d - 10)}
                    className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 border border-zinc-700"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => setAdjustDelta((d) => d - 1)}
                    className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 border border-zinc-700"
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                    className="w-24 text-center py-1.5 bg-zinc-950 border border-zinc-700 rounded text-sm font-mono text-white font-bold"
                  />
                  <button
                    onClick={() => setAdjustDelta((d) => d + 1)}
                    className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 border border-zinc-700"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => setAdjustDelta((d) => d + 10)}
                    className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 border border-zinc-700"
                  >
                    +10
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Audit Trail Notes</label>
                <textarea
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Reason for adjustment, container ID, or inspection ticket..."
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-end gap-2">
              <button
                onClick={() => setAdjustingItem(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAdjustment}
                disabled={adjustDelta === 0}
                className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-bold text-zinc-950 disabled:opacity-40 transition-colors shadow-lg shadow-sky-500/20"
              >
                Commit Adjustment to Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
