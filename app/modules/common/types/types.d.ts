declare global {
  interface Navigator {
    userLanguage?: string;
    brave?: {
      isBrave: () => Promise<boolean>;
    };
  }
}

export type PaymentData = {
  [key: string]: any;
};

export type LastOTPSent = {
  razorpay: undefined | number;
};

export type OTPSend = {
  razorpay: number;
};

export type PaylaterUpdatedConfig = {
  [key: string]: any;
};

export type TransformParam = {
  amount: number;
  emi: boolean;
  recurring: boolean;
};

export type CardType = 'card';

export type WebPaymentsType = {
  [key: string]: boolean;
};
