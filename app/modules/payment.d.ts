declare namespace Payment {
  type PaymentParams = {
    [x: string]: T;
    feesRedirect?: boolean;
    external: {
      gpay?: boolean;
      amazonpay?: boolean;
    };
    optional?: {
      contact?: boolean;
      email?: boolean;
    };
    paused?: boolean;
    gpay?: boolean;
    upiqr?: boolean;
    /**
     * This is to track from which feature the payment create was requested and to segregate what happened to such payment next(cancel/error)
     */
    additionalInfo?: {
      referrer?: PaymentReferer;
      config?: UPI.PaymentProcessConfiguration;
    };
  };
  export type PaymentStatus = 'cancel' | 'success' | 'error';
  export type PaymentReferer = 'UPI_UX' | 'QR_V2' | undefined;
  export type PaymentHistoryInstance = Partial<{
    data: CustomObject<object>;
    params: Payment.PaymentParams;
    status: Payment.PaymentStatus;
    statusData: {
      error?: {
        metadata?: {
          payment_id?: string;
        };
      };
    };
    errorReason: 'manual' | 'automatic';
  }>;
}
