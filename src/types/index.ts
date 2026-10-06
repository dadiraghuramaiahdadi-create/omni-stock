export type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'UNLIMITED';

export type UserRole = 'OWNER' | 'ADMIN' | 'STAFF' | 'WAREHOUSE_MANAGER' | 'ACCOUNTANT';

export type UnitStatus = 'AVAILABLE' | 'QUARANTINE' | 'ALLOCATED' | 'DAMAGED' | 'EXPIRED';

export type POStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export type SOStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type SalesChannel = 'DIRECT' | 'SHOPIFY' | 'AMAZON' | 'WALMART' | 'B2B_PORTAL';

export type AdjustmentReason = 
  | 'CYCLE_COUNT' 
  | 'DAMAGED_GOODS' 
  | 'THEFT_LOSS' 
  | 'INTERNAL_USE' 
  | 'RECEIVING_CORRECTION' 
  | 'RETURN_RESTOCK';

export type CarrierName = 'FedEx Priority' | 'UPS Worldwide' | 'DHL Express' | 'USPS Commercial';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: PlanTier;
  defaultCurrency: string;
  currencySymbol: string;
  locale: string;
  industry?: string;
  country?: string;
  taxId?: string;
  fiscalYear?: string;
}

export interface RegisterOrgDto {
  name: string;
  industry: string;
  country: string;
  defaultCurrency: string;
  currencySymbol: string;
  plan: PlanTier;
  primaryWarehouseName: string;
  primaryWarehouseCode: string;
  primaryWarehouseCity: string;
  primaryWarehouseState: string;
  primaryWarehouseAddress: string;
  adminName: string;
  adminEmail: string;
}

export interface CreateWarehouseDto {
  name: string;
  code: string;
  city: string;
  state: string;
  address: string;
  binCount: number;
}

export interface CreateItemDto {
  sku: string;
  barcode: string;
  name: string;
  category: string;
  description: string;
  uom: string;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  initialQty: number;
  warehouseId: string;
}

export interface User {
  id: string;
  orgId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface Warehouse {
  id: string;
  orgId: string;
  name: string;
  code: string;
  city: string;
  state: string;
  address: string;
  capacityUtilization: number; // percentage (e.g. 74%)
  binCount: number;
}

export interface StockUnit {
  id: string;
  itemId: string;
  warehouseId: string;
  serialOrLotNumber: string;
  expiryDate?: string;
  binLocation: string; // e.g. "A1-R04-S2-B08"
  status: UnitStatus;
  receivedAt: string;
}

export interface Item {
  id: string;
  orgId: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  description: string;
  uom: string;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  isComposite?: boolean;
}

export interface StockLevel {
  id: string;
  orgId: string;
  itemId: string;
  warehouseId: string;
  qtyOnHand: number;
  qtyReserved: number;
  // Computed: qtyAvailable = qtyOnHand - qtyReserved
}

export interface PurchaseOrderItem {
  itemId: string;
  sku: string;
  name: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  orgId: string;
  poNumber: string;
  vendorName: string;
  status: POStatus;
  totalAmount: number;
  expectedAt: string;
  createdAt: string;
  items: PurchaseOrderItem[];
  grnNumber?: string;
  billNumber?: string;
}

export interface SalesOrderItem {
  itemId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface SalesOrder {
  id: string;
  orgId: string;
  soNumber: string;
  customerName: string;
  channel: SalesChannel;
  status: SOStatus;
  totalAmount: number;
  createdAt: string;
  items: SalesOrderItem[];
  carrier?: CarrierName;
  trackingNumber?: string;
  shippingLabelUrl?: string;
  idempotencyKey?: string;
}

export interface InventoryAdjustment {
  id: string;
  orgId: string;
  itemId: string;
  sku: string;
  warehouseCode: string;
  qtyDelta: number;
  reason: AdjustmentReason;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  orgId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  payload: Record<string, any>;
  ipAddress: string;
  timestamp: string;
}

export interface WebhookEvent {
  id: string;
  event: string;
  targetUrl: string;
  status: 'DELIVERED' | 'RETRYING' | 'FAILED';
  statusCode: number;
  latencyMs: number;
  timestamp: string;
  payload: Record<string, any>;
}

export interface TransferOrder {
  id: string;
  fromWarehouse: string;
  toWarehouse: string;
  sku: string;
  itemName: string;
  quantity: number;
  status: 'DRAFT' | 'IN_TRANSIT' | 'RECEIVED';
  createdAt: string;
}
