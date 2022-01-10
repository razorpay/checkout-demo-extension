import { getCurrentCustomer } from 'tests/setupPreferences';

const noop = () => {};

/**
 * Don't use jest.fn() to mock any function into session object.
 * @typedef {Object} Session
 */
const sessions = {
  0: {
    id: Math.random(),
    showOverlay: noop,
    get: noop,
    themeMeta: {
      icons: {
        user_protect: '',
        message: '',
        lock: '',
      },
    },
    r: {
      isLiveMode: () => false,
    },
    validateOffers: noop,
    tab: 'cards',
    screen: 'saved-cards',
    getAppliedOffer: noop,
    setRawAmountInHeader: noop,
    updateAmountInHeader: noop,
    getCurrentCustomer,
    showEmiPlansForSavedCard: noop,
    setScreen: noop,
    switchTab: noop,
    askOTPForSavedCard: noop,
  },
};

export const getSession = (id = 0) => sessions[id];

export const createSession = jest.fn(getSession);

export const setSession = jest.fn((id, newSession) => {
  sessions[id] = newSession;
});
