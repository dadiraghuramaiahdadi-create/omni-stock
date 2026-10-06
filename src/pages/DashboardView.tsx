import React from 'react';
import { useOmniStock } from '../context/OmniStockContext';
import { 
  DollarSign, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShoppingCart, 
  Truck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  PackagePlus,
  RefreshCcw,
  Building2,
  Warehouse,
  Plus,
  Sparkles,
  Package,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    currentOrg, 
    warehouses,
    items, 
    getItemStockTotal, 
    setIsRegisterOrgModalOpen,
    setIsCreateWarehouseModalOpen,
    setIsCreateItemModalOpen,
    showNotification 
  } = useOmniStock();

  // Compute total inventory valuation
  const totalValuation = items.reduce((acc, item) => {
    const stock = getItemStockTotal(item.id);
    return acc + stock.onHand * item.costPrice;
  }, 0);

  // Compute critical items
  const criticalItems = items.filter((item) => {
    const stock = getItemStockTotal(item.id);
    return stock.available <= item.reorderPoint;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Executive Cockpit & Supply Chain Analytics</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time aggregate valuation, stock run-rate velocity, and predictive replenishment for <strong className="text-zinc-200">{currentOrg.name}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              showNotification('Synchronized inventory valuation ledger with PostgreSQL Aurora replicas', 'success');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Re-index Ledger</span>
          </button>
          <button
            onClick={() => onNavigate('purchasing')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-sky-500/20"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>New Inbound PO</span>
          </button>
        </div>
      </div>

      {/* Zoho Inventory-Style Organization & Warehouse Quick Launchpad */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-950 border border-zinc-800/80 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                <Sparkles className="w-3 h-3" /> Zoho Inventory Architecture
              </span>
              <span className="text-xs text-zinc-400">Tenant Workspace:</span>
              <strong className="text-xs text-white">{currentOrg.name}</strong>
            </div>
            <div className="text-xs text-zinc-400">
              Operating <strong className="text-zinc-200">{warehouses.filter((w) => w.orgId === currentOrg.id).length || warehouses.length} Warehouse Facility Hub(s)</strong> across {currentOrg.country || 'Global'}. Base Ledger Currency: <strong className="text-emerald-400 font-mono">{currentOrg.defaultCurrency} ({currentOrg.currencySymbol})</strong>.
            </div>
          </div>

          {/* Quick Setup Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setIsRegisterOrgModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold border border-sky-500/30 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Register New Company</span>
            </button>
            <button
              onClick={() => setIsCreateWarehouseModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
            >
              <Warehouse className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add Facility</span>
            </button>
            <button
              onClick={() => setIsCreateItemModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Item SKU</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Valuation */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Inventory Valuation</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-3">
            {currentOrg.currencySymbol}{totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% vs. prior cycle (FIFO)</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
        </div>

        {/* Active SKUs */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Catalog SKUs</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-3">{items.length} Tracked Lines</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Multi-facility partition active</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-colors" />
        </div>

        {/* Depletion Breaches */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Depletion Breaches</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-3">{criticalItems.length} SKUs Low</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400 font-medium">
            <span>Automated webhooks triggered</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-colors" />
        </div>

        {/* Turnover Ratio */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Turnover Velocity</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-3">8.4x / yr</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400 font-medium">
            <span>Optimal 94th percentile</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
        </div>
      </div>

      {/* Visual Chart: 30-Day Demand vs Run-Rate */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>30-Day Predictive Stock Depletion vs Inbound Run-Rate</span>
            </h2>
            <p className="text-xs text-zinc-400">Monte Carlo forecast modeling based on omnichannel historical order volume</p>
          </div>
          <div className="flex items-center gap-5 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-sky-400 rounded-full" />
              <span className="text-zinc-300">Live Aggregate Inventory</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-rose-400 border-dashed border-t" />
              <span className="text-zinc-300">Safety Buffer Threshold</span>
            </div>
          </div>
        </div>

        {/* Dynamic SVG Area Graph with Gradient Fill */}
        <div className="h-48 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 900 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Horizontal Grid lines */}
            <line x1="0" y1="40" x2="900" y2="40" stroke="#27272a" strokeDasharray="3 3" />
            <line x1="0" y1="90" x2="900" y2="90" stroke="#27272a" strokeDasharray="3 3" />
            <line x1="0" y1="140" x2="900" y2="140" stroke="#27272a" strokeDasharray="3 3" />

            {/* Threshold Line */}
            <line x1="0" y1="125" x2="900" y2="125" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="5 5" />

            {/* Area Fill */}
            <path
              d="M0,45 Q120,70 240,55 T480,95 T720,40 T900,60 L900,180 L0,180 Z"
              fill="url(#chartGradient)"
            />

            {/* Line Graph */}
            <path
              d="M0,45 Q120,70 240,55 T480,95 T720,40 T900,60"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]"
            />

            {/* Data Point Pins */}
            <circle cx="240" cy="55" r="4" fill="#38bdf8" className="animate-pulse" />
            <circle cx="480" cy="95" r="4" fill="#38bdf8" className="animate-pulse" />
            <circle cx="720" cy="40" r="4" fill="#38bdf8" className="animate-pulse" />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono mt-3 px-1">
          <span>Day 1 (Actuals)</span>
          <span>Day 7 (Inbound PO Delivery)</span>
          <span>Day 15 (Projected Peak)</span>
          <span>Day 22 (Scheduled Cycle Count)</span>
          <span>Day 30 (Buffer Stable)</span>
        </div>
      </div>

      {/* Two Column Grid: Low-Stock Replenishment Radar & Omnichannel Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Low Stock Replenishment Radar */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Low-Stock Replenishment Radar</span>
              </h3>
              <p className="text-xs text-zinc-400">SKUs requiring immediate PO generation or warehouse rebalance</p>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              View All ({items.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400">
                  <th className="pb-3 font-semibold">SKU & Item Name</th>
                  <th className="pb-3 font-semibold">On Hand</th>
                  <th className="pb-3 font-semibold">Reserved</th>
                  <th className="pb-3 font-semibold">Available</th>
                  <th className="pb-3 font-semibold">Reorder Pt</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {items.slice(0, 4).map((item) => {
                  const stock = getItemStockTotal(item.id);
                  const isLow = stock.available <= item.reorderPoint;
                  return (
                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 font-sans">
                        <div className="font-mono text-sky-400 font-semibold">{item.sku}</div>
                        <div className="text-xs text-zinc-300 truncate max-w-[200px]">{item.name}</div>
                      </td>
                      <td className="py-3 text-zinc-200">{stock.onHand}</td>
                      <td className="py-3 text-amber-400/90">{stock.reserved > 0 ? `-${stock.reserved}` : 0}</td>
                      <td className="py-3">
                        <span className={`font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {stock.available}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-400">{item.reorderPoint}</td>
                      <td className="py-3 text-right font-sans">
                        <button
                          onClick={() => onNavigate('purchasing')}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-200 border border-zinc-700 transition-colors"
                        >
                          Reorder PO
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Omnichannel Revenue Channels */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Omnichannel Sales Channels</h3>
            <p className="text-xs text-zinc-400">Order distribution across connected fulfillment gateways</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-zinc-300">Shopify Enterprise Direct</span>
                <span className="font-mono text-white font-bold">48% ($108.4k)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '48%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-zinc-300">Amazon Multi-Channel (FBM)</span>
                <span className="font-mono text-white font-bold">32% ($72.2k)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: '32%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-zinc-300">B2B Wholesale Portal</span>
                <span className="font-mono text-white font-bold">14% ($31.6k)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: '14%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-zinc-300">Walmart Marketplace</span>
                <span className="font-mono text-white font-bold">6% ($13.5k)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '6%' }} />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span>Automated Route Optimization</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Orders automatically route to nearest facility with available allocated stock (Newark vs Reno vs Rotterdam).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
