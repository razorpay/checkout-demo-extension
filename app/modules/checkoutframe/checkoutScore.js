import Analytics from 'analytics';

export const score = {
  savedInstrument: 2,
  paymentSuccess: 5,
  affordability: 2,
  under40Sec: 3,
  timeToRender: 2,
  clickOnSubmitWithoutDetails: -2,
  switching3Tabs: -1,
  more60Sec: -1,
  timeToRender4s: -1,
  failedPayment: -3,
  cancelledPayment: -3,
};

export const keys = {
  savedInstrument: 'Saved Instrument',
  paymentSuccess: 'Payment Success',
  affordability: 'Affordability',
  under40Sec: 'Payment Completed Under 40 secs',
  timeToRender: 'Rendered under 2.8 secs',
  clickOnSubmitWithoutDetails: 'Clicked on submit without details',
  switching3Tabs: 'Switched more then 3 tabs',
  more60Sec: 'Payment completed in more then 60 secs',
  timeToRender4s: 'Rendered in more then 4 secs',
  failedPayment: 'Failed Payment',
  cancelledPayment: 'Cancelled Payment',
};

const getTimeSinceOpen = () => {
  return Analytics.getMeta().timeSince.open();
};

export const utils = {
  getTimeToSubmitScore: function(meta) {
    const timeSinceOpen = getTimeSinceOpen();
    if (timeSinceOpen < 20) {
      return 5;
    }
    if (timeSinceOpen < 30) {
      return 3.5;
    }
    if (timeSinceOpen < 40) {
      return 2;
    }
    if (timeSinceOpen > 90) {
      return -5;
    }
    if (timeSinceOpen > 70) {
      return -3.5;
    }
    if (timeSinceOpen > 60) {
      return -2;
    }
    return 0;
  },
};
