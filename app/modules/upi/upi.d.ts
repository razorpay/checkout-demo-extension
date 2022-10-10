declare namespace UPI {
  export type AppConfiguration = {
    app_name: string;
    name?: string;
    package_name: string;
    app_icon: string;
    handles: Array<string>;
    verify_registration?: boolean;
    shortcode: string;
    url_schema?: string;
  };

  export interface RawIntentResponse {
    response: IntentResponse;
    [key: string]: any;
  }
  export type IntentResponse = {
    tezResponse?: string;
    txnId: string;
    responseCode: string;
    ApprovalRefNo: string;
    Status: string;
    txnRef: string;
    TrtxnRef: string;
    signature: string;
    signatureKeyId: string;
    result?: string;
    [key: string]: any;
  };
  export type AppTileVariant = 'circle' | 'square';
  export type AppStackVariant = 'row' | 'subText';

  export type AppTileAction =
    | 'nativeIntent'
    | 'deepLinkIntent'
    | 'paymentRequestAPI'
    | 'none';

  export interface PaymentProcessConfiguration {
    app?: AppConfiguration;
    action: AppTileAction;
    payloadData?: Partial<UPIPaymentPayload>;
    qrFlow?: {
      onPaymentCreate: (responseData: {
        intent_url: string;
        qr_code_url: string;
      }) => void;
      qrv2?: boolean;
    };
  }

  export type UPIPaymentPayload = {
    [x: string]: any;
    method: 'upi' | 'app';
    /**
     * UPI App Package Name
     */
    upi_app?: string | null;
    /**
     * App provider Short code
     */
    provider: string;
    upi: any;
    offer_id?: string;
    reward_ids?: Array<string>;
    amount?: number;
    /**
     * Bank: For TPV orders
     */
    bank?: string;
    /**
     * For Fee bearer
     */
    fee?: number;
    /**
     * For QR flow
     */
    '_[upiqr]'?: '1' | '0';
  };

  type Platform =
    | 'mWebAndroid'
    | 'mWebiOS'
    | 'androidSDK'
    | 'iosSDK'
    | 'desktop';

  export type UpiAppForPay = Partial<{
    callbackOnPay: any;
    app: UPI.AppConfiguration;
    downtimeConfig: Downtime.Config;
    position: {
      row: number;
      column: number;
    };
  }>;

  export type QRStatus = 'loading' | 'refresh' | 'qr';

  export type PaymentResponseHandler = (
    status: Payment.PaymentStatus,
    response: Common.Object<any>
  ) => void;

  export type PaymentHandlerConfiguration = {
    [key in Payment.PaymentStatus]?: boolean;
  };
  export type QRParent = 'homeScreen' | 'upiScreen';
}
