/**
 * Payment State is currently used for persistent payment
 * persistent payment allow you to cache to payment response and reuse the same payment
 * in case of user retries with same payment method and instrument.
 */
import { makeAuthUrl } from 'common/helper';
import { sha } from 'fingerprint';
import fetch from 'utils/fetch';

const PERSISTENT_PAYMENT_EXPIRY_LIMIT = 6.5 * 60 * 1000; // 6.5 minutes

function removeMeta(payload: Record<string, any>) {
  return Object.keys(payload).reduce(
    (acc: Record<string, any>, key: string) => {
      if (key.indexOf('_') !== 0) {
        acc[key] = payload[key];
      }
      return acc;
    },
    {}
  );
}

function getHashKey(payload: Record<string, any>) {
  const paymentPayload = removeMeta(payload);
  // not using sha as its async
  return sha(JSON.stringify(paymentPayload));
}

/**
 * Every time payment is created with persistent mode then we store the response
 * mapped with request parameter except meta properties which might change on every requests
 * We convert request paramter to SHA hash and map response with that
 * So next time if users tries to make payment with same method & instrument we reuse to cache response
 */
class PaymentState {
  public persistentState: Map<
    string,
    {
      expiredIn: number;
      response: Record<string, any>;
    }
  >;
  constructor() {
    this.persistentState = new Map();
  }

  getPersistentPayment(payload: Record<string, any>) {
    return new Promise<null | Record<string, any>>((resolve, reject) => {
      getHashKey(payload)
        .then((hashKey) => {
          if (this.persistentState.has(hashKey)) {
            const responseData = this.persistentState.get(hashKey);
            if (
              !responseData?.expiredIn ||
              responseData?.expiredIn <= new Date().getTime()
            ) {
              resolve(null);
              return;
            }
            resolve(responseData?.response);
            return;
          }
          resolve(null);
        })
        .catch(reject);
    });
  }

  setPersistentState(
    request: Record<string, any>,
    responsePayload: Record<string, any>
  ) {
    getHashKey(request).then((hashKey: string) => {
      this.persistentState.set(hashKey, {
        response: responsePayload,
        expiredIn: new Date().getTime() + PERSISTENT_PAYMENT_EXPIRY_LIMIT,
      });
    });
  }

  cancelAllPayments() {
    try {
      const values = this.persistentState.values();
      let data = values.next();
      while (!data.done) {
        const paymentId = data.value.response?.payment_id;
        if (paymentId) {
          const url = makeAuthUrl(null, `payments/${paymentId}/cancel`);
          fetch({
            url,
            callback: () => true,
          });
        }
        data = values.next();
      }
      this.persistentState.clear();
    } catch (e) {
      // e
    }
  }
}

export default new PaymentState();
