export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  shipping_fee: number;
  cod_fee: number;
  cod: boolean;
}
