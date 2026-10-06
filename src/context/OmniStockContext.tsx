import React, { createContext, useContext, useState } from 'react';
import {
  Organization,
  UserRole,
  Item,
  StockLevel,
  StockUnit,
  PurchaseOrder,
  SalesOrder,
  InventoryAdjustment,
  AuditLog,
  WebhookEvent,
  Warehouse,
  CarrierName,
  TransferOrder,
  RegisterOrgDto,
  CreateWarehouseDto,
  CreateItemDto,
} from '../types';
import {
  ORGANIZATIONS,
  WAREHOUSES,
  ITEMS,
  INITIAL_STOCK_LEVELS,
  INITIAL_STOCK_UNITS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_SALES_ORDERS,
  INITIAL_ADJUSTMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WEBHOOKS,
  INITIAL_TRANSFERS,
} from '../data/mockDatabase';

interface ConcurrencyThreadResult {
  threadId: number;
  orderNumber: string;
  status: 'COMMITTED' | 'REJECTED_STOCK_DEPLETED' | 'LOCKED_WAITING';
  latencyMs: number;
  message: string;
}

interface OmniStockContextType {
  // Tenant & Role
  organizations: Organization[];
  currentOrg: Organization;
  setCurrentOrg: (org: Organization) => void;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;

  // Registration & Onboarding (Zoho Inventory style)
  registerOrganization: (dto: RegisterOrgDto) => Promise<Organization>;
  createWarehouse: (dto: CreateWarehouseDto) => Promise<Warehouse>;
  createItem: (dto: CreateItemDto) => Promise<Item>;

  // Master Data (Scoped to current organization or global)
  warehouses: Warehouse[];
  items: Item[];
  stockLevels: StockLevel[];
  stockUnits: StockUnit[];
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  adjustments: InventoryAdjustment[];
  transfers: TransferOrder[];
  auditLogs: AuditLog[];
  webhooks: WebhookEvent[];

  // Computed Stock Helpers
  getItemStockTotal: (itemId: string) => { onHand: number; reserved: number; available: number };
  getItemStockByWarehouse: (itemId: string, warehouseId: string) => { onHand: number; reserved: number; available: number };

  // Core Workflows
  adjustStock: (itemId: string, warehouseId: string, delta: number, reason: string, notes?: string) => Promise<boolean>;
  fulfillSalesOrder: (soId: string, carrier: CarrierName) => Promise<{ success: boolean; trackingNumber?: string; labelUrl?: string; error?: string }>;
  receivePurchaseOrder: (poId: string, receivedQty: number) => Promise<{ success: boolean; grnNumber: string }>;
  createTransferOrder: (fromWh: string, toWh: string, sku: string, qty: number) => void;
  receiveTransferOrder: (transferId: string) => void;

  // Concurrency Engine Simulator
  runConcurrencySimulation: (itemId: string, requestedThreads: number) => Promise<ConcurrencyThreadResult[]>;
  isSimulating: boolean;

  // Global UI State & Modals
  isRegisterOrgModalOpen: boolean;
  setIsRegisterOrgModalOpen: (open: boolean) => void;
  isCreateWarehouseModalOpen: boolean;
  setIsCreateWarehouseModalOpen: (open: boolean) => void;
  isCreateItemModalOpen: boolean;
  setIsCreateItemModalOpen: (open: boolean) => void;
  isBarcodeModalOpen: boolean;
  setIsBarcodeModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  shippingLabelModalData: { so: SalesOrder; carrier: CarrierName; tracking: string } | null;
  setShippingLabelModalData: (data: { so: SalesOrder; carrier: CarrierName; tracking: string } | null) => void;

