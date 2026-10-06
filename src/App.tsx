import React, { useState } from 'react';
import { OmniStockProvider } from './context/OmniStockContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { CarrierLabelModal } from './components/CarrierLabelModal';
import { RegisterOrgModal } from './components/RegisterOrgModal';
import { CreateWarehouseModal } from './components/CreateWarehouseModal';
import { CreateItemModal } from './components/CreateItemModal';

import { DashboardView } from './pages/DashboardView';
import { InventoryView } from './pages/InventoryView';
import { WarehousesView } from './pages/WarehousesView';
import { OrdersView } from './pages/OrdersView';
import { PurchasingView } from './pages/PurchasingView';
import { ConcurrencyEngineView } from './pages/ConcurrencyEngineView';
import { AuditLogsView } from './pages/AuditLogsView';

function OmniStockApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-sky-500/30">
      {/* Top Navigation Bar */}
      <Header />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sleek Dark-Mode Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 max-w-[1600px] w-full">
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'warehouses' && <WarehousesView />}
          {activeTab === 'orders' && <OrdersView />}
          {activeTab === 'purchasing' && <PurchasingView />}
          {activeTab === 'concurrency' && <ConcurrencyEngineView />}
          {activeTab === 'audit' && <AuditLogsView />}
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <CommandPalette onNavigate={setActiveTab} />
      <BarcodeScannerModal />
      <CarrierLabelModal />
      <RegisterOrgModal />
      <CreateWarehouseModal />
      <CreateItemModal />
    </div>
  );
}

export default function App() {
  return (
    <OmniStockProvider>
      <OmniStockApp />
    </OmniStockProvider>
  );
}
