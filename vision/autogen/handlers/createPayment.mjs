import { JsonResponse } from '#vision/autogen/utils/index.mjs';

const sbiNetbankingResponse = {
  type: 'first',
  request: {
    content: {
      encdata:
        'MTIzNDU2Nzg5MDEyMzQ1NhzChGiRkiZGZvjvf63fZ/jBJnE9CPzafd6Tg+jSnUln+ma9NCHE4i1BrIBBNQSSmNQfZaJpEkTgxlGfprpDYXykk6NHJNTSkn5tv0lx0N06pV1dhte4Yws9acEN9X+k/TMNmXwBs4wyUbCMsMlboCrh+raO4A/Ffm8aDNsIA1vYUHjV6fGfUwqqyLw7Dhk1ugW3kUKyrPyW6wQOErECdmLA7flSKtg75a2EWrYv5RMKfevSqMwIQTQGohRyREVBdlx9Z9nvsOqyMtUMcOvoV9dkumPoyY2ZiekEzEvAjMtZgox4UgRnQ5djcY6zajO6wedg07SeTeGQMiAfwPa+TB/2AeR+PqzhcSd/XHeRibbGlcr2QE44NJc/NQc29IeHskm1GCB/Y69YPXqNG3FzIy/hwgJa10JON0PuhtDhmG1rchXwPsU6Zfloc1GaMEEa3mmD+1Nmztn+1pBP7nBGq4ly4uiott34/JskbpdXNmZ0oFfpZfrqX66B8TYmnVacA8oeUVfHqaqHZiGySPkAspBpHsevNMbk5yC0WcHGOtQt5QK2vvSltBM=',
      merchant_code: 'RAZORPAY',
    },
    method: 'POST',
    url: 'https://merchant.onlinesbi.sbi/merchant/merchantprelogin.htm',
  },
  version: 1,
  payment_id: 'pay_K3SZaz0RK7HzL9',
  gateway:
    'eyJpdiI6IlNDRkV6UzJcL2ViWVZlY3BXMnpERStRPT0iLCJ2YWx1ZSI6IllCVVIrSkwyc0ZDS0o5c1Y3bXo5ZHFiSWthQ0VsTkUwMzdVQjZtVlM5a1Zyb1RvNEl4RFFQdTZqdzEzcDVlMEMiLCJtYWMiOiJmMjU1NWU2ZDI2NGU5M2RmZDIxNzBhNjM0Yzg2YzFmM2FjM2Q0ZGJkNWM2YTQ0OWM2NDc3ZmE2OGYwYjkxNTQ5In0=',
  amount: '\u20b9 1',
  image: null,
  magic: false,
};

