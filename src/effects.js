// effect - description of work, individual sync? operation
// description of a work to do (series of sequential steps, computation, program) that is lazy and immutable(source scripts are not mutated at runtime)
// fiber - running instance of an effect
// effect yields to runtime
// that keeps execution trace of calling effects
// while it executes them

// fibers - can be paused, restarted, awaited to get their result, or interrupted to cancel them
// in fiber, everything is sync to the fiber - fiber only runs when it has values, there is no async

// effect - deferred function, lambda, value, run at later time
// fetch(url) => () => Promise
// () => Promise
// () => Generator
// () => void

// what do you want to produce at the end? - value ? or effect (aka creating dom node with imperative calls) (for retained in-memory model)?
//     or call imperative API directly (gather lambdas, or values)?
// describe stateless function with data dependencies (describe state at a point in time), how it should be, but do not run it
// have a runtime that keeps the shape of execution trace with all the function's inputs and output values in memory
// do not run it, because first let the runtime compare it with the memoized previous inputs
// to see if what is the change and which calls it should do based off of that comparison
// then when it gathers all the changes, it finally runs them

// do not have to write create / update / delete for an dom node / object
// element - deffered function call
// component - memoized function, contains imperative code plus elements
// components/functions are hierarchically nested (as typical functions which call other functions)
// runtime calls these functions / components
// runtime keeps the tree / execution trace of calling those functions with their arguments and their shape in memory
// it always evaluates from the top
// when new data are put in at the top, it runs it again, the shape of the tree / execution trace might be different

// step 0
// instead of create/update/delete, have only create/delete using a generator or promise?
// step 1
// description of state in a function, or description of work to be done (lambdas) (effect)
// one function - that I will describe and hand over to the runtime
// the runtime runs it and saves it
// when I run the function second time - compare arguments - if the fce needs to be run (when different args), or just return its memoized value (when same args)
// gather all the changes - join memoized values or run the functions that have different args
// step 2
// now when another function is nested inside the first function...

// ------------
// make own native component
// connect component with imperative code
// let react reconcile it

// ---------------
// live has only functional components which have hooks
// hooks are the escape hatches for imperative code
// functional component then yields lambdas back
// to be gather by higher up component and called as regular program

// incremental - memoize function, rerun only again if inputs changed
// reactive - memoize deep trees recursively

//--------------------------
class Thing {
  constructor() {
    // on enter on
  }
  onUpdate() {
    // exit old state
    // enter new state
  }
  dispose() {
    // exit state
  }
}

// slicing code differently
// so there's only
// enter state
// exit state

// effect like react component
let effect1 = function* () {
  // Enter state - on
  yield; // Wait
  // Exit state - off
};

let effect2 = function* () {
  // Enter state - on
  yield; // Wait
  // Exit state - off
};

let effect = () => {
  // Enter state - on
  return {
    // I'm not done yet
    done: false,
    // I don't have a value to return
    value: undefined,
    // Call me 🤙
    next: () => {
      // Exit state - off
      return { done: true, value: undefined };
    },
  };
};

// This creates an effect that describes the lifecycle of a Thing of size
let makeThingEffect = (size) =>
  function* () {
    // Make thing
    thing = new Thing(size);

    yield thing;

    // Dispose thing
    thing.dispose();
  };

let makeAnEffect = (nextEffect) =>
  function* (input, error) {
    if (!error) {
      output = f(input);
      return [nextEffect, output];
    } else return [null, null, error];
  };

let combinedEffect = makeAnEffect(makeAnEffect(makeAnEffect()));

//  retry combinator. If an error happens, it returns another copy of itself,
//  but with the retry count reduced by 1, until it reaches 0:
//  This is 1 function in 1 place you can use anywhere.
let attemptRetry = (effect, n) =>
  function* (i, e) {
    // Make request
    const [value, error] = yield [effect, i, e];
    // Success
    if (value) return [null, value];
    // Retry n times
    if (n > 0) return attemptRetry(effect, n - 1);
    // Abort
    return [null, null, error];
  };

//-----------------------
//-----------------------
// reconcile all the things
// https://acko.net/blog/reconcile-all-the-things/

let memo = (func) => {
  let input = undefined;
  let output = undefined;
  return (x) => {
    // Return same output for same input
    if (x === input) return output;

    // Store new output for new input
    input = x;
    output = func(x);

    return output;
  };
};

let slow = memo((x) => {
  /*...*/
});

// ---

let memo = (func) => {
  let cache = new WeakMap();
  return (x) => {
    // Return same output for cached input
    let output = cache.get(x);
    if (output !== undefined) return output;

    // Store new output for new input
    output = func(x);
    cache.set(x, output);

    return output;
  };
};

