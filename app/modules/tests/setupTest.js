import * as _ from '../../../cfu/src/fe/implicit/_.js';

import initI18n from './init-i18n';
import mockCanvas from './__mocks__/mock-canvas';
import initThemeMock from './__mocks__/theme.js';

global.matchMedia = jest.fn(() => ({ matches: false }));

/**
 * Make these functions globally available for jest.
 * rollup-injects.js does the injection for application code
 * Presuming they are pure functions, it would be okay to use them as-is.
 */
global._ = _;
global.__BUILD_NUMBER__ = '123456789';
global.__TRAFFIC_ENV__ = '123456789';
global.__GIT_COMMIT_HASH__ = '123456789';

global.beforeEach(() => {
  initI18n();
});

jest.mock('cta', () => ({
  ...jest.requireActual('cta'),
  __esModule: true,
  CTAHelper: {
    setActiveCTAScreen: jest.fn(),
  },
  setWithoutOffer: jest.fn(),
  hideCta: jest.fn(),
}));

initThemeMock();
mockCanvas();

global.Razorpay = {
  sendMessage: jest.fn(),
};
