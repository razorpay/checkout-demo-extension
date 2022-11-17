export interface Promotion {
  code: string;
  value: number;
}

export interface Dimension {
  dimension: string;
  unit: string;
  value: string;
}

export interface LineItem {
  sku: string;
  name: string;
  type?: string;
  notes?: Record<string, any>;
  price: number;
  weight?: number;
  quantity: number;
  image_url?: string;
  dimensions?: Dimension[];
  tax_amount?: number;
  variant_id: string;
  description?: string;
  offer_price?: number;
  product_url?: string;
  other_product_codes?: string[];
}

export interface Cart {
  promotions?: Promotion[];
  line_items: LineItem[];
}