  // Notifications
  notification: { message: string; type: 'success' | 'warning' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const OmniStockContext = createContext<OmniStockContextType | undefined>(undefined);

export const OmniStockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>(ORGANIZATIONS);
  const [currentOrg, setCurrentOrg] = useState<Organization>(ORGANIZATIONS[0]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('OWNER');

  const [warehouses, setWarehouses] = useState<Warehouse[]>(WAREHOUSES);
  const [items, setItems] = useState<Item[]>(ITEMS);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>(INITIAL_STOCK_LEVELS);
  const [stockUnits, setStockUnits] = useState<StockUnit[]>(INITIAL_STOCK_UNITS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(INITIAL_SALES_ORDERS);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>(INITIAL_ADJUSTMENTS);
  const [transfers, setTransfers] = useState<TransferOrder[]>(INITIAL_TRANSFERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>(INITIAL_WEBHOOKS);

  // Modals state
  const [isRegisterOrgModalOpen, setIsRegisterOrgModalOpen] = useState(false);
  const [isCreateWarehouseModalOpen, setIsCreateWarehouseModalOpen] = useState(false);
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [shippingLabelModalData, setShippingLabelModalData] = useState<{ so: SalesOrder; carrier: CarrierName; tracking: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // -------------------------------------------------------------
  // ZOHO INVENTORY STYLE: REGISTER NEW ORGANIZATION & ONBOARDING
  // -------------------------------------------------------------
  const registerOrganization = async (dto: RegisterOrgDto): Promise<Organization> => {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newOrgId = `org-${slug}-${Date.now().toString().slice(-4)}`;

    const newOrg: Organization = {
      id: newOrgId,
      name: dto.name,
      slug,
      plan: dto.plan,
      defaultCurrency: dto.defaultCurrency,
      currencySymbol: dto.currencySymbol,
      locale: dto.country === 'India' ? 'en-IN' : dto.country === 'United Kingdom' ? 'en-GB' : 'en-US',
      industry: dto.industry,
      country: dto.country,
    };

    // Primary initial warehouse for this new business
    const newWhId = `wh-${slug}-01`;
    const primaryWarehouse: Warehouse = {
      id: newWhId,
      orgId: newOrgId,
      name: dto.primaryWarehouseName,
      code: dto.primaryWarehouseCode.toUpperCase(),
      city: dto.primaryWarehouseCity,
      state: dto.primaryWarehouseState,
      address: dto.primaryWarehouseAddress,
      capacityUtilization: 12,
      binCount: 500,
    };

    // Starter sample item to get going immediately
    const starterItemId = `item-${slug}-101`;
    const starterItem: Item = {
      id: starterItemId,
      orgId: newOrgId,
      sku: `SKU-${slug.substring(0, 3).toUpperCase()}-001`,
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      name: `${dto.name} Flagship Product Line A`,
      category: dto.industry,
      description: 'Initial catalog item created during Zoho-style organization onboarding wizard',
      uom: 'PCS',
      reorderPoint: 25,
      costPrice: 45.0,
      sellingPrice: 89.99,
    };

    const starterStockLevel: StockLevel = {
      id: `sl-${slug}-01`,
      orgId: newOrgId,
      itemId: starterItemId,
      warehouseId: newWhId,
      qtyOnHand: 150,
      qtyReserved: 0,
    };

    const starterStockUnit: StockUnit = {
      id: `su-${slug}-01`,
      itemId: starterItemId,
      warehouseId: newWhId,
      serialOrLotNumber: `LOT-${slug.substring(0, 3).toUpperCase()}-2026-01`,
      expiryDate: '2028-12-31',
      binLocation: 'A1-R01-S1-B01',
      status: 'AVAILABLE',
      receivedAt: new Date().toISOString().split('T')[0],
    };

    // Audit Log for tenant provisioning
    const audit: AuditLog = {
      id: `audit-${Date.now()}`,
      orgId: newOrgId,
      userName: `${dto.adminName} (Owner)`,
      userRole: 'OWNER',
      action: 'ORGANIZATION_REGISTERED',
      entity: 'Organization',
      entityId: newOrgId,
      payload: {
        company: dto.name,
        currency: dto.defaultCurrency,
        warehouse: dto.primaryWarehouseName,
        admin: dto.adminEmail,
        timestamp: new Date().toISOString(),
      },
      ipAddress: '127.0.0.1',
      timestamp: new Date().toLocaleString(),
    };

    // Update state
    setOrganizations((prev) => [...prev, newOrg]);
    setWarehouses((prev) => [...prev, primaryWarehouse]);
    setItems((prev) => [...prev, starterItem]);
    setStockLevels((prev) => [...prev, starterStockLevel]);
    setStockUnits((prev) => [...prev, starterStockUnit]);
    setAuditLogs((prev) => [audit, ...prev]);

    // Automatically switch active context to the new organization!
    setCurrentOrg(newOrg);
    setCurrentUserRole('OWNER');

    showNotification(
      `🎉 Welcome to OmniStock, ${dto.name}! Organization registered with base currency ${dto.defaultCurrency} and warehouse ${primaryWarehouse.code}`,
      'success',
    );

    return newOrg;
  };

  // -------------------------------------------------------------
  // CREATE NEW WAREHOUSE FACILITY
  // -------------------------------------------------------------
  const createWarehouse = async (dto: CreateWarehouseDto): Promise<Warehouse> => {
    const newWh: Warehouse = {
      id: `wh-${currentOrg.slug}-${Date.now().toString().slice(-4)}`,
      orgId: currentOrg.id,
      name: dto.name,
      code: dto.code.toUpperCase(),
      city: dto.city,
      state: dto.state,
      address: dto.address,
      capacityUtilization: 5,
      binCount: dto.binCount || 500,
    };

    setWarehouses((prev) => [...prev, newWh]);

    // Audit log
    const audit: AuditLog = {
      id: `audit-${Date.now()}`,
      orgId: currentOrg.id,
      userName: `Active User (${currentUserRole})`,
      userRole: currentUserRole,
      action: 'WAREHOUSE_REGISTERED',
      entity: 'Warehouse',
      entityId: newWh.code,
      payload: { name: newWh.name, city: newWh.city, bins: newWh.binCount },
      ipAddress: '127.0.0.1',
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    showNotification(`Facility ${newWh.name} (${newWh.code}) successfully registered and mapped!`, 'success');
    return newWh;
  };

  // -------------------------------------------------------------
  // CREATE NEW ITEM / SKU IN CATALOG
  // -------------------------------------------------------------
  const createItem = async (dto: CreateItemDto): Promise<Item> => {
    const newItemId = `item-${Date.now()}`;
    const newItem: Item = {
      id: newItemId,
      orgId: currentOrg.id,
      sku: dto.sku.toUpperCase(),
      barcode: dto.barcode,
      name: dto.name,
      category: dto.category,
      description: dto.description,
      uom: dto.uom || 'PCS',
      reorderPoint: dto.reorderPoint || 10,
      costPrice: dto.costPrice,
      sellingPrice: dto.sellingPrice,
    };

    const newStockLevel: StockLevel = {
      id: `sl-${Date.now()}`,
      orgId: currentOrg.id,
      itemId: newItemId,
      warehouseId: dto.warehouseId,
      qtyOnHand: dto.initialQty || 0,
      qtyReserved: 0,
    };

    setItems((prev) => [...prev, newItem]);
    setStockLevels((prev) => [...prev, newStockLevel]);

    if (dto.initialQty > 0) {
      const newUnit: StockUnit = {
        id: `su-${Date.now()}`,
        itemId: newItemId,
        warehouseId: dto.warehouseId,
        serialOrLotNumber: `LOT-${newItem.sku.substring(0, 4)}-INIT`,
        expiryDate: '2029-01-01',
        binLocation: 'A1-R01-S1-B01',
        status: 'AVAILABLE',
        receivedAt: new Date().toISOString().split('T')[0],
      };
      setStockUnits((prev) => [...prev, newUnit]);
    }

    // Audit log
    const audit: AuditLog = {
      id: `audit-${Date.now()}`,
      orgId: currentOrg.id,
      userName: `Catalog Specialist (${currentUserRole})`,
      userRole: currentUserRole,
      action: 'ITEM_REGISTERED',
      entity: 'Item',
      entityId: newItem.sku,
      payload: { name: newItem.name, cost: newItem.costPrice, initialStock: dto.initialQty },
      ipAddress: '127.0.0.1',
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    showNotification(`New SKU ${newItem.sku} registered with ${dto.initialQty} initial units`, 'success');
    return newItem;
  };

  // Helper: Aggregate Stock
  const getItemStockTotal = (itemId: string) => {
    const records = stockLevels.filter((sl) => sl.itemId === itemId);
    const onHand = records.reduce((acc, curr) => acc + curr.qtyOnHand, 0);
    const reserved = records.reduce((acc, curr) => acc + curr.qtyReserved, 0);
    return {
      onHand,
      reserved,
      available: onHand - reserved,
    };
  };

  const getItemStockByWarehouse = (itemId: string, warehouseId: string) => {
    const sl = stockLevels.find((s) => s.itemId === itemId && s.warehouseId === warehouseId);
    if (!sl) return { onHand: 0, reserved: 0, available: 0 };
    return {
      onHand: sl.qtyOnHand,
      reserved: sl.qtyReserved,
      available: sl.qtyOnHand - sl.qtyReserved,
    };
  };

  // Stock Adjustment Action
  const adjustStock = async (
    itemId: string,
    warehouseId: string,
    delta: number,
    reason: string,
    notes?: string,
  ): Promise<boolean> => {
    const item = items.find((i) => i.id === itemId);
    const wh = warehouses.find((w) => w.id === warehouseId);
    if (!item || !wh) return false;

    setStockLevels((prev) =>
      prev.map((sl) => {
        if (sl.itemId === itemId && sl.warehouseId === warehouseId) {
          const nextOnHand = Math.max(0, sl.qtyOnHand + delta);
          return { ...sl, qtyOnHand: nextOnHand };
        }
        return sl;
      }),
    );

    const newAdj: InventoryAdjustment = {
      id: `adj-${Date.now()}`,
      orgId: currentOrg.id,
      itemId,
      sku: item.sku,
      warehouseCode: wh.code,
      qtyDelta: delta,
      reason: reason as any,
      performedBy: `Authorized User (${currentUserRole})`,
      timestamp: new Date().toISOString(),
      notes,
    };
    setAdjustments((prev) => [newAdj, ...prev]);

    const audit: AuditLog = {
      id: `audit-${Date.now()}`,
      orgId: currentOrg.id,
      userName: `Active User (${currentUserRole})`,
      userRole: currentUserRole,
      action: 'STOCK_ADJUSTMENT',
      entity: 'Item',
      entityId: item.sku,
      payload: { delta, warehouse: wh.code, reason, notes },
      ipAddress: '192.168.1.104',
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    const updatedTotal = getItemStockTotal(itemId);
    if (updatedTotal.onHand + delta <= item.reorderPoint) {
      const hook: WebhookEvent = {
        id: `hook-${Date.now()}`,
        event: 'stock.low',
        targetUrl: 'https://webhook.site/omnistock-dispatch',
        status: 'DELIVERED',
        statusCode: 200,
        latencyMs: 34,
        timestamp: new Date().toLocaleTimeString(),
        payload: { sku: item.sku, currentStock: updatedTotal.onHand + delta, reorderPoint: item.reorderPoint },
      };
      setWebhooks((prev) => [hook, ...prev]);
      showNotification(`CRITICAL: SKU ${item.sku} breached reorder point (${item.reorderPoint}). Webhook triggered!`, 'warning');
    } else {
      showNotification(`Stock adjusted for ${item.sku} by ${delta > 0 ? `+${delta}` : delta}`, 'success');
    }

    return true;
  };

  // Sales Order Fulfillment
  const fulfillSalesOrder = async (soId: string, carrier: CarrierName) => {
    const order = salesOrders.find((s) => s.id === soId);
    if (!order) return { success: false, error: 'Order not found' };

    for (const line of order.items) {
      const stock = getItemStockTotal(line.itemId);
      if (stock.available < line.quantity) {
        showNotification(`Cannot fulfill ${order.soNumber}: Insufficient stock for ${line.sku}. Available: ${stock.available}, Required: ${line.quantity}`, 'error');
        return { success: false, error: `Insufficient stock for ${line.sku}` };
      }
    }

    setStockLevels((prev) =>
      prev.map((sl) => {
        const orderLine = order.items.find((i) => i.itemId === sl.itemId);
        if (orderLine) {
          return {
            ...sl,
            qtyOnHand: Math.max(0, sl.qtyOnHand - orderLine.quantity),
          };
        }
        return sl;
      }),
    );

    const trackingNumber = `${carrier.split(' ')[0].toUpperCase()}-${Math.floor(100000000 + Math.random() * 900000000)}`;

    setSalesOrders((prev) =>
      prev.map((s) =>
        s.id === soId
          ? {
              ...s,
              status: 'SHIPPED',
              carrier,
              trackingNumber,
              shippingLabelUrl: `https://labels.omnistock.io/download/${trackingNumber}.pdf`,
            }
          : s,
      ),
    );

    const audit: AuditLog = {
      id: `audit-${Date.now()}`,
      orgId: currentOrg.id,
      userName: `Fulfillment Engine (${currentUserRole})`,
      userRole: currentUserRole,
      action: 'STOCK_DEDUCTION',
      entity: 'SalesOrder',
      entityId: order.soNumber,
      payload: { carrier, trackingNumber, lines: order.items },
      ipAddress: '10.2.14.88',
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    const hook: WebhookEvent = {
      id: `hook-${Date.now()}`,
      event: 'order.fulfilled',
      targetUrl: 'https://api.omnistock.io/hooks/v1/shipment',
      status: 'DELIVERED',
      statusCode: 200,
      latencyMs: 29,
      timestamp: new Date().toLocaleTimeString(),
      payload: { soNumber: order.soNumber, trackingNumber, carrier, totalAmount: order.totalAmount },
    };
    setWebhooks((prev) => [hook, ...prev]);

    showNotification(`Order ${order.soNumber} fulfilled via ${carrier}! Tracking: ${trackingNumber}`, 'success');
    return { success: true, trackingNumber, labelUrl: `blob:label-${trackingNumber}` };
  };

  // Purchase Order Receipt (GRN + Stock Addition)
  const receivePurchaseOrder = async (poId: string, receivedQty: number) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return { success: false, grnNumber: '' };

    const grnNumber = `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const billNumber = `BILL-${po.vendorName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === poId
          ? {
              ...p,
              status: 'RECEIVED',
              grnNumber,
              billNumber,
              items: p.items.map((item) => ({ ...item, quantityReceived: receivedQty })),
            }
          : p,
      ),
    );

    const defaultWh = warehouses.find((w) => w.orgId === currentOrg.id) || warehouses[0];
    const poLine = po.items[0];
    if (poLine && defaultWh) {
      setStockLevels((prev) =>
        prev.map((sl) => {
          if (sl.itemId === poLine.itemId && sl.warehouseId === defaultWh.id) {
            return { ...sl, qtyOnHand: sl.qtyOnHand + receivedQty };
          }
          return sl;
        }),
      );

      const newUnit: StockUnit = {
        id: `su-${Date.now()}`,
        itemId: poLine.itemId,
        warehouseId: defaultWh.id,
        serialOrLotNumber: `LOT-${po.vendorName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        expiryDate: '2028-12-31',
        binLocation: `A${Math.floor(Math.random() * 5) + 1}-R0${Math.floor(Math.random() * 9) + 1}-S1-B01`,
        status: 'AVAILABLE',
        receivedAt: new Date().toISOString().split('T')[0],
      };
      setStockUnits((prev) => [newUnit, ...prev]);
    }

    const audit: AuditLog = {
      id: `audit-${Date.now()}`,
      orgId: currentOrg.id,
      userName: `Procurement (${currentUserRole})`,
      userRole: currentUserRole,
      action: 'PO_GOODS_RECEIPT',
      entity: 'PurchaseOrder',
      entityId: po.poNumber,
      payload: { grnNumber, billNumber, quantityReceived: receivedQty },
      ipAddress: '10.2.14.90',
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    showNotification(`Goods Receipt Note ${grnNumber} generated! Inbound inventory credited to ${defaultWh?.code || 'Warehouse'}.`, 'success');
    return { success: true, grnNumber };
  };

  // Warehouse Transfers
  const createTransferOrder = (fromWh: string, toWh: string, sku: string, qty: number) => {
    const item = items.find((i) => i.sku === sku);
    if (!item) return;

    const newTransfer: TransferOrder = {
      id: `tr-${Date.now()}`,
      fromWarehouse: fromWh,
      toWarehouse: toWh,
      sku,
      itemName: item.name,
      quantity: qty,
      status: 'IN_TRANSIT',
      createdAt: new Date().toLocaleString(),
    };
    setTransfers((prev) => [newTransfer, ...prev]);

    const fromWarehouseObj = warehouses.find((w) => w.code === fromWh);
    if (fromWarehouseObj) {
      setStockLevels((prev) =>
        prev.map((sl) => {
          if (sl.itemId === item.id && sl.warehouseId === fromWarehouseObj.id) {
            return { ...sl, qtyOnHand: Math.max(0, sl.qtyOnHand - qty) };
          }
          return sl;
        }),
      );
    }

    showNotification(`Transfer Order ${newTransfer.id} in transit from ${fromWh} to ${toWh}`, 'info');
  };

  const receiveTransferOrder = (transferId: string) => {
    const tr = transfers.find((t) => t.id === transferId);
    if (!tr || tr.status === 'RECEIVED') return;

    const item = items.find((i) => i.sku === tr.sku);
    const toWh = warehouses.find((w) => w.code === tr.toWarehouse);
    if (!item || !toWh) return;

    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: 'RECEIVED' } : t)),
    );

    setStockLevels((prev) =>
      prev.map((sl) => {
        if (sl.itemId === item.id && sl.warehouseId === toWh.id) {
          return { ...sl, qtyOnHand: sl.qtyOnHand + tr.quantity };
        }
        return sl;
      }),
    );

    showNotification(`Transfer ${transferId} received at ${toWh.code}! Stock successfully updated.`, 'success');
  };

  // Concurrency Simulation
  const runConcurrencySimulation = async (
    itemId: string,
    requestedThreads: number,
  ): Promise<ConcurrencyThreadResult[]> => {
    setIsSimulating(true);
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      setIsSimulating(false);
      return [];
    }

    const currentAvail = getItemStockTotal(itemId).available;
    let unitsLeft = currentAvail;
    const results: ConcurrencyThreadResult[] = [];

    for (let i = 1; i <= requestedThreads; i++) {
      const orderNumber = `SO-RACE-${Math.floor(1000 + Math.random() * 9000)}`;
      const latencyMs = Math.round((Math.random() * 12 + 2) * 10) / 10;

      if (unitsLeft > 0) {
        unitsLeft -= 1;
        results.push({
          threadId: i,
          orderNumber,
          status: 'COMMITTED',
          latencyMs,
          message: `SELECT FOR UPDATE acquired. Order committed. Remaining: ${unitsLeft}`,
        });
      } else {
        results.push({
          threadId: i,
          orderNumber,
          status: 'REJECTED_STOCK_DEPLETED',
          latencyMs: latencyMs + 1.5,
          message: `Lock verified 0 stock available. 409 Conflict. Zero negative stock prevented.`,
        });
      }
    }

    const totalCommitted = results.filter((r) => r.status === 'COMMITTED').length;
    if (totalCommitted > 0) {
      const defaultWh = warehouses.find((w) => w.orgId === currentOrg.id) || warehouses[0];
      setStockLevels((prev) =>
        prev.map((sl) => {
          if (sl.itemId === itemId && sl.warehouseId === defaultWh.id) {
            return { ...sl, qtyOnHand: Math.max(0, sl.qtyOnHand - totalCommitted) };
          }
          return sl;
        }),
      );

      const audit: AuditLog = {
        id: `audit-${Date.now()}`,
        orgId: currentOrg.id,
        userName: 'Race Condition Engine (Redlock + Aurora)',
        userRole: 'ADMIN',
        action: 'CONCURRENCY_TEST',
        entity: 'StockLevel',
        entityId: item.sku,
        payload: {
          threads: requestedThreads,
          committed: totalCommitted,
          rejected: requestedThreads - totalCommitted,
          guarantee: 'Zero Overselling (100% Deterministic)',
        },
        ipAddress: '127.0.0.1',
        timestamp: new Date().toLocaleString(),
      };
      setAuditLogs((prev) => [audit, ...prev]);
    }

    setIsSimulating(false);
    return results;
  };

  return (
    <OmniStockContext.Provider
      value={{
        organizations,
        currentOrg,
        setCurrentOrg,
        currentUserRole,
        setCurrentUserRole,
        registerOrganization,
        createWarehouse,
        createItem,
        warehouses,
        items,
        stockLevels,
        stockUnits,
        purchaseOrders,
        salesOrders,
        adjustments,
        transfers,
        auditLogs,
        webhooks,
        getItemStockTotal,
        getItemStockByWarehouse,
        adjustStock,
        fulfillSalesOrder,
        receivePurchaseOrder,
        createTransferOrder,
        receiveTransferOrder,
        runConcurrencySimulation,
        isSimulating,
        isRegisterOrgModalOpen,
        setIsRegisterOrgModalOpen,
        isCreateWarehouseModalOpen,
        setIsCreateWarehouseModalOpen,
        isCreateItemModalOpen,
        setIsCreateItemModalOpen,
        isBarcodeModalOpen,
        setIsBarcodeModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        shippingLabelModalData,
        setShippingLabelModalData,
        notification,
        showNotification,
      }}
    >
      {children}
    </OmniStockContext.Provider>
  );
};

export const useOmniStock = () => {
  const context = useContext(OmniStockContext);
  if (!context) {
    throw new Error('useOmniStock must be used within an OmniStockProvider');
  }
  return context;
};
