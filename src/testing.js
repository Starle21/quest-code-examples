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

// Component - description of state result
// fiber - memoized object, created on parent render
// holds state, props, function, type
// rendering fiber - calling function - global currentFiber points to current WIP

// <type of element, props, children>
// div example
//  element <div className='foo'>Hello</div>
//  React.createElement/jsx('div',{className: 'foo'},"Hello")
// element description = effect:
//  {type: 'div', props:{className:'foo', children:"Hello"}}

// App example
//  element <App/>
//  React.createElement('f App()', {})
// element description = effect:
//  {type: f App(), props: {}}

// React.render is called
// element description - effect is passed into render fce as argument
// (task is scheduled - put into queue)
// (task is run - taken from queue)
// (start processing whole tree from root)
// (run user defined effects)
// (when you start for the first time, create second tree - create another root - another fiber for host element where fiber tree resides - for div #root defined in html)
// (make that fiber for div #root the workInProgress fiber)
// (start work loop with that wip)
// (check props passed to wip fiber - they are null bcs it's the top div #root)
// (reconcile children - wip fiber (div#root), current child (null), new child effect (the App element/effect))
// new fiber for App created:
const AppFiber = {
  type: "functionalComponent",
  functionToCall: Component,
  state: [],
  parent: "parentFiberNode",
  alternateFiberOnCurrentTree: null,
  child: "not yet resolved",
};
// -
// wip moved to AppFiber
// check props passed to the AppFiber if there is current fiber (there is not)
// renderWithHooks
// call App functional component App(), from AppFiber
var children = Component(props, context);
// calls hooks if there are any - useState fce imported through ReactCurrentDispatcher
// component's fiber accessible through ReactCurrentOwner.current in component's scope
// memoized state on fiber updated
// reconcile children - unwrap jsx, create effects, create fibers for the first one
// -
// recurse

// 1. create element effect
// 2. create fiber for the effect
// 3. process that fiber - call its function (for functional component) or create host element (for host fiber)

// --------x------
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
