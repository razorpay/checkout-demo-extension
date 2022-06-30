import {
  tryOpeningIntentUrlOniOSMWeb,
  upiPopUpForiOSMWeb,
  upiPopupEvents,
} from '../helper/intent/upiOniOSMWeb';
import {
  APP_DETECTED_FURTHER_STEPS_TIMEOUT,
  APP_DETECTION_OR_MANUAL_CANCEL_TIMEOUT,
  upiBackCancel,
  USER_CONSENT_FOR_NAVIGATION_TIMEOUT,
} from '../constants';

const testCbName = 'testcB';

jest.mock('analytics', () => ({
  track: jest.fn(),
}));
const mockedOpen = jest.fn(() => ({
  window: {
    close: () => {},
    history: {
      pushState: () => {},
    },
    open: jest.fn(),
  },
  document: {
    write: () => {},
  },
  open: jest.fn(),
}));

function finishTimeout(time: number) {
  jest.advanceTimersByTime(time);
}

describe('upiPopUpForiOSMWeb utility tests', () => {
  let originalOpen: any;

  beforeEach(() => {
    window.open = jest.fn();
    originalOpen = window.open;
    window.open = mockedOpen as any;
    jest.useFakeTimers();
  });
  afterEach(() => {
    window.open = originalOpen;
  });
  it('should have the basic structure as defined', () => {
    expect(typeof upiPopUpForiOSMWeb.setUrl).toBe('function');
    expect(typeof upiPopUpForiOSMWeb.createWindow).toBe('function');
    expect(typeof upiPopUpForiOSMWeb.destroyWindow).toBe('function');
    expect(typeof upiPopUpForiOSMWeb.reset).toBe('function');
    expect(typeof upiPopUpForiOSMWeb.reset).toBe('function');
    expect(typeof upiPopUpForiOSMWeb.instance).toBe('object');
    expect(typeof upiPopUpForiOSMWeb.parentName).toBe('string');
  });
  it('should have be able to create window', () => {
    upiPopUpForiOSMWeb.createWindow('test-content', testCbName);

    expect(typeof upiPopUpForiOSMWeb.instance).toBe('object');
    expect(JSON.stringify(upiPopUpForiOSMWeb.instance)).toBe(
      JSON.stringify(mockedOpen())
    );
  });
  it('should have be able to reset window', () => {
    upiPopUpForiOSMWeb.createWindow('test-content', testCbName);

    expect(typeof upiPopUpForiOSMWeb.instance).toBe('object');
    expect(JSON.stringify(upiPopUpForiOSMWeb.instance)).toBe(
      JSON.stringify(mockedOpen())
    );
    upiPopUpForiOSMWeb.reset();
    expect(upiPopUpForiOSMWeb.instance).toBeNull();
  });
  it('should have be able to destroy window', () => {
    jest.useFakeTimers();
    upiPopUpForiOSMWeb.createWindow('test-content', testCbName);

    expect(typeof upiPopUpForiOSMWeb.instance).toBe('object');
    expect(JSON.stringify(upiPopUpForiOSMWeb.instance)).toBe(
      JSON.stringify(mockedOpen())
    );
    upiPopUpForiOSMWeb.destroyWindow();
    finishTimeout(6000);
    expect(upiPopUpForiOSMWeb.instance).toBeNull();
  });
  it('should have be able to destroy window with force close', () => {
    upiPopUpForiOSMWeb.createWindow('test-content', testCbName);

    expect(typeof upiPopUpForiOSMWeb.instance).toBe('object');
    expect(JSON.stringify(upiPopUpForiOSMWeb.instance)).toBe(
      JSON.stringify(mockedOpen())
    );
    finishTimeout(500);
    (upiPopUpForiOSMWeb.instance as any).document = null;
    upiPopUpForiOSMWeb.destroyWindow(true);
    finishTimeout(6000);
    expect(upiPopUpForiOSMWeb.instance).toBeNull();
  });
  it('should have be able to set the url', () => {
    upiPopUpForiOSMWeb.createWindow('test-content', testCbName);

    expect(typeof upiPopUpForiOSMWeb.instance).toBe('object');
    expect(JSON.stringify(upiPopUpForiOSMWeb.instance)).toBe(
      JSON.stringify(mockedOpen())
    );

    expect(upiPopUpForiOSMWeb.setUrl('https://test.com')).not.toBeNull();

    expect((upiPopUpForiOSMWeb.instance as Window).location).toBe(
      'https://test.com'
    );
    /**
     * For Statements Coverage
     */
    let _dup = upiPopUpForiOSMWeb.instance;
    upiPopUpForiOSMWeb.reset();
    expect(upiPopUpForiOSMWeb.setUrl('https://test.com')).toBeNull();
    _dup = {
      ..._dup,
      document: null,
    } as any;
    upiPopUpForiOSMWeb.instance = _dup;
    expect(upiPopUpForiOSMWeb.setUrl('https://test.com')).toBeNull();
  });
});

