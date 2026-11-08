export type StockStatus = 'out_of_stock' | 'low_stock' | 'in_stock';

export interface InventoryPart {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minimum: number;
  cost_pesewas: number;
  price_pesewas: number;
  supplier: string;
  stock_status: StockStatus;
  margin_percent: number;
}

export interface InventorySummary {
  items: number;
  stockValuePesewas: number;
  averageMarginPercent: number | null;
  lowCount: number;
  supplierCount: number;
}

export interface InventoryListResponse {
  success: true;
  data: InventoryPart[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: InventorySummary;
}

export interface CreatePartRequest {
  name: string;
  sku: string;
  quantity: number;
  minimum: number;
  costPesewas: number;
  pricePesewas: number;
  supplier: string;
}

export interface ReceiveStockRequest {
  quantity: number;
}
