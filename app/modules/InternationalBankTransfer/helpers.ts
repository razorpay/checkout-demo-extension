// utils
import { makeAuthUrl } from 'checkoutstore';
import { getMerchantMethods } from 'razorpay';
import fetch from 'utils/fetch';
import { formatMessageWithLocale } from 'i18n';
import { capture as captureError, SEVERITY_LEVELS } from 'error-service';

// config
import RazorpayConfig from 'common/RazorpayConfig';

// constants
import { TAB_NAME, METHOD_NAMES, METHOD_ICON_MAPPING } from './constants';

// types
import type {
  InstrumentMethods,
  VA_RESPONSE_TYPE,
  PREFERRED_INSTRUMENT_TYPE,
} from './types';

/**
 * Check wether international bank transfer is enabled or not
 * @returns boolean
 */
export const isIntlBankTransferEnabled = () => {
  const methods: InstrumentMethods = getMerchantMethods()?.intl_bank_transfer;

  if (methods && typeof methods === 'object') {
    return METHOD_NAMES.some((method: string) => methods[method]);
  }
  return false;
};

export const getAllMethods = () => {
  if (isIntlBankTransferEnabled()) {
    const methods: InstrumentMethods = getMerchantMethods().intl_bank_transfer;

    // extract only ACH supported methods
    const supportedMethods: { id: string }[] = [];

    METHOD_NAMES.forEach((method) => {
      // consider only truth value
      if (methods[method]) {
        supportedMethods.push({
          id: method,
        });
      }
    });

    return supportedMethods;
  }
  return [];
};

export const validateVirtualAccountResponse = (
  response?: Partial<VA_RESPONSE_TYPE>
) => {
  // validate error case
  if (typeof response === 'object' && typeof response.error === 'object') {
    return false;
  }

  // validate success case
  return (
    typeof response === 'object' &&
    typeof response.account === 'object' &&
    response.amount !== undefined &&
    response.currency !== undefined
  );
};

export const getVAs = ({
  vaCurrency,
  amount,
  baseCurrency,
}: {
  vaCurrency: string;
  amount: number;
  baseCurrency: string;
}): Promise<VA_RESPONSE_TYPE> => {
  const url = makeAuthUrl(
    `international/virtual_account/${vaCurrency}?amount=${amount}&currency=${baseCurrency}`
  );
  return new Promise((resolve, reject) => {
    fetch({
      url,
      callback: (response: VA_RESPONSE_TYPE) => {
        try {
          if (validateVirtualAccountResponse(response)) {
            resolve(response);
          } else {
            throw Error(
              response?.error?.description || 'Failed to fetch account details.'
            );
          }
        } catch (err) {
          // capture exception
          const error = err as Error;
          reject(error.message);
          captureError(error, {
            severity: SEVERITY_LEVELS.S2,
            unhandled: false,
          });
        }
      },
    });
  });
};

export const getPreferredMethod = (
  instrument: PREFERRED_INSTRUMENT_TYPE | undefined
) => {
  if (instrument && instrument.method === TAB_NAME) {
    return METHOD_NAMES.find((method) => method === instrument.providers[0]);
  }
  return null;
};

export const isIntlBankTransferMethod = (
  instrument: PREFERRED_INSTRUMENT_TYPE | undefined
) => !!getPreferredMethod(instrument);

export const getDetailsForIntlBankTransfer = (
  instrument: PREFERRED_INSTRUMENT_TYPE,
  locale: string
) => {
  const provider = instrument.providers[0];
  const title = formatMessageWithLocale(
    `intl_bank_transfer.${provider}.title`,
    locale
  );
  const subtitle = formatMessageWithLocale(
    `intl_bank_transfer.${provider}.subtitle`,
    locale
  );
  const icon = `${RazorpayConfig.cdn}international/${METHOD_ICON_MAPPING[provider]}`;
  return {
    title: `${title} - ${subtitle}`,
    icon,
    subtitle: '',
  };
};
