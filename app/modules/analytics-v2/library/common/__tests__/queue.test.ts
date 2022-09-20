import createQueue from '../queue';
import type { QueueType } from '../types';

const noOp = () => {};

function addItems(queue: QueueType<number>, length = 20) {
  Array.from(new Array(length)).forEach((item, index) => {
    queue.push(index + 1);
  });
}

jest.useFakeTimers();

describe('Queue', () => {
  test('should export below APIs', () => {
    const queue = createQueue(noOp);
    expect(typeof createQueue).toEqual('function');

    expect(typeof queue).toEqual('object');
    expect(typeof queue.flush).toEqual('function');
    expect(typeof queue.resume).toEqual('function');
    expect(typeof queue.push).toEqual('function');
    expect(typeof queue.size).toEqual('function');
    expect(typeof queue.pause).toEqual('function');
  });

  describe('queue.size', () => {
    const queue = createQueue(noOp);
    test('should return current size of queue', () => {
      expect(queue.size()).toEqual(0);
      queue.push(1);
      expect(queue.size()).toEqual(1);
    });
  });

  describe('queue.push', () => {
    const queue = createQueue(noOp);
    test('should return size of queue on push', () => {
      let size = queue.push(1);
      expect(size).toEqual(1);
      size = queue.push(2);
      expect(size).toEqual(2);
    });
  });

  describe('options.handler', () => {
    test('should be called when queue flushes event after default interval', async () => {
      const callback = jest.fn();
      const queue = createQueue(callback);
      addItems(queue, 1);
      jest.advanceTimersByTime(1000);

      expect(callback).toBeCalled();
      expect(callback).toBeCalledWith([1], []);
      expect(callback).toBeCalledTimes(1);
    });
  });

  describe('options.interval', () => {
    test('interval=1000: should trigger callback after 1sec', () => {
      const callback = jest.fn();
      const queue = createQueue(callback, { interval: 1000 });
      addItems(queue, 1);
      jest.advanceTimersByTime(1000);

      expect(callback).toBeCalled();
      expect(callback).toBeCalledTimes(1);
    });
  });

  describe('options.max', () => {
    let callback: any;
    beforeEach(() => {
      callback = jest.fn();
    });
    test('queue=4,max=2: should trigger callback twice with batch of 2', () => {
      const queue = createQueue(callback, { max: 2 });
      addItems(queue, 4);

      jest.advanceTimersByTime(1000);
      expect(callback).toBeCalled();
      expect(callback).toBeCalledTimes(1);
      expect(callback).toBeCalledWith([1, 2], [3, 4]);

      jest.advanceTimersByTime(1000);
      expect(callback).toBeCalled();
      expect(callback).toBeCalledTimes(2);
      expect(callback).toBeCalledWith([3, 4], []);
    });

    test('queue=5,max=2: should trigger callback thrice with batch <= 2 ', () => {
      const queue = createQueue(callback, { max: 2 });
      addItems(queue, 5);

      jest.advanceTimersByTime(1000);
      expect(callback).toBeCalled();
      expect(callback).toBeCalledTimes(1);
      expect(callback).toBeCalledWith([1, 2], [3, 4, 5]);

      jest.advanceTimersByTime(1000);
      expect(callback).toBeCalled();
      expect(callback).toBeCalledTimes(2);
      expect(callback).toBeCalledWith([3, 4], [5]);

      jest.advanceTimersByTime(1000);
      expect(callback).toBeCalled();
      expect(callback).toBeCalledTimes(3);
      expect(callback).toBeCalledWith([5], []);
    });

    test('queue=100: should trigger callback once as default max is infinity', () => {
      const queue = createQueue(callback);
      addItems(queue, 100);

      jest.advanceTimersByTime(1000);
      expect(callback).toBeCalled();
      expect(callback).toBeCalledTimes(1);
      expect(callback).toBeCalledWith(
        Array.from(new Array(100)).map((item, index) => index + 1),
        []
      );
    });
  });

  describe('options.initial', () => {
    test('should take initial array and start the queue', () => {
      const callback = jest.fn();
      const queue = createQueue(callback, { initial: [1, 2] });
      jest.advanceTimersByTime(1000);
      expect(callback).toBeCalled();
      expect(callback).toBeCalledWith([1, 2], []);
    });
  });

  describe('options.onEmpty', () => {
    test('should trigger when queue gets empty', () => {
      const callback = jest.fn();
      const queue = createQueue(noOp, { initial: [1, 2], onEmpty: callback });
      jest.advanceTimersByTime(1000);
      expect(callback).toBeCalled();
      expect(callback).toBeCalledTimes(1);
    });
  });

  describe('options.onPause', () => {
    test('should trigger on queue.pause', () => {
      const callback = jest.fn();
      const queue = createQueue(noOp, { initial: [1, 2], onPause: callback });
      queue.pause();
      expect(callback).toBeCalled();
      expect(callback).toBeCalledTimes(1);
      expect(callback).toBeCalledWith([1, 2]);
    });
  });

  describe('queue.flush', () => {
    test('should flush all items inside queue', () => {
      const callback = jest.fn();
      const queue = createQueue(callback, { max: 1 });
      addItems(queue, 2);
      queue.flush(true);
      expect(callback).toBeCalledTimes(2);
      expect(queue.size()).toEqual(0);
    });
  });
});
