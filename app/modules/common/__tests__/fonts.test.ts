import { loadInterFont } from 'common/fonts';
import { isCssLoaded, loadCSS } from 'utils/doc';
import { Events } from 'analytics';

jest.mock('analytics', () => {
  const originalModule = jest.requireActual('analytics');

  return {
    ...originalModule,
    __esModule: true,
    Events: {
      TrackMetric: jest.fn(),
    },
  };
});

jest.mock('utils/doc', () => {
  const originalModule = jest.requireActual('utils/doc');
  return {
    __esModule: true,
    ...originalModule,
    isCssLoaded: jest.fn(() => false),
    loadCSS: jest.fn(() => Promise.reject('Problem Occured')),
  };
});

describe('loadCSS', () => {
  test('should check the append Loader without parent', async () => {
    loadInterFont();
    expect(isCssLoaded).toBeCalledTimes(1);
    await expect(loadCSS).toBeCalledTimes(1);
    await expect(Events.TrackMetric).toBeCalled();
  });
});
