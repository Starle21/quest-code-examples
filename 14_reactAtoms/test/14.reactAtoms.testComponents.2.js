import { useState } from "../14.reactAtoms.12";

// TEST APP 4 PASS IN FUNCTIONAL COMPONENT AS A PROP - after changing object definitions

// functional components - scriptable node that can modify execution tree
export const jsxTop = () => {
  return {
    type: "component",
    domType: null,
    props: {},
    function: Top,
  };
};

const Top = () => {
  const [state, setState] = useState(0);
  return jsxDiv({
    onClick: null,
    children: [
      jsxParent({ text: "clicked", children: jsxBefore({}) }),
      jsxButton({
        onClick: () => setState((prev) => prev + 1),
        children: jsxText({ nodeValue: `top state: ${state}` }),
      }),
    ],
  });
};

const jsxBefore = ({}) => {
  return {
    type: "component",
    domType: null,
    props: {},
    function: Before,
  };
};

const Before = () => {
  return jsxDiv({
    onClick: null,
    children: jsxText({ nodeValue: "before" }),
  });
};

const jsxParent = ({ text, children }) => {
  return {
    type: "component",
    domType: null,
    props: { text, children },
    function: () => Parent({ text, children }),
  };
};

const Parent = ({ text, children }) => {
  const [state, setState] = useState(5);
  const [test, setTest] = useState("blb");
  return jsxDiv({
    onClick: null,
    children: [
      children,
      jsxButton({
        onClick: () => setState((prev) => prev + 1),
        children: jsxText({ nodeValue: `${text} ${state}` }),
      }),
      jsxDiv({
        onClick: () => setTest((prev) => `${prev}b`),
        children: jsxText({ nodeValue: test }),
      }),
      jsxRerenders({}),
    ],
  });
};

const jsxRerenders = ({}) => {
  return {
    type: "component",
    domType: null,
    props: {},
    function: Rerenders,
  };
};

const Rerenders = () => {
  return jsxDiv({
    onClick: null,
    children: jsxText({ nodeValue: "rerenders" }),
  });
};

// host components
const jsxButton = ({ onClick, children }) => {
  return {
    type: "htmlNode",
    domType: "button",
    props: { onClick, children },
  };
};

const jsxDiv = ({ onClick, children }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: { onClick, children },
  };
};

const jsxText = ({ nodeValue }) => {
  return {
    type: "textNode",
    domType: "text",
    props: { nodeValue, children: null },
  };
};

// -----------------
// TEST APP 5
export const jsxAppTest = ({ num }) => {
  return {
    type: "component",
    domType: null,
    props: { num },
    function: () => AppTest({ num }),
  };
};

const AppTest = ({ num }) => {
  const [on, setOn] = useState(true);
  return jsxDivWithNum({
    num,
    children: [
      jsxButtonWithOn({
        turnedOn: on,
        onClick: () => {
          setOn((on) => !on);
        },
        children: jsxText({ nodeValue: `Toggle ${on ? "off" : "on"}` }),
      }),
      jsxTestComp({ test: "testComp", on }),
      on
        ? jsxDivWithNum({
            num: 3,
            children: jsxH1WithNum({
              num: 4,
              className: "whatever",
              children: jsxText({ nodeValue: "On!" }),
            }),
          })
        : null,
      on
        ? jsxDivWithNum({
            num: 5,
            children: jsxText({ nodeValue: `Ahoj` }),
          })
        : null,
    ],
  });
};

const jsxTestComp = ({ test, on }) => {
  return {
    type: "component",
    domType: null,
    props: { test, on },
    function: () => TestComp({ test, on }),
  };
};

const TestComp = ({ test, on }) => {
  return jsxDivWithNum({
    num: test,
    children: jsxText({
      nodeValue: on ? "It's on, rise and shine!" : "It's off, go to sleep!",
    }),
  });
};

// host components
const jsxDivWithNum = ({ num, children }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: { className: num, children },
  };
};

const jsxButtonWithOn = ({ turnedOn, onClick, children }) => {
  return {
    type: "htmlNode",
    domType: "button",
    props: { turnedOn, onClick, children },
  };
};

const jsxH1WithNum = ({ className, num, children }) => {
  return {
    type: "htmlNode",
    domType: "h1",
    props: {
      className,
      value: num,
      children,
    },
  };
};
