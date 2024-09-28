// types of wip effects and their properties
// element can single jsx fce
//         or array of jsx functions (but not nested)
//         or function component

// ------------------------------------
// ROOT FIBER, PASSED IN SINGLE JSX
const App = () => {
  return () => jsxContainer();
};
const jsxContainer = () => {
  return {
    domType: "div",
    element: () => {},
    props: null,
    type: "htmlNode",
  };
};
const jsxApp = () => {
  return {
    domType: null,
    function: App,
    props: null,
    type: "component",
  };
};
export const rootFiber = {
  type: "root",
  alternate: null,
  accessor: "div#root",
  props: null,
  element: () => jsxApp(),
};
const resultChild = {
  alternate: null,
  domType: null,
  function: App,
  props: null,
  return: rootFiber,
  sibling: null,
  type: "component",
};
const resultRoot = {
  accessor: "div#root",
  alternate: null,
  child: resultChild,
  element: () => jsxApp(),
  props: null,
  type: "root",
};

// ------------------------------------
// FUNCTIONAL FIBER
export const functionalFiber = {
  alternate: null,
  domType: null,
  function: App,
  props: null,
  return: resultRoot,
  sibling: null,
  type: "component",
};

// jsxContainer Fiber
const resultHost = {
  alternate: null,
  domType: "div",
  element: () => {},
  props: null,
  return: functionalFiber,
  sibling: null,
  type: "htmlNode",
};
const resultFunctionalFiber = {
  alternate: null,
  child: resultHost,
  domType: null,
  function: App,
  props: null,
  return: resultRoot,
  sibling: null,
  type: "component",
};

// ------------------------------------
// HOST FIBER
function jsxFirst() {
  return {
    domType: "h1",
    element: null,
    props: { nodeValue: "first" },
    type: "htmlNode",
  };
}
function jsxSecond() {
  return {
    domType: "h1",
    element: null,
    props: { nodeValue: "second" },
    type: "htmlNode",
  };
}
// fiber for jsxDiv
export const arrayFiber = {
  alternate: null,
  domType: "div",
  element: [() => jsxFirst(), () => jsxSecond()],
  props: null,
  return: resultFunctionalFiber,
  sibling: null,
  type: "htmlNode",
};

const resultSecond = {
  alternate: null,
  domType: "h1",
  element: null,
  props: { nodeValue: "second" },
  return: arrayFiber,
  sibling: null,
  type: "htmlNode",
};

const resultFirst = {
  alternate: null,
  domType: "h1",
  element: null,
  props: { nodeValue: "first" },
  return: arrayFiber,
  sibling: resultSecond,
  type: "htmlNode",
};

const resultArrayFiber = {
  alternate: null,
  child: resultFirst,
  domType: "div",
  element: [() => jsxFirst(), () => jsxSecond()],
  props: null,
  return: resultFunctionalFiber,
  type: "htmlNode",
};

// ------------------------------------
// HOST FIBER ARRAY
