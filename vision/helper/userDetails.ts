import { expect } from '@playwright/test';
import type { UtilFunction } from '../core/types';
import {
  getOption,
  getPreferences,
  isIndianCurrency,
  isOneClickCheckout,
} from '../utils/common';

/**
 * helper must have UtilFunction type
 */

/**
 * Fill Contact Details
 */
export const fillContactDetails: UtilFunction<{
  email?: string;
  phone?: string;
  skipEmail?: boolean;
  skipPhone?: boolean;
}> = async ({ page, inputData }) => {
  const contactElement = await page.$('#contact');
  if (contactElement && !inputData?.skipPhone) {
    await page.type('#contact', inputData?.phone || '8888888888');
  }
  const emailElement = await page.$('#email');
  if (emailElement && !inputData?.skipEmail) {
    await page.type('#email', 'void@razorpay.com');
  }
};

export const assertContactDetailPage: UtilFunction = async ({
  context,
  page,
}) => {
  const isOptionalContact =
    (getPreferences(context, 'optional') || []).indexOf('contact') !== -1;
  const { isOrgRazorpay } = getPreferences(context, 'org') || {};

  const isOptionalEmail =
    // TODO remove this once we release optional email 100%
    (getPreferences(context, 'optional') || []).indexOf('email') !== -1 ||
    (!(
      getPreferences(context, 'features.show_email_on_checkout') &&
      !getPreferences(context, 'features.email_optional_oncheckout')
    ) &&
      isIndianCurrency(context) &&
      !isOneClickCheckout(context) &&
      isOrgRazorpay);

  const isEmailHiddenFromPreference = !getPreferences(
    context,
    'features.show_email_on_checkout'
  );
  const isEmailHiddenFromOption = getOption(context, 'hidden.email');
  const isEmailHidden =
    typeof isEmailHiddenFromOption === 'boolean'
      ? isEmailHiddenFromOption
      : isEmailHiddenFromPreference;

  const isEmailFieldHidden = isOptionalEmail && isEmailHidden;
  const isContactHidden =
    isOptionalContact && getOption(context, 'hidden.contact');

  if (isEmailFieldHidden) {
    expect(await page.$('#email')).toBeNull();
  } else {
    expect(await page.$('#email')).toBeDefined();
  }
  if (isContactHidden) {
    expect(await page.$('#contact')).toBeNull();
  } else {
    expect(await page.$('#contact')).toBeDefined();
  }
};
