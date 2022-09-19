function* getId() {
  let count = 1;
  while (true) {
    yield count++;
  }
}

class ProcessQueue {
  MAX_CONCURRENT_PROCESS = 5;
  #CURRENT_PROCESSES = [];
  #WAIT_QUEUE = [];
  #onEmpty = null;
  #getId;

  constructor() {
    this.#getId = getId();
  }

  #getUniqueId() {
    return this.#getId.next().value;
  }

  then(cb) {
    this.#onEmpty = cb;
  }

  push(handler) {
    if (typeof handler !== 'function') {
      throw new Error('item pushed is not a function');
    }

    // Prioritze and process the function already in wait queue
    //  and put the new function in wait queue to make it FIFO
    if (
      this.#CURRENT_PROCESSES.length < this.MAX_CONCURRENT_PROCESS &&
      this.#WAIT_QUEUE.length !== 0
    ) {
      this.#WAIT_QUEUE.push(handler);
      handler = this.#WAIT_QUEUE.shift();
    }

    if (this.#CURRENT_PROCESSES.length < this.MAX_CONCURRENT_PROCESS) {
      const id = this.#getUniqueId();
      const promise = new Promise(async (resolve) => {
        await handler();
        resolve();
      });

      promise.finally(() => {
        this.#removeFromProcessQueue(id);
        this.#processNext();
        if (!this.#CURRENT_PROCESSES.length) {
          this.#onEmpty?.();
        }
      });

      this.#CURRENT_PROCESSES.push({ id, promise });
    } else {
      this.#WAIT_QUEUE.push(handler);
    }
  }

  #removeFromProcessQueue(id) {
    this.#CURRENT_PROCESSES = this.#CURRENT_PROCESSES.filter(
      (item) => item.id !== id
    );
  }

  #processNext() {
    if (
      this.#CURRENT_PROCESSES.length < this.MAX_CONCURRENT_PROCESS &&
      this.#WAIT_QUEUE.length !== 0
    ) {
      this.push(this.#WAIT_QUEUE.shift());
    }
  }
}

export default new ProcessQueue();
