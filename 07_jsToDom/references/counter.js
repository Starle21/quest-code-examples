class Counter {
  _value = 0;
  listeners = [];
  /** Make a counter initially set to zero. */
  constructor() {}

  /** @returns the value of this counter. */
  get value() {
    return this._value;
  }

  /** Increment this counter. */
  increment() {
    ++this._value;
    this.callListeners();
  }

  /** Modifies this counter by adding a listener.
   * @param listener called by this counter when it changes. */
  addEventListener(listener) {
    this.listeners.push(listener);
  }

  /** Modifies this counter by removing a listener.
   * @param listener will no longer be called by this counter. */
  removeEventListener(listener) {
    // search backwards through the array,
    // so we can remove all matches to `listeners`
    // without having to adjust the index
    for (let i = this.listeners.length - 1; i >= 0; --i) {
      if (this.listeners[i] === listener) {
        this.listeners.splice(i, 1);
      }
    }
  }

  callListeners() {
    for (const listener of [...this.listeners]) {
      listener(this._value);
    }
  }
}

/**
 * Example client code, trying out a Counter with a couple listeners.
 */
function main() {
  const counter = new Counter();

  counter.addEventListener((value) => console.log("listening on", value));

  function oneShotListener(value) {
    console.log("one shot", value);
    counter.removeEventListener(oneShotListener);
  }
  counter.addEventListener(oneShotListener);

  // listen for multiples of 113
  counter.addEventListener((value) => {
    if (value % 3 === 0) {
      console.log(value, "is a multiple of 3");
    }
  });

  // listen for 50, then exit the process
  counter.addEventListener((value) => {
    if (value === 50) {
      console.log(value, "exiting process");
      process.exit(0);
    }
  });

  // crank the counter
  while (true) {
    counter.increment();
  }
}

if (require.main === module) {
  main();
}
