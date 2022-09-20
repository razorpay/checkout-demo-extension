import type { QueueOptions } from './types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp: () => void = () => {};

export default function createQueue<K>(
  handler: (events: K[], queue: K[]) => void,
  opts?: QueueOptions<K>
) {
  // queue options
  opts = opts || {};

  // interval timer
  let timer: any;

  // last element pushed to queue
  let tmp: number;

  // if timer is running or not
  let running: boolean;

  const queue = opts.initial || [];

  // max batch size
  const max = opts.max || Infinity;

  // interval time gap
  const int = opts.interval || 1000;

  // callback when queue gets empty
  const onEmpty = opts.onEmpty || noOp;

  // callback when queue gets paused
  const onPause = opts.onPause || noOp;

  function batch(all?: boolean): void {
    clearInterval(timer);
    const removed = queue.splice(0, max);
    if (removed.length) {
      handler(removed, queue);
    }
    /* If queue backlog has no items */
    if (!queue.length) {
      running = false;
      // return onEnd(queue, 'end')
      return onEmpty();
    }

    if (all) {
      // if all items have to be flushed, recursively
      return batch();
    }
    return ticker();
  }

  function ticker() {
    running = true;
    timer = setInterval(batch, int);
  }

  // Start queue if items
  if (queue.length) {
    ticker();
  }

  return {
    flush: function (flushAll = false) {
      batch(flushAll);
    },
    resume: batch,
    push: function (val: K) {
      tmp = queue.push(val);
      /* Clear if overflow */
      if (!running) {
        ticker();
      }
      return tmp;
    },
    size: function () {
      return queue.length;
    },
    pause: function (toFlush = false) {
      if (toFlush) {
        batch();
      }
      clearInterval(timer);
      running = false;
      onPause(queue);
    },
  };
}
