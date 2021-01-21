import Analytics from 'analytics';

const getTimeSinceOpen = () => {
  return Analytics.getMeta().timeSince.open() / 1000;
};

const score = {
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
  wentBack: -1,
  saveThisVpa: 1.5,
  paidViaSavedVpa: 2,
  // was the user logged in when checkout was rendered
  loggedInUser: 1,
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
};

const reasons = {
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
  loggedInUser: 'User was logged in',
  timeToSubmit: () => `Time taken to submit - ${getTimeSinceOpen()}`,
  wentBack: 'Back',
  saveThisVpa: 'Chose to save vpa in payment',
  paidViaSavedVpa: 'Used a saved vpa',
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
  if (score[type] === 'number') {
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
