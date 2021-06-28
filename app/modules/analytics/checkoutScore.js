import Analytics from 'analytics';

const sessionStartTime = new Date().getTime();

const getTimeSinceOpen = () => {
  const time = new Date().getTime() - sessionStartTime;
  return time;
};

const score = {
  savedInstrument: 2,
  paymentSuccess: 5,
  affordability_offers: 2,
  under40Sec: 3,
  timeToRender: () => {
    const timeSinceOpen = getTimeSinceOpen();
    if (timeSinceOpen > 6000) {
      return -5;
    }
    if (timeSinceOpen > 4000) {
      return -2;
    }
    if (timeSinceOpen <= 2800) {
      return 2;
    }
  },
  clickOnSubmitWithoutDetails: -2,
  more60Sec: -1,
  failedPayment: -5,
  cancelledPayment: -3,
  wentBack: -0.5,
  saveThisVpa: 1.5,
  paidViaSavedVpa: 2,
  vpaPrefilled: 3,
  // was the user logged in when checkout was rendered
  loggedInUser: 1,
  hadMethodPrefilled: 4,
  switchingTabs: ({ tabsCount }) => {
    if (tabsCount > 20) {
      return -2;
    }
    if (tabsCount > 15) {
      return -1.5;
    }
    if (tabsCount > 10) {
      return -1;
    }
    if (tabsCount > 5) {
      return -0.5;
    }
  },
  timeToSubmit: () => {
    const timeSinceOpen = getTimeSinceOpen() / 1000;
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
  instrumentSelected: function () {
    const timeSinceOpen = getTimeSinceOpen() / 1000;
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
  timeToRender: () => {
    const timeSinceOpen = getTimeSinceOpen();
    if (timeSinceOpen <= 2800) {
      return 'Rendered in under 2.8 secs';
    }
    if (timeSinceOpen > 4000) {
      return 'Rendered in more then 4 secs';
    }
  },
  clickOnSubmitWithoutDetails: 'Clicked on submit without details',
  more60Sec: 'Payment completed in more then 60 secs',
  timeToRender4s: 'Rendered in more then 4 secs',
  failedPayment: 'Failed Payment',
  cancelledPayment: 'Cancelled Payment',
  loggedInUser: 'User was logged in',
  timeToSubmit: () => `Time taken to submit - ${getTimeSinceOpen() / 1000}`,
  wentBack: 'Back',
  saveThisVpa: 'Chose to save vpa in payment',
  paidViaSavedVpa: 'Used a saved vpa',
  vpaPrefilled: 'Had his vpa prefilled',
  hadMethodPrefilled: 'Render had the method pre-decided',
  switchingTabs: ({ tabsCount }) => {
    if (tabsCount > 3 && tabsCount <= 5) {
      return 'Switched more then 3 tabs';
    }
    if (tabsCount > 5 && tabsCount <= 7) {
      return 'Switched more then 5 tabs';
    }
    if (tabsCount > 7 && tabsCount <= 9) {
      return 'Switched more then 7 tabs';
    }
    if (tabsCount > 9) {
      return 'Switched more then 9 tabs';
    }
  },
  instrumentSelected: () => 'User selected an instrument',
  invalidVpaBlur: 'Filled an invalid vpa, moved away',
};

let calculatedScore = 0;
let reasonEncountered = '';

const updateScore = function (type, obj) {
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
    calculatedScore += score[type](obj);
    reasonEncountered += reasons[type](obj) + ' | ';
  }

  Analytics.setMeta('scoreVersion', 1.0);
  Analytics.setMeta('checkoutScore', calculatedScore);
  Analytics.setMeta('checkoutScoreReason', reasonEncountered);
};

export default updateScore;