const amazonPayWalletPayload = {
  type: 'first',
  request: {
    url: 'https://amazonpay.amazon.in/initiatePayment?payload=R5IiYdFU4wuiVVw7z3Cbl1CN3ge6VzfczEsSjF8RStQMUUpR2sppP3kiGTUeL7qmbDt6Qpiel2WmT1LODg7ZPuRxbZfSJ9ssqIKc0Yd%2FtDpIQCDBC%2FqvRuAJniYIjRqj7Yd1Y4FwEYr5YpO73bzIBD1YdtznaMc1lGi8q%2BPFEge2D33wMNyn8uFmLeqFkRujpBRP9RxrWcPwP5sXPVoHMHKfRh5fn5tBqn5kUILvZNOrlhoQcguayZTXe7Fk%2FuuoSqC597XN%2FXN0pmaU7oXo6SF99aZZyx2uRxVVWuS538Klz5ltF%2Bb%2FpGzv0ir7W4TPOxEK%2BrLnVqsFbcT8AhP3%2B81y5WloCOiXONTPNZa0t0A6YSPDnGqr9Ks5JT2otYTIRKAEuHVWXtnayH%2BxJo%2FgY0YZhW4r9CMYx5Wo&key=JA81Fs0VHwiRiAZtT5nK%2FDcVzRD%2BaD0PDoanI%2F0%2BVpTFDYs4LSbUwuBh%2FmauXAJvtS0eX%2Fp50x74C%2FyYxGPH%2FawB7QtT7Rk2UNdkt8RYJWtlt5f%2F5SCd%2Bnz1dvoVhVyhEy3jrMUI2U2VaU%2FUpWIQOtAaQoHbAzvHKDbWhMCx0XDhc0TKTBxn1wXn9F3DsQbYeQouX2tjdo7mBWCW9iAn%2FefFPr3kMp4dryRp215CLlD85J9CqVZ%2F5QkIUVi33MZjjFiGp0pOl6eLo0cNiHUJNYtkDvPenf0VDmuN2pTrorQ2SsmD2cePUmTN5sKs0UqIklzUVjPXtGQ3yNQzHkbxsA%3D%3D&iv=0sZe%2BAFicbPxTxSIOkNW%2Fw%3D%3D&redirectUrl=https%3A%2F%2Fapi.razorpay.com%2Fv1%2Fgateway%2Fwallet_amazonpay%2Fcallback',
    method: 'get',
    content: {
      payload:
        'R5IiYdFU4wuiVVw7z3Cbl1CN3ge6VzfczEsSjF8RStQMUUpR2sppP3kiGTUeL7qmbDt6Qpiel2WmT1LODg7ZPuRxbZfSJ9ssqIKc0Yd/tDpIQCDBC/qvRuAJniYIjRqj7Yd1Y4FwEYr5YpO73bzIBD1YdtznaMc1lGi8q+PFEge2D33wMNyn8uFmLeqFkRujpBRP9RxrWcPwP5sXPVoHMHKfRh5fn5tBqn5kUILvZNOrlhoQcguayZTXe7Fk/uuoSqC597XN/XN0pmaU7oXo6SF99aZZyx2uRxVVWuS538Klz5ltF+b/pGzv0ir7W4TPOxEK+rLnVqsFbcT8AhP3+81y5WloCOiXONTPNZa0t0A6YSPDnGqr9Ks5JT2otYTIRKAEuHVWXtnayH+xJo/gY0YZhW4r9CMYx5Wo',
      key: 'JA81Fs0VHwiRiAZtT5nK/DcVzRD+aD0PDoanI/0+VpTFDYs4LSbUwuBh/mauXAJvtS0eX/p50x74C/yYxGPH/awB7QtT7Rk2UNdkt8RYJWtlt5f/5SCd+nz1dvoVhVyhEy3jrMUI2U2VaU/UpWIQOtAaQoHbAzvHKDbWhMCx0XDhc0TKTBxn1wXn9F3DsQbYeQouX2tjdo7mBWCW9iAn/efFPr3kMp4dryRp215CLlD85J9CqVZ/5QkIUVi33MZjjFiGp0pOl6eLo0cNiHUJNYtkDvPenf0VDmuN2pTrorQ2SsmD2cePUmTN5sKs0UqIklzUVjPXtGQ3yNQzHkbxsA==',
      iv: '0sZe+AFicbPxTxSIOkNW/w==',
      redirectUrl:
        'https://api.razorpay.com/v1/gateway/wallet_amazonpay/callback',
    },
  },
  version: 1,
  payment_id: 'pay_K3SlH6jZ4QjQq9',
  gateway:
    'eyJpdiI6Im5KZllkZTZsNkplZzlldWhGcGl4cnc9PSIsInZhbHVlIjoiRitSYm8xeUJmbjViMGNrd3RUbXNYbnhIRDNhZklkUU9Da2cyMStKOTlGSllCYTNvb3NlelRiYkVUXC9YWmxhQXIiLCJtYWMiOiJmYjdmOGQ4NTY0YWRmMGQxYThkYzYxZDg2YmIxZmQ5MWFiNWI2NTYwNDQ5MzAxYmFiZDcyOWRjZDVjNmRiM2IyIn0=',
  amount: '\u20b9 1',
  image: null,
  magic: false,
};

const upiQr = {
  type: 'intent',
  method: 'upi',
  provider: null,
  version: 1,
  payment_id: 'pay_KBkMjACVVy1CD1',
  gateway:
    'eyJpdiI6Ing1cmtZdEFtbHlLQlpqOWU2Nzg0b3c9PSIsInZhbHVlIjoiVVMyV0prbU84aWgyUWZHRmt4UWtOWFA0M0ViNXVKNGFCcXVcL3lpUFVcL1BKUVFCSWQ0MUo4VFhkeGpDY284QTlQIiwibWFjIjoiOTAyY2I1MDI4ZGUzYmVmMTY2ZWY2Zjg4OTc4MjUxN2ZjODUxMTBmMDNkMTU4NzRhZTkzMGY4OGRkYjMzZTc2MSJ9',
  data: {
    intent_url:
      'upi://pay?pa=razorpay.pg@hdfcbank&pn=Razorpay&tr=KBkMjACVVy1CD1&tn=RazorpayFinetshirt&am=1&cu=INR&mc=8931',
  },
  request: {
    url: 'https://api.razorpay.com/v1/payments/pay_KBkMjACVVy1CD1/status?key_id=rzp_test_1DP5mmOlF5G5ag',
    method: 'GET',
  },
};

const gatewayErrorResponse = {
  error: {
    code: 'GATEWAY_ERROR',
    description:
      "Your payment didn't go through due to a temporary issue. Any debited amount will be refunded in 4-5 business days.",
    source: 'issuer_bank',
    step: 'payment_authorization',
    reason: 'bank_technical_error',
    metadata: { payment_id: 'pay_K3SjcyPZKJE7Nj' },
  },
};

export function* createAjax({ state, params, request }) {
  const data = request.postDataJSON();
  yield {
    data: JsonResponse({
      razorpay_payment_id: 'rzp_123',
    }),
  };
}

export function* createCheckout({ state, params, request }) {
  yield {
    data: {
      status: 200,
      body: `<script>opener.onComplete({razorpay_payment_id: 'rzp_123'})</script>`,
    },
  };
}
