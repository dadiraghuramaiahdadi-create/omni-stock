import React, { useState, useEffect } from 'react';
import { useOmniStock } from '../context/OmniStockContext';
import { 
  Search, 
  Package, 
  Scan, 
  Cpu, 
  Truck, 
  ShoppingCart, 
  X, 
  ArrowRight,
  Warehouse,
} from 'lucide-react';

interface CommandPaletteProps {
  onNavigate: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate }) => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    setIsBarcodeModalOpen, 
    items 
  } = useOmniStock();
  const [query, setQuery] = useState('');

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const quickActions = [
    {
      id: 'scan',
      label: 'Open Barcode Scanner (Handheld / Camera)',
      category: 'Actions',
      icon: Scan,
      action: () => {
        setIsCommandPaletteOpen(false);
        setIsBarcodeModalOpen(true);
      },
    },
    {
      id: 'concurrency',
      label: 'Launch Concurrency & Race-Condition Lab',
      category: 'Actions',
      icon: Cpu,
      action: () => {
        setIsCommandPaletteOpen(false);
        onNavigate('concurrency');
      },
    },
    {
      id: 'inventory',
      label: 'Navigate to Real-time Inventory Ledger',
      category: 'Navigation',
      icon: Package,
      action: () => {
        setIsCommandPaletteOpen(false);
        onNavigate('inventory');
      },
    },
    {
      id: 'orders',
      label: 'Review Pending Sales Orders & Fulfillment',
      category: 'Navigation',
      icon: ShoppingCart,
      action: () => {
        setIsCommandPaletteOpen(false);
        onNavigate('orders');
      },
    },
    {
      id: 'purchasing',
      label: 'Open Procure-to-Pay / Purchase Orders',
      category: 'Navigation',
      icon: Truck,
      action: () => {
        setIsCommandPaletteOpen(false);
        onNavigate('purchasing');
      },
    },
    {
      id: 'warehouses',
      label: 'View Multi-Warehouse Rack Bin Allocations',
      category: 'Navigation',
      icon: Warehouse,
      action: () => {
        setIsCommandPaletteOpen(false);
        onNavigate('warehouses');
      },
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.sku.toLowerCase().includes(query.toLowerCase()) ||
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.barcode.includes(query),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search SKU, or item name..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Instant Workflows
            </div>
            <div className="space-y-0.5">
              {quickActions
                .filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
                .map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800/80 hover:text-white transition-colors group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-sky-400" />
                        <span>{action.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Catalog Matches */}
          {filteredItems.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Catalog Inventory Matches ({filteredItems.length})
              </div>
              <div className="space-y-0.5">
                {filteredItems.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsCommandPaletteOpen(false);
                      onNavigate('inventory');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800/80 hover:text-white transition-colors text-left"
                  >
                    <div>
                      <span className="font-mono text-sky-400 font-semibold mr-2">{item.sku}</span>
                      <span className="text-zinc-300">{item.name}</span>
                    </div>
                    <span className="font-mono text-zinc-400 text-[11px]">Barcode: {item.barcode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px] text-zinc-300">
              Esc to close
            </kbd>
          </div>
          <span className="font-mono">OmniStock Command Line Interface</span>
        </div>
      </div>
    </div>
  );
};