let slow = memo((x) => {
  /*...*/
});

// ----------------------
// declared computations
// with input dependencies
// and cached results
// = data flow graph (DFG)
// sriptable nodes which contain non-reactive, non-pure, non-observable code
// that produce either values as output
// or produce new nodes on the fly, returning new piece of DFG
// which means DFG's topology can change freely in response to the data that is flowing through it

// This would have all sorts of implications for maintaining the integrity of data flow.
// For example, you wouldn't be able to pull data from the bottom of a graph at all if some data
// at the top changed: you don't even know for sure what the eventual shape will be until you start re-evaluating it in the middle.

// saving execution trace after calling nested functions

let main = (x) => {
  A(x);
};

let A = (x) => {
  B(x);
  D(1);
};

let B = (x) => {
  let foo = x ? 3 : 2;
  if (x) B(false);
  C();
  if (x) D(0);
  D(foo);
};

let C = () => {};
let D = (x) => {};

// We need to introduce the operation of reconciliation: rather than doing work, functions like B must return some kind of data structure that describes the work to be done. Sort of like an effect. Then we can reconcile it with what it returned previously, and map 1-to-1 the calls that are identical. Then we can run it, while reusing cached results that are still valid.

// Granted, there is a huge constraint here, which the mock scenario obfuscates.
// Memoizing the calls only makes sense if they return values
// But if we passed any returned value into another call, this would introduce a data dependency.

// That is, in order to reconcile the following:
let F = (x) => {
  let foo = C(x);
  D(foo);
  if (foo) E();
};

// We would need to somehow yield in the middle:
let F = function* (x) {
  let foo = C(x);
  yield;
  D(foo);
  if (foo) E();
};

let F = function* (x) {
  foo = yield call(C)(x);
  yield [call(D)(foo), foo ? call(E)() : null];
};

// we could recognize that C(x) is called first and unconditionally
// It doesn't actually need to be reconciled,  its presence is always guaranteed if F is called
// Let's call such a function a hook.
// If hooks like C(x) aren't reconciled, they're regular function calls, so is all the code inside
//  Like a scriptable node in a DFG, it's an escape hatch inside the run-time.
let F = (x) => {
  let foo = C(x);
  return defer([call(D)(foo), foo ? call(E)() : null]);
};

// But we're also still missing something: actual memoization.
// While we have the necessary information to reconcile calls across two different executions,
// we still don't have anywhere to store the memoized state.
// So we'll need to reserve some state when we first call F
// We'll put all the state inside something called a fiber
// We can pass it in as a bound argument to F
// We also pass the fiber to hooks like C
// this provides the perfect place for C to store a memoized value and its dependencies.
// If we run the program a second time and call this exact same F again, in the same place, it will receive the same fiber as before.
// As long as the execution flow remains the same between two runs, the fiber and the memoized values inside will remain
// Because functions like C are likely to receive exactly the same argument next time, memoization works very well here.
let F = (fiber) => (x) => {
  let foo = C(fiber)(x);
  return defer([call(D)(foo), foo ? call(E)() : null]);
};

// React Component is merely a function (fiber) => (props) => DeferredCall
const Component: React.FC<Props> = (props) => {
  const { foo, bar } = props;

  // These are hooks, which can only be called unconditionally
  const [state, setState] = useState("hello world");
  const memoized = useMemo(() => slow(foo), [foo]);

  // And there's also something called useEffect
  useEffect(() => {
    doThing(foo);
    return () => undoThing(foo);
  }, [foo]);

  // Regular JS code goes here
  // ...

  // This schedules a call to D({foo}) and E()
  // They are mounted in the tree inside <Component> recursively
  return (
    <>
      <D foo={foo} />
      {foo ? <E /> : null}
    </>
  );
};

// You can't just call an imperative API directly in a React component
// because the idea of React is to enable minimal updates
// There is no guarantee every component that uses your imperative API will actually be re-run as part of an update.
// So you still need a light-weight reconciler

// expanding a tree downstream to produce nodes in a resumable way
// and yielding values back upstream in order to aggregate them.

// yeet - reduce
// This is remarkable to me because it shows you how you can wrap, componentize and memoize a completely foreign,
// non-reactive API, while making it sing and dance. You don't actually have to wrap and mount a
// <WebGPUThingComponent> for every WebGPUThing that exists, which is the popular thing to do.
// You don't need to do O(N) work to control the behavior of N foreign concepts.
// You just wrap the things that make your code more readable.
// The main thing something like React provides is a universal power tool for turning things off and on again:
// expansion, memoization and reconciliation of effects. Now you no longer need to import React and pretend to be playing DOM-jot either.
