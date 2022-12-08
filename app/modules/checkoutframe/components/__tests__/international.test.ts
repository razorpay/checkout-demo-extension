// testable
import {
  internationalTabRender,
  internationalTabDestroy,
  isInternationalAVSView,
  updateInternationalProvider,
  showInternationalAVS,
  internationalTabBackPress,
  getInternationalTabData,
} from '../international';

// mocks
import { setView, destroyView } from '../';

jest.mock('cta', () => {
  const original = jest.requireActual('cta');
  const helpers = jest.requireActual('cta/helper');
  const CTAHelper = jest.requireActual('cta/store');
  return {
    ...helpers,
    default: original.default,
    CTAHelper: CTAHelper.default,
  };
});
jest.mock('../');

jest.mock('account_modal/helper.ts', () => ({
  ...jest.requireActual('account_modal/helper.ts'),
  getLogoByCountry: jest.fn(),
}));

const cleanup = () => {
  const formFields = document.getElementById('form-fields');
  if (formFields) {
    document.body.removeChild(formFields);
  }
};

function createRootElement() {
  const formFields = document.createElement('div');
  formFields.id = 'form-fields';
  document.body.append(formFields);
}

describe('Test internationalTabRender', () => {
  afterEach(cleanup);
  test('should return null if target element is not present', () => {
    expect(internationalTabRender()).toStrictEqual(null);
  });
  test('should render svelte component if target element is in document', () => {
    createRootElement();

    const component = internationalTabRender();
    expect(component).not.toBe(null);
    expect(setView).toHaveBeenCalledWith('international', component);
    expect(component).toHaveProperty('$$.props.onShown');
    expect(component).toHaveProperty('$$.props.showNVSForm');
    expect(component).toHaveProperty('$$.props.directlyToNVS');
    expect(component).toHaveProperty('$$.props.isOnNVSForm');
    expect(component).toHaveProperty('$$.props.onBack');
    expect(component).toHaveProperty('$$.props.onProviderSelection');
  });
});

describe('Test internationalTabDestroy', () => {
  afterEach(cleanup);
  test('should destroy component event without rendering', () => {
    expect(() => internationalTabDestroy()).not.toThrow();
  });
  test('should destroy rendered component', () => {
    createRootElement();
    internationalTabRender();
    internationalTabDestroy();
    expect(destroyView).toHaveBeenCalledWith('international');
  });
});

describe('Test isInternationalAVSView', () => {
  afterEach(cleanup);
  test('should work without throwing error', () => {
    expect(() => isInternationalAVSView()).not.toThrow();
  });
  test('should return false if AVS view is not rendered', () => {
    createRootElement();
    internationalTabRender();
    expect(isInternationalAVSView()).toStrictEqual(false);
  });
});

describe('Test updateInternationalProvider', () => {
  afterEach(cleanup);
  test('should update without breaking', () => {
    expect(() => updateInternationalProvider('poli')).not.toThrow();
  });
  test('should update without breaking if component rendered', () => {
    createRootElement();
    internationalTabRender();
    expect(() => updateInternationalProvider('poli')).not.toThrow();
  });
});

describe('Test showInternationalAVS', () => {
  afterEach(cleanup);
  test('should call without breaking', () => {
    expect(() => showInternationalAVS(true)).not.toThrow();
  });
  test('should call without breaking if component is rendered', () => {
    createRootElement();
    internationalTabRender();
    expect(() => showInternationalAVS(true)).not.toThrow();
  });
});

describe('Test internationalTabBackPress', () => {
  afterEach(cleanup);
  test('should call without breaking', () => {
    expect(() => internationalTabBackPress()).not.toThrow();
  });
  test('should call without breaking if component is rendered', () => {
    createRootElement();
    internationalTabRender();
    expect(() => internationalTabBackPress()).not.toThrow();
  });
});

describe('Test getInternationalTabData', () => {
  test('should call without breaking', () => {
    expect(() => getInternationalTabData()).not.toThrow();
  });
  test('should return default data', () => {
    expect(getInternationalTabData()).toStrictEqual({
      NVSEntities: null,
      NVSFormData: null,
      NVSRequired: false,
      isNVSFormHomeScreenView: false,
      selectedInternationalProvider: null,
    });
  });
});
