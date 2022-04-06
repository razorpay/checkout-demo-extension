import * as _ from '../../../cfu/src/fe/implicit/_.js';
import * as _Arr from '../../../cfu/src/fe/implicit/_Arr.js';
import * as _Obj from '../../../cfu/src/fe/implicit/_Obj.js';
import * as _El from '../../../cfu/src/fe/implicit/_El.js';

import initI18n from './init-i18n';
import 'jest-canvas-mock';

global.beforeEach(() => {
  initI18n();
});

global.matchMedia = jest.fn(() => ({ matches: false }));

/**
 * Make these functions globally available for jest.
 * rollup-injects.js does the injection for application code
 * Presuming they are pure functions, it would be okay to use them as-is.
 */
global._ = _;
global._Arr = _Arr;
global._Obj = _Obj;
global._El = _El;
