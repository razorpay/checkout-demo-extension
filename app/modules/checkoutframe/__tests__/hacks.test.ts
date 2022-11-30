import * as hacks from 'checkoutframe/hacks';
import { hasProp } from 'utils/object';
jest.mock('utils/object', () => ({
  hasProp: jest.fn(() => {}),
}));

const Orientation = {
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait',
};

describe('Module: checkoutframe/hacks', () => {
  it('should return landscape orientation for screen angle 90 deg', () => {
    (hasProp as unknown as jest.Mock).mockReturnValue(true);
    Object.defineProperty(global.screen, 'orientation', {
      value: {
        angle: 90,
      },
      writable: true,
    });
    const orientation = hacks.getDeviceOrientation();
    expect(orientation).toEqual(Orientation.LANDSCAPE);
  });

  it('should return landscape orientation for screen angle 270 deg', () => {
    (hasProp as unknown as jest.Mock).mockReturnValue(true);
    Object.defineProperty(global.screen, 'orientation', {
      value: {
        angle: 270,
      },
      writable: true,
    });
    const orientation = hacks.getDeviceOrientation();
    expect(orientation).toEqual(Orientation.LANDSCAPE);
  });

  it('should return portrait orientation for screen angle 0 deg', () => {
    (hasProp as unknown as jest.Mock).mockReturnValue(true);
    Object.defineProperty(global.screen, 'orientation', {
      value: {
        angle: 0,
      },
      writable: true,
    });
    const orientation = hacks.getDeviceOrientation();
    expect(orientation).toEqual(Orientation.PORTRAIT);
  });

  it('should return portrait orientation for screen angle 180 deg', () => {
    (hasProp as unknown as jest.Mock).mockReturnValue(true);
    Object.defineProperty(global.screen, 'orientation', {
      value: {
        angle: 180,
      },
      writable: true,
    });
    const orientation = hacks.getDeviceOrientation();
    expect(orientation).toEqual(Orientation.PORTRAIT);
  });

  it('should return portrait according to dimensions of screen', () => {
    (hasProp as unknown as jest.Mock).mockReturnValue(false);
    Object.defineProperties(global.screen, {
      orientation: {
        value: {
          angle: undefined,
        },
        writable: true,
      },
      width: {
        value: 300,
        writable: true,
      },
      height: {
        value: 450,
        writable: true,
      },
    });
    const orientation = hacks.getDeviceOrientation();
    expect(orientation).toEqual(Orientation.PORTRAIT);
  });

  it('should return landscape according to dimensions of screen', () => {
    (hasProp as unknown as jest.Mock).mockReturnValue(false);
    Object.defineProperties(global.screen, {
      orientation: {
        value: {
          angle: undefined,
        },
        writable: true,
      },
      width: {
        value: 900,
        writable: true,
      },
      height: {
        value: 450,
        writable: true,
      },
    });
    const orientation = hacks.getDeviceOrientation();
    expect(orientation).toEqual(Orientation.LANDSCAPE);
  });

  it('should return true for device in portrait orientation', () => {
    (hasProp as unknown as jest.Mock).mockReturnValue(true);
    Object.defineProperty(global.screen, 'orientation', {
      value: {
        angle: 0,
      },
      writable: true,
    });
    expect(hacks.isDevicePortrait()).toEqual(true);
  });

  it('should return false for device in portrait orientation', () => {
    (hasProp as unknown as jest.Mock).mockReturnValue(true);
    Object.defineProperty(global.screen, 'orientation', {
      value: {
        angle: 90,
      },
      writable: true,
    });
    expect(hacks.isDevicePortrait()).toEqual(false);
  });

  it('should return true for device in landscape orientation', () => {
    (hasProp as unknown as jest.Mock).mockReturnValue(true);
    Object.defineProperty(global.screen, 'orientation', {
      value: {
        angle: 90,
      },
      writable: true,
    });
    expect(hacks.isDeviceLandscape()).toEqual(true);
  });

  it('should return false for device in landscape orientation', () => {
    (hasProp as unknown as jest.Mock).mockReturnValue(true);
    Object.defineProperty(global.screen, 'orientation', {
      value: {
        angle: 0,
      },
      writable: true,
    });
    expect(hacks.isDeviceLandscape()).toEqual(false);
  });
});
