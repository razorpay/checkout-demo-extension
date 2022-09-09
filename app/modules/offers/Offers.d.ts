declare namespace Offers {
  export interface OfferItem {
    id: string;
    name: string;
    payment_method: string;
    payment_method_type?: any;
    iins?: any;
    payment_network?: any;
    issuer?: string;
    international?: any;
    active?: boolean;
    emi_subvention?: boolean;
    type: 'deferred' | 'instant' | 'additional_discount' | 'read_only';
    percent_rate?: number;
    min_amount?: number;
    max_cashback?: number;
    flat_cashback?: any;
    emi_subvention?: any;
    emi_durations?: any[];
    max_order_amount?: any;
    display_text: string;
    default_offer?: boolean;
    original_amount?: number;
    amount?: number;
  }

  export type OffersList = OfferItem[];

  export type InstantDiscountOfferItem = OfferItem & {
    amount: number;
    original_amount: number;
  };
}
