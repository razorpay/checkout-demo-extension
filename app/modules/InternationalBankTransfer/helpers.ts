// utils
import { makeAuthUrl } from 'checkoutstore';
import { getMerchantMethods } from 'razorpay';
import fetch from 'utils/fetch';
import { formatMessageWithLocale } from 'i18n';

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
  const methods: InstrumentMethods =
    getMerchantMethods()?.intl_bank_transfer || {};
  return METHOD_NAMES.some((method: string) => methods[method]);
};

export const getAllMethods = () => {
  if (isIntlBankTransferEnabled()) {
    const methods: InstrumentMethods =
      getMerchantMethods()?.intl_bank_transfer || {};
    return Object.keys(methods).map((method) => ({
      id: method,
    }));
  }
  return [];
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
  return new Promise((callback) => {
    fetch({
      url,
      callback,
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
