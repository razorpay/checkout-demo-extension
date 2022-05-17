import { writable, get } from 'svelte/store';
import { checkoutClosesAt } from 'checkoutframe/timer';
export const readableTimeLeft = writable<string>('');

type onExpireType = (() => void) | undefined;
type onChangeType = ((readableTimeLeft: string) => void) | undefined;

/**
 * The idea behind the below timer class is
 * To have persistent timer, i.e, irrespective screen/component switches the timer should run
 * And with svelte timers, we need write multiple derived stores to support onClear, onExpire,
 * Hence its native JS approach with single store usage.
 */
class Timer {
  public readableTimeLeft: string = '';
  private timeoutAt: number = 0;
  private interval: ReturnType<typeof setInterval> | undefined;
  private onExpire: onExpireType;
  private onChange: onChangeType;

  private updateTimeLeft(milliseconds: number) {
    const seconds = Math.round(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    /**
     * Pad seconds and prepare MM:SS
     */
    this.readableTimeLeft = `${minutes}:${('0' + (seconds % 60)).slice(-2)}`;
    if (this.onChange) {
      this.onChange(this.readableTimeLeft);
    }
  }

  public getReadableTimeLeft(): string {
    return this.readableTimeLeft;
  }
  public clearTimer() {
    clearInterval(this.interval as any);
    this.timeoutAt = 0;
    this.readableTimeLeft = '';
    if (this.onChange) {
      this.onChange(this.readableTimeLeft);
    }
    this.onExpire = undefined;
    this.interval = undefined;
  }
  private updateTimer() {
    const milliSecondsLeft = this.timeoutAt - Date.now();
    if (milliSecondsLeft < 1) {
      if (this.onExpire) {
        this.onExpire();
      }
      this.clearTimer();
    }
    this.updateTimeLeft(milliSecondsLeft);
  }
  constructor(forTime: number, onExpire: onExpireType, onChange: onChangeType) {
    this.timeoutAt = Date.now() + Number(forTime);
    this.onExpire = onExpire;
    this.interval = setInterval(this.updateTimer.bind(this), 1000);
    this.onChange = onChange;
    /**
     * call manually first time as to update the initiated time
     */
    this.updateTimer();
  }
}

let timer: Timer | undefined;

/**
 *
 * @returns {string} readable time left
 */
export const getReadableTimeLeft = () => {
  if (timer instanceof Timer) {
    return timer.getReadableTimeLeft();
  }
  return '';
};

/**
 * Clears the persistent timer running if any
 * @returns null
 */
export const clearTimer = () => {
  if (timer instanceof Timer) {
    timer.clearTimer();
    timer = undefined;
  }
  return;
};

/**
 * Starts a persistent timer with onExpire subscription
 * @param {number} timeLimit ms after when to expire. Ex: 5min=> 5*60*1000
 * @param {Function} onExpire Function to call after expiry
 */
export const startTimer = (
  timeLimit: number,
  onExpire: onExpireType,
  overrideByCheckoutTimer?: boolean
) => {
  clearTimer();
  const dismissTime = get(checkoutClosesAt);

  timer = new Timer(
    overrideByCheckoutTimer && dismissTime
      ? dismissTime - Date.now()
      : timeLimit,
    onExpire,
    (time: string) => readableTimeLeft.set(time)
  );
};
