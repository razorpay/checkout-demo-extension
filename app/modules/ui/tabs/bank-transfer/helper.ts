import { makeAuthUrl } from 'common/helper';
import type Razorpay from 'common/Razorpay';
import { getOption } from 'razorpay';

type CustomDisclaimersResult = {
  text: string;
  padding: number;
};

/**
 *
 * @param {string} label
 * @returns boolean
 */
export function isCustomChallan(label: string): boolean {
  if (Array.isArray(getOption(label)) && getOption(label).length) {
    return true;
  }
  return false;
}

/**
 * @description Function gives us an array of custom disclaimers configured in options along with
 * required amount of padding
 * @returns Array
 */
export function getCustomDisclaimers(): Array<CustomDisclaimersResult> {
  const result: CustomDisclaimersResult[] = [];
  const disclaimers = getOption('challan.disclaimers') || [];
  disclaimers.forEach((disclaimer: { text: string }) => {
    result.push({
      text: disclaimer.text,
      padding: setPadding(disclaimer.text),
    });
  });
  return result;
}

/**
 * @description Functions gives us an array of custom feilds configured in options
 * @returns Array
 */
export function getCustomFields(): Array<{}> {
  return getOption('challan.fields') || [];
}

/**
 * @description Functions gives us expiry  configured in options
 * @returns {number | null}
 */
export function getCustomExpiry(): number | null {
  return getOption('challan.expiry').date || null;
}

/**
 *
 * @param {string} str
 * @returns number
 */
function setPadding(str: string): number {
  let padding: number = 0;
  if (str.length <= 110) {
    padding = 4;
  } else if (str.length > 110 && str.length <= 150) {
    padding = 5;
  } else if (str.length > 150 && str.length <= 250) {
    padding = 9;
  }
  return padding;
}

/**
 * @param {number} timestamp in ms
 * @description Function checks if a timestamp is between minTime & maxTime 
 if is less than minTime considers minTime as expiry and more than maxTime than considers maxTime as expiry
 if its between min & max then the timesStamp is returned as is
 * @returns {number} timestamp in sec
 */
export function getTimeStamp(timestamp: number): number {
  let currentDate: Date = new Date();
  let minTime: number = currentDate.getTime() + 20 * 60000;
  let maxTime: number = currentDate.setMonth(currentDate.getMonth() + 6);
  let time: number = 0;
  if (timestamp < minTime) {
    time = Math.floor(minTime / 1000);
  } else if (timestamp > maxTime) {
    time = Math.floor(maxTime / 1000);
  } else {
    if (timestamp >= minTime && timestamp <= maxTime) {
      time = Math.floor(timestamp / 1000);
    }
  }
  return time;
}

/**
 *
 * @param {typeof Razorpay} instance razorpay instance
 * @param {string} order_id order of bank-transfer
 * @returns {string} url generated using makeAuthUrl
 */
export function getBankTransferUrl(
  instance: typeof Razorpay | any,
  order_id: string
): string {
  const expiry: number | null = getCustomExpiry()
    ? getTimeStamp(getCustomExpiry() as number)
    : null;
  return makeAuthUrl(
    instance,
    `orders/${order_id}/virtual_accounts${expiry ? `?close_by=${expiry}` : ''}`
  );
}

/**
 *
 * @returns {boolean}
 */
export function setCustomChallanMetaProp(): boolean {
  if (
    isCustomChallan('challan.disclaimers') ||
    isCustomChallan('challan.fields') ||
    getCustomExpiry()
  ) {
    return true;
  }
  return false;
}
