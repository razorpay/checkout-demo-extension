import { derived, writable } from 'svelte/store';
import { getIin, getCardType } from 'common/card';
import { isIndianCustomer } from 'checkoutstore';
export const cardNumber = writable('');
export const cardCvv = writable('');
export const cardExpiry = writable('');
export const cardName = writable('');
export const remember = writable(true);
export const authType = writable('c3ds');
export const selectedCard = writable(null);
export const selectedApp = writable(null);
export const newCardInputFocused = writable(false);
export const dccCurrency = writable('');
export const defaultDCCCurrency = writable(''); // store default currency given by flow api
export const currencyRequestId = writable('');
export const cardCountry = writable(''); // If DCC is not enabled we need to check the card country, if card country is not "IN" then call flows API
export const showSavedCardTooltip = writable(false); // For recurring save card is mandatory, this flag toggles help tooltip
export const defaultUserConsentForTokenization = true; // added this as we need to override some areas
export const userConsentForTokenization = writable(
  defaultUserConsentForTokenization
); //this is only used in p13n and saved cards area

/** AVS state */
export const AVSScreenMap = writable({});
export const AVSDccPayload = writable({}); // this is use to temporary storage of header & cta text so on proceed we can show
export const selectedCardFromHome = writable(null); // use by AVS if card selected from home and then directly jump to AVS to show data
export const AVSBillingAddress = writable(null);
export const isAVSEnabledForEntity = writable(null); // to check avs is enabled or not value is set in presubmit flow only

export const cardType = derived(cardNumber, getCardType);
export const cardIin = derived(cardNumber, getIin);
export const cardTab = writable(''); // Value of current tab. Values can be one of "card", "emi", "". "" can be considered to be null.

export const showNoCvvCheckbox = derived(
  [cardNumber, cardType],
  ([$cardNumber, $cardType]) =>
    $cardType === 'maestro' && $cardNumber.length > 5
);

export const noCvvChecked = writable(false);

export const hideExpiryCvvFields = derived(
  [showNoCvvCheckbox, noCvvChecked],
  ([$showNoCvvCheckbox, $noCvvChecked]) => $showNoCvvCheckbox && $noCvvChecked
);

export const showAuthTypeSelectionRadio = writable(false);

export const currentCvv = writable('');
export const currentAuthType = writable('');

export const internationalCurrencyCalloutNeeded = writable(false);

export const hitCREDEligibility = writable(true);

/**
Before isIndianCustomer, `remember` default value was true
After isIndianCustomer, `remember` default value is value of isIndianCustomer

What is isIndianCustomer?: Its a derived store value from contact, checks if its +91( indian ) contact

But when this is introduced in system, we found a bug where
`remember` is always false irrespective of isIndianCustomer/contact changed
Reason: 
When store is being initialized, contact is not present (rendering didn't complete or no-prefill present).
This results in isIndianCustomer and remember to be undefined.
When contact is captured, it only updates the isIndianCustomer (due to derived state influence)
But it won'r update remember value as its already initialized and handler to present. 

Fix: Revert remember default value to true, and update using subscription on isIndianCustomer
 */
isIndianCustomer?.subscribe(remember.set);

export const cardScreenScrollable = writable(false);
