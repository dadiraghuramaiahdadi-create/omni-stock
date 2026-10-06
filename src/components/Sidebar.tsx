import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  Truck, 
  Cpu, 
  FileText, 
  ShieldCheck,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { useOmniStock } from '../context/OmniStockContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentOrg, currentUserRole, items, salesOrders, purchaseOrders } = useOmniStock();

  const pendingOrdersCount = salesOrders.filter((s) => s.status === 'PENDING' || s.status === 'CONFIRMED').length;
  const criticalItemsCount = items.filter((item) => {
    // simplified check
    return item.sku === 'SKU-APL-MBP16' || item.sku === 'SKU-APC-SMT1500';
  }).length;

  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'Executive Cockpit',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'inventory',
      label: 'Inventory & SKUs',
      icon: Package,
      badge: criticalItemsCount > 0 ? `${criticalItemsCount} Alert` : null,
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    },
    {
      id: 'warehouses',
      label: 'Warehousing & Bins',
      icon: Warehouse,
      badge: '3 Hubs',
      badgeColor: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    },
    {
      id: 'orders',
      label: 'Orders & Fulfillment',
      icon: ShoppingCart,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null,
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    },
    {
      id: 'purchasing',
      label: 'Procure-to-Pay (PO)',
      icon: Truck,
      badge: `${purchaseOrders.length}`,
      badgeColor: 'bg-zinc-800 text-zinc-400',
    },
    {
      id: 'concurrency',
      label: 'Concurrency Engine',
      icon: Cpu,
      badge: 'P99 Lab',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    {
      id: 'audit',
      label: 'Audit Log & Webhooks',
      icon: FileText,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#09090b] border-r border-zinc-800/80 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Navigation Group */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Supply Chain Operations
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-zinc-900 text-zinc-100' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tenant Health Widget */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-[11px] font-medium">Tenant Shard</span>
            <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5" /> 99.99%
            </span>
          </div>
          <div className="font-semibold text-white truncate text-[11px]">{currentOrg.name}</div>
          <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2 font-mono">
            <span>Currency: {currentOrg.defaultCurrency}</span>
            <span>Locale: {currentOrg.locale}</span>
          </div>
        </div>
      </div>

      {/* Bottom Profile / Quick Info */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-sky-400">
            {currentUserRole.substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-200 truncate">Alexander Vance</div>
            <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{currentUserRole}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
