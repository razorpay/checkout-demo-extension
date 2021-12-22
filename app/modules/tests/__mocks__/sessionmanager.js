import { getCurrentCustomer } from 'tests/setupPreferences';

const sessions = {
  0: {
    id: Math.random(),
    showOverlay: jest.fn(),
    get: jest.fn(),
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
    validateOffers: jest.fn(),
    tab: 'cards',
    screen: 'saved-cards',
    getAppliedOffer: jest.fn(),
    setRawAmountInHeader: jest.fn(),
    updateAmountInHeader: jest.fn(),
    getCurrentCustomer,
    showEmiPlansForSavedCard: jest.fn(),
    setScreen: jest.fn(),
    switchTab: jest.fn(),
    askOTPForSavedCard: jest.fn(),
  },
};

export const getSession = (id = 0) => sessions[id];

export const createSession = jest.fn(getSession);

export const setSession = jest.fn((id, newSession) => {
  sessions[id] = newSession;
});
