// const gen = simpleGenerator();

// function* simpleGenerator() {
//   yield "First yield";
//   yield "Second yield";
//   return "Generator done";
// }

// console.log(gen.next());
// console.log(gen.next());
// console.log(gen.next());
// console.log(gen.next());

// ---------------
let domStartLabel = undefined;
domStartLabel = createLabel("start point:");

function createLabel(textContent) {
  const domLabel = document.createElement("label");
  domLabel.textContent = textContent;
  return domLabel;
}

// let makeThingEffect = (size) =>
//   function* () {
//     // Make thing
//     thing = createLabel(size);

//     yield thing;

//     // Dispose thing
//     thing.remove();
//     return "finished";
//   };
// const generatorThing = makeThingEffect(10);
// const generated = generatorThing();
// // const label = generated.next();
// // console.log(label.value());
// console.log(generated);
// const label = generated.next();
// console.log(label.value);
// console.log(generated.next());
// console.log(generated.next());
// ---------------

let memo = (func) => {
  let input = undefined;
  let output = undefined;
  return (x) => {
    // Return same output for same input
    if (x === input) {
      console.log("same args");
      console.log("memoized: ", input);
      console.log("current: ", x);
      console.log("output: ", output);
      return output;
    }
    console.log("different args");
    console.log("memoized: ", input);
    console.log("current: ", x);

    // Store new output for new input
    input = x;
    output = func(x);
    console.log("output: ", output);

    return output;
  };
};

let slow = memo((x) => {
  return x * x;
});
// slow(5);
// slow(5);
// slow(7);
// slow(5);

// ---

memo = (func) => {
  let cache = new WeakMap();
  return (x) => {
    // Return same output for cached input
    let output = cache.get(x);
    if (output !== undefined) {
      console.log("has been memoized");
      console.log(cache);

      return output;
    }
    console.log("not yet memoized");

    // Store new output for new input
    output = func(x);
    cache.set(x, output);

    console.log(cache);
    return output;
  };
};

slow = memo((x) => {
  return x.operand * x.operand;
});
let operand = 5;
let key1 = { operand };
slow(key1);
slow(key1);
// operand = 7;
// let key2 = { operand };
// slow(key2);
// slow(key1);
// value = slow({7});
// value = slow({8});
// value = slow({8});
// key1 = "aabb";
// slow(key2);

// ---
const call = (fce) => {};
let F = function* (x) {
  foo = yield call(C)(x);
  yield [call(D)(foo), foo ? call(E)() : null];
};

let A = F(5);
console.log(A);
let B = A.next();
console.log(B);
