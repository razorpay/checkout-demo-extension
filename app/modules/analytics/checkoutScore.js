import Analytics from 'analytics';

const getTimeSinceOpen = () => {
  return Analytics.getMeta().timeSince.open() / 1000;
};

const score = {
  savedInstrument: 2,
  paymentSuccess: 5,
  affordability_offers: 2,
  under40Sec: 3,
  timeToRender: 2,
  clickOnSubmitWithoutDetails: -2,
  switching3Tabs: -1,
  more60Sec: -1,
  timeToRender4s: -1,
  failedPayment: -3,
  cancelledPayment: -3,
  wentBack: -1,
  saveThisVpa: 1.5,
  paidViaSavedVpa: 2,
  vpaPrefilled: 3,
  // was the user logged in when checkout was rendered
  loggedInUser: 1,
  hadMethodPrefilled: 4,
  timeToSubmit: () => {
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
  instrumentSelected: function() {
    const timeSinceOpen = getTimeSinceOpen();
    if (timeSinceOpen < 5) {
      return 5;
    }
    if (timeSinceOpen < 8) {
      return 3;
    }
    if (timeSinceOpen < 10) {
      return 0;
    }
    if (timeSinceOpen >= 20) {
      return -3;
    }
    if (timeSinceOpen >= 10) {
      return -1;
    }
    return 0;
  },
  invalidVpaBlur: -2.5,
};

const reasons = {
  savedInstrument: 'Saved Instrument',
  paymentSuccess: 'Payment Success',
  affordability_offers: 'Offers Applied',
  under40Sec: 'Payment Completed Under 40 secs',
  timeToRender: 'Rendered under 2.8 secs',
  clickOnSubmitWithoutDetails: 'Clicked on submit without details',
  switching3Tabs: 'Switched more then 3 tabs',
  more60Sec: 'Payment completed in more then 60 secs',
  timeToRender4s: 'Rendered in more then 4 secs',
  failedPayment: 'Failed Payment',
  cancelledPayment: 'Cancelled Payment',
  loggedInUser: 'User was logged in',
  timeToSubmit: () => `Time taken to submit - ${getTimeSinceOpen()}`,
  wentBack: 'Back',
  saveThisVpa: 'Chose to save vpa in payment',
  paidViaSavedVpa: 'Used a saved vpa',
  vpaPrefilled: 'Had his vpa prefilled',
  hadMethodPrefilled: 'Render had the method pre-decided',
  instrumentSelected: () => 'User selected an instrument',
  invalidVpaBlur: 'Filled an invalid vpa, moved away',
};

let calculatedScore = 0;
let reasonEncountered = '';

const updateScore = function(type) {
  if (!score[type]) {
    // sanity check if we send the wrong key
    console.warn('incorrect key sent for score updatation');
    return;
  }

  // Most scores are numbers
  if (typeof score[type] === 'number') {
    calculatedScore += score[type];
    reasonEncountered += reasons[type] + ' | ';
    // Some scores are functions which depend on other data
  } else {
    calculatedScore += score[type]();
    reasonEncountered += reasons[type]() + ' | ';
  }

  Analytics.setMeta('checkoutScore', calculatedScore);
  Analytics.setMeta('checkoutScoreReason', reasonEncountered);
};

export default updateScore;
