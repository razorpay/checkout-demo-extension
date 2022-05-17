declare namespace Payment {
  type PaymentParams = {
    [x: string]: any;
    feesRedirect?: any;
    external: {
      gpay?: boolean;
      amazonpay?: boolean;
    };
    optional?: {
      contact?: boolean;
      email?: boolean;
    };
    paused?: any;
    gpay?: boolean;
    upiqr?: boolean;
  };
  export type PaymentStatus = 'cancel' | 'success' | 'error';
}
