import Interface from 'common/interface';
import * as Meta from 'common/meta';
import * as constants from 'common/constants';

describe('common/meta', () => {
  test('setMetaInFrame without iframe', function () {
    const sendMessage = (Interface.sendMessage = jest.fn());
    Object.defineProperty(constants, 'isIframe', { value: false });
    Meta.setMetaInFrame('1', '2');
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith('setMeta', {
      key: '1',
      value: '2',
    });
  });

  test('setMetaInFrame with iframe', function () {
    const sendMessage = (Interface.sendMessage = jest.fn());
    Object.defineProperty(constants, 'isIframe', { value: true });
    Meta.setMetaInFrame('1', '2');
    expect(sendMessage).toHaveBeenCalledTimes(0);
  });

  test('syncAvailability without isIframe', function () {
    const sendMessage = (Interface.sendMessage = jest.fn());
    const publishToParent = (Interface.publishToParent = jest.fn());
    Object.defineProperty(constants, 'isIframe', { value: false });
    Meta.syncAvailability(true, false);
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(publishToParent).toBeCalledTimes(0);
    expect(sendMessage).toHaveBeenCalledWith('syncAvailability', {
      sessionCreated: true,
      sessionErrored: false,
    });
  });

  test('syncAvailability with isIframe', function () {
    const sendMessage = (Interface.sendMessage = jest.fn());
    const publishToParent = (Interface.publishToParent = jest.fn());
    Object.defineProperty(constants, 'isIframe', { value: true });
    Meta.syncAvailability(true, false);
    expect(publishToParent).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledTimes(0);
    expect(publishToParent).toHaveBeenCalledWith('syncAvailability', {
      sessionCreated: true,
      sessionErrored: false,
    });
  });
});
