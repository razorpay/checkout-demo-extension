import { get } from 'svelte/store';
import { timer, qrUrl } from '../qr';

describe('TIMER', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('TIMER SHOULD DECREASE ONCE qrURL IS SET', () => {
    const seconds = (sec) => sec * 1000;
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    timer.set(10);

    expect(get(timer)).toEqual(10);
    jest.advanceTimersByTime(seconds(1));
    // timer should not changed because qr url is not set
    expect(get(timer)).toEqual(10);

    qrUrl.set('dummyUrl');

    // advance by 1 second
    jest.advanceTimersByTime(seconds(1));
    expect(get(timer)).toEqual(9);

    // advance by 1 second
    jest.advanceTimersByTime(seconds(1));
    expect(get(timer)).toEqual(8);

    // advance by 8 seconds, timer should finish
    jest.advanceTimersByTime(seconds(8));
    expect(get(timer)).toEqual(0);

    expect(clearIntervalSpy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(seconds(1));

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    expect(clearIntervalSpy).toHaveBeenCalledWith(expect.anything(Number));
  });
});
