// ------------------------------
// generator - lets function yield - pause execution and return value to the caller
// the state of the function, including local variables and the instruction pointer, is saved, allowing the function to resume from that point when the next value is requested
// Generators don't let you yield in the middle of a stack. You have to wrap every single function in a generator.
// generators are stateful. i can just step through the yields. first and middle computation has been done. then if the middle computation gets and update,
//   however, i have to start from scratch, i cannot reuse the value completed by the first computation
// ------------------------------
// TESTING

// function makeFiber(component) {
//   const yCoord = "20";
//   return () => {
//     component();
//   };
// }

const fiberA = {
  state: "world",
};
// element
{
  /* <div>{props}</div>; */
}
// component
const Component = (fiber) => (props) => {
  return ["div", null, props];
};
// passed from parent
const arg = "hello";

const functionToCall = Component(fiberA);
const description = functionToCall(arg);
console.log(description);

// memoized / running effect - element / component
const fiber = {
  // component type
  type: "functional",
  // component function
  fce: functionToCall,
  // latest arguments
  arguments: [],
  // memoized state
  state: "state",
};

// global variable
// in the render phase of functional component it is assigned with the WIP fiber
// when fiber is currently rendering its function
// the function has its fiber in scope
const fiberTree = [{}, {}, {}];
let currentFiber = null;
const useState = (initialValue) => {
  const fiber = currentFiber;
  fiber.state = initialValue;
  return [state, setState];
};

// --------x------
// CLOSURE
// stateful function with closures - objects?
// global scope variable - can be changed by anyone
// let y = 5;
// function add() {
//   return y++;
// }
// console.log(add());
// console.log(add());
// y = 10;
// console.log(add());

// --------------
// contain variable within closure - I'm only returning expression, not y value - prints 6 all the time
// function getAdd() {
//   let y = 5;
//   return () => {
//     return y + 1;
//   };
// }
// const add = getAdd();
// console.log(add());
// console.log(add());
// y = 10;
// console.log(add());

// --------------
// contain variable within closure, returning y
// y can't be accesed from outside
// function getAdd() {
//   let y = 5;
//   return () => {
//     return (y = y + 1);
//   };
// }
// const add = getAdd();
// console.log(add());
// console.log(add());
// y = 10;
// console.log(add());
