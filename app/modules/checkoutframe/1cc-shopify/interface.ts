interface DiscountAllocation {
  discount_application: {
    type: string;
  };
}

interface Discount {
  amount: number;
  title: string;
}

interface CartItem {
  properties: Record<string, any>;
  quantity: number;
  variant_id: number;
  total_discount: number;
  discounts: Discount[];
  requires_shipping: boolean;
  line_level_discount_allocation: DiscountAllocation[];
}

export interface CreateShopifyCheckoutBody {
  cart: {
    token: string;
    total_price: number;
    items: CartItem[];
  };
}

export interface CreateShopifyCheckoutResponse {
  shopify_checkout_id: string;
}
