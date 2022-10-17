import { makeAuthUrl } from 'common/makeAuthUrl';
import type Razorpay from 'common/Razorpay';
import { getOption } from 'razorpay';

type CustomDisclaimersResult = {
  text: string;
  padding: number;
};

type RowHeader = {
  id: string;
  title: string;
  value?: string;
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
export function getCustomFields(): Array<any> {
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
  let padding = 0;
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
  const currentDate: Date = new Date();
  const minTime: number = currentDate.getTime() + 20 * 60000;
  const maxTime: number = currentDate.setMonth(currentDate.getMonth() + 6);
  let time = 0;
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

export function createChallanDetailTableData(
  rowHeaders: Array<RowHeader>,
  data: { [key: string]: string }
) {
  let formattedData: Array<RowHeader> = [];
  // adding value to each object on table data
  formattedData = rowHeaders.reduce((acc, item) => {
    if (data[item.id]) {
      acc.push({ ...item, value: data[item.id] });
    }
    return acc;
  }, formattedData);
  return formattedData;
}

export function addCustomFields(tableDetails: RowHeader[]) {
  let finalFields = tableDetails;
  let existingFieldMap: { [key: string]: number } = {};
  // creating a map of existing fields with id and index to reduce complexity of comparing two arrays
  existingFieldMap = tableDetails.reduce(
    (acc, item, idx) => ({ ...acc, [item.id]: idx }),
    existingFieldMap
  );

  const customFields: RowHeader[] = getCustomFields() || [];
  // final fields logic with updated titles and new fields
  finalFields = customFields.reduce((acc, item) => {
    if (item.id && existingFieldMap[item.id] !== undefined) {
      const index = existingFieldMap[item.id];
      const value = item.value || acc[index].value;
      acc[index] = {
        title: item.title,
        id: item.id,
        value,
      };
    } else if (item.value) {
      acc.push({ ...item, id: item.id || item.title });
    }
    return acc;
  }, finalFields);

  return finalFields;
}
