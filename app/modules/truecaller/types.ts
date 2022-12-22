import type { MakeRequired, ValueOf } from 'types/utils';
import type { Address, Tokens } from 'razorpay/types/Preferences';
import type {
  SUPPORTED_LANGUAGES,
  CUSTOMER_VERIFY_STATUS,
  TRUECALLER_VARIANT_NAMES,
} from './constants';

export type Config = {
  type: string;
  requestNonce: string;
  partnerKey: string;
  partnerName: string;
  lang: keyof typeof SUPPORTED_LANGUAGES;
  loginPrefix: string;
  loginSuffix: string;
  ctaPrefix: string;
  ctaColor: string;
  ctaTextColor: string;
  btnShape: string;
  skipOption: string;
  privacyUrl?: string;
  termsUrl?: string;
};

export type OverrideConfig = MakeRequired<
  Pick<Config, 'requestNonce' | 'lang' | 'ctaColor' | 'ctaTextColor'>,
  'requestNonce'
>;

export type UserMetricStore = {
  skipped_count: number;
  timestamp: number;
};
export type TruecallerPresentStore = boolean | null;

export type UserVerifyPendingApiResponse = {
  status: typeof CUSTOMER_VERIFY_STATUS['PENDING'];
};

export type UserVerifySuccessApiResponse = {
  status: typeof CUSTOMER_VERIFY_STATUS['RESOLVED'];
  contact: string;
  email: string | null;
  tokens?: Tokens;
  addresses?: Address[];
};

export type UserVerifyTruecallerErrorApiResponse = {
  status: typeof CUSTOMER_VERIFY_STATUS['REJECTED'];
  code: 'user_rejected' | 'use_another_number';
};

export type UserVerifyErrorApiResponse = {
  error: {
    code: string;
    description: string;
  };
  response?: any;
};

export type UserVerifyResponse =
  | UserVerifyPendingApiResponse
  | UserVerifySuccessApiResponse
  | UserVerifyErrorApiResponse
  | UserVerifyTruecallerErrorApiResponse;

export type PromiseResolveType<T> = (value: T | PromiseLike<T>) => void;
export type PromiseRejectType = (reason?: any) => void;

export type TruecallerCheckResponse = {
  status: boolean;
  reason?: string;
};

export type TruecallerVariantNames = ValueOf<typeof TRUECALLER_VARIANT_NAMES>;