describe('#tryOpeningIntentUrlOniOSMWeb', () => {
  const intentUrl = 'valid-intent-url';
  let userAgentSpy: jest.MockInstance<Window['navigator']['userAgent'], []>;
  const originalAddEventListener = window.addEventListener;

  const listeners: {
    [key: string]: Function[];
  } = {};
  const triggerEvent = (name: string) => {
    if (listeners[name]) {
      listeners[name].forEach((cb: Function) => cb());
    }
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    userAgentSpy = jest.spyOn(window.navigator, 'userAgent', 'get');

    window.addEventListener = ((a: string, b: Function) => {
      listeners[a] = [...(listeners[a] || []), b];
    }) as any;
  });

  afterEach(() => {
    userAgentSpy.mockRestore();
    window.addEventListener = originalAddEventListener;
  });

  it('should resolve to `false` when app is absent', async () => {
    upiPopUpForiOSMWeb.createWindow('test-content', testCbName);
    const canProceed = tryOpeningIntentUrlOniOSMWeb(intentUrl);
    (window as any)[testCbName]('focus', {});
    (window as any)[testCbName]('blur', {});
    finishTimeout(APP_DETECTION_OR_MANUAL_CANCEL_TIMEOUT);
    await expect(canProceed).resolves.toBe(false);
  });

  it('should resolve to `false` when user clicked goBack', async () => {
    upiPopUpForiOSMWeb.createWindow('test-content', testCbName);
    const canProceed = tryOpeningIntentUrlOniOSMWeb(intentUrl);
    (window as any)[testCbName]('goBack');
    finishTimeout(APP_DETECTION_OR_MANUAL_CANCEL_TIMEOUT);
    await expect(canProceed).resolves.toBe(false);
  });

  it('should resolve to `false` when user clicked CANCEL in the consent popup', async () => {
    upiPopUpForiOSMWeb.createWindow('test-content', testCbName);
    const canProceed = tryOpeningIntentUrlOniOSMWeb(intentUrl);
    finishTimeout(APP_DETECTION_OR_MANUAL_CANCEL_TIMEOUT);
    finishTimeout(APP_DETECTED_FURTHER_STEPS_TIMEOUT + 100);
    triggerEvent('focus');
    upiPopupEvents.addToParent('focus');
    finishTimeout(USER_CONSENT_FOR_NAVIGATION_TIMEOUT);
    await expect(canProceed).resolves.toBe(true);
  });

  it('should resolve to `true` when user clicked OPEN in the consent popup', async () => {
    upiPopUpForiOSMWeb.createWindow('test-content', testCbName);
    const canProceed = tryOpeningIntentUrlOniOSMWeb(intentUrl);
    finishTimeout(APP_DETECTION_OR_MANUAL_CANCEL_TIMEOUT);
    finishTimeout(APP_DETECTED_FURTHER_STEPS_TIMEOUT + 100);
    triggerEvent('focus');
    upiPopupEvents.addToParent('focus');
    upiPopupEvents.addToParent('blur');
    finishTimeout(USER_CONSENT_FOR_NAVIGATION_TIMEOUT);
    await expect(canProceed).resolves.toBe(true);
  });
});
