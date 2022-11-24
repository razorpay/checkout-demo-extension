import { createShopifyCheckoutId } from './';
import type {
  CreateShopifyCheckoutBody,
  CreateShopifyCheckoutResponse,
} from './interface';

let SHOPIFY_CHECKOUT_PROMISE: Promise<any> | undefined;

export function getShopifyCheckoutId({
  body,
  key_id,
}: {
  body?: CreateShopifyCheckoutBody;
  key_id?: string;
} = {}): Promise<any> {
  if (!SHOPIFY_CHECKOUT_PROMISE) {
    SHOPIFY_CHECKOUT_PROMISE = createShopifyCheckoutId({
      body: body!,
      key_id: key_id!,
    }).then(
      (response: CreateShopifyCheckoutResponse) => response.shopify_checkout_id
    );
  }
  return SHOPIFY_CHECKOUT_PROMISE;
}
