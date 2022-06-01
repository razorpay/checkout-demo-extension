import * as _ from '../../../cfu/src/fe/implicit/_.js';
import * as _Obj from '../../../cfu/src/fe/implicit/_Obj.js';

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
global._Obj = _Obj;
global.__BUILD_NUMBER__ = '123456789';

global.beforeEach(() => {
  initI18n();
});

initThemeMock();
mockCanvas();

global.Razorpay = {
  sendMessage: jest.fn(),
};
