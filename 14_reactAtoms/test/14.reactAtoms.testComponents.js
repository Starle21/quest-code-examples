import { useState } from "../14.reactAtoms.11";

// TEST APP 3 PASS IN FUNCTIONAL COMPONENT AS A PROP - before changing object definitions
export const jsxPassComponent = () => {
  return {
    type: "component",
    domType: null,
    element: null,
    props: {},
    function: Top,
  };
};

const Top = () => {
  const [state, setState] = useState(0);
  return () => jsxContainer({ state, setState });
};

const jsxContainer = ({ state, setState }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: {},
    element: [
      () => jsxParent({ text: "clicked", children: jsxBefore }),
      () => jsxTopButton({ state, setState }),
    ],
  };
};

const jsxParent = ({ text, children }) => {
  return {
    type: "component",
    domType: null,
    element: null,
    props: { text, children },
    function: () => Parent({ text, children }),
  };
};

const Parent = ({ text, children }) => {
  const [state, setState] = useState(5);
  const [test, setTest] = useState("blb");
  return () =>
    jsxSubContainer({ text, test, state, children, setState, setTest });
};

const jsxSubContainer = ({
  test,
  text,
  state,
  children,
  setState,
  setTest,
}) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: {},
    element: [
      children,
      () => jsxBottomButton({ text, state, setState }),
      () => jsxClickableText({ test, setTest }),
      () => jsxRerenders(),
    ],
  };
};

const jsxRerenders = () => {
  return {
    type: "component",
    domType: null,
    element: null,
    props: {},
    function: Rerenders,
  };
};

const Rerenders = () => {
  return () => jsxTextual({ content: "rerenders" });
};

const jsxBefore = () => {
  return {
    type: "component",
    domType: null,
    element: null,
    props: {},
    function: Before,
  };
};

const Before = () => {
  return () => jsxTextual({ content: "before" });
};

const jsxTextual = ({ content }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: {},
    element: () => jsxLeafText({ nodeValue: content }),
  };
};

const jsxLeafText = ({ nodeValue }) => {
  return {
    type: "textNode",
    domType: "text",
    props: { nodeValue },
    element: null,
  };
};

const jsxBottomButton = ({ text, state, setState }) => {
  return {
    type: "htmlNode",
    domType: "button",
    props: {},
    element: () => jsxLeafText({ nodeValue: `${text} ${state}` }),
    handlers: {
      onClick: () => {
        setState((prev) => prev + 1);
      },
    },
  };
};
const jsxTopButton = ({ state, setState }) => {
  return {
    type: "htmlNode",
    domType: "button",
    props: {},
    element: () => jsxLeafText({ nodeValue: `top state: ${state}` }),
    handlers: {
      onClick: () => {
        setState((prev) => prev + 1);
      },
    },
  };
};

const jsxClickableText = ({ test, setTest }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: {},
    element: () => jsxLeafText({ nodeValue: test }),
    handlers: {
      onClick: () => {
        setTest((prev) => `${prev}b`);
      },
    },
  };
};

// TEST APP 1
export const jsxAppTest = () => {
  return {
    type: "component",
    domType: null,
    props: { num: 1 },
    element: null,
    function: AppTest,
  };
};
const AppTest = () => {
  const [on, setOn] = useState(true);
  return () => ContainerTest({ on, setOn });
};

const ContainerTest = ({ on, setOn }) => {
  console.log("container", on);
  return {
    type: "htmlNode",
    domType: "div",
    props: { num: on },
    element: [
      () => OnButton({ on, setOn }),
      // Bye
      () => jsxTestComp({ test: "testComp" }),
      // h1 -> On
      on ? () => StatusAndTitle() : "",
      // Bye
      on ? () => Status() : "",
    ],
  };
};

const jsxTestComp = ({ test }) => {
  return {
    type: "component",
    domType: null,
    props: { test },
    element: null,
    function: TestComp,
  };
};

const TestComp = () => {
  return () => Status();
};

const OnButton = ({ on, setOn }) => {
  return {
    type: "htmlNode",
    domType: "button",
    props: { turnedOn: on },
    element: () => TextStatus({ nodeValue: `Toggle ${on ? "off" : "on"}` }),
    // FIXME: stale function issue - workaround
    // set prop value to the 'on' value
    // so it get rerendered on every change
    handlers: {
      onClick: () => {
        setOn((on) => !on);
      },
    },
  };
};

const StatusAndTitle = () => {
  return {
    type: "htmlNode",
    domType: "div",
    props: { num: 3 },
    element: () => Title(),
  };
};
const Title = () => {
  return {
    type: "htmlNode",
    domType: "h1",
    props: { class: "whatever", num: 4 },
    element: () => TextStatus({ nodeValue: "On!" }),
  };
};

const Status = () => {
  return {
    type: "htmlNode",
    domType: "div",
    props: { num: 3 },
    element: () => TextStatus({ nodeValue: "Bye!" }),
  };
};
const TextStatus = ({ nodeValue }) => {
  return {
    type: "textNode",
    domType: "text",
    props: { nodeValue },
    element: null,
  };
};

// ---------------------------
// TEST APP 2, partial
const Container = ({ xCoord, yCoord, setXCoord, setYCoord }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    element: [() => SvgMultiple({ x: xCoord, y: yCoord }), () => Deep()],
  };
};
export const SvgMultiple = ({ x, y }) => {
  const element = x && y ? () => Square({ x, y }) : () => Alert();
  return {
    type: "svgNode",
    domType: "svg",
    props: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
    element: [element, element],
  };
};
const Square = ({ x, y }) => {
  return {
    type: "svgNode",
    domType: "rect",
    props: { x, y, width: "30", height: "30" },
    element: null,
  };
};
const Alert = () => {
  return {
    type: "svgNode",
    domType: "text",
    props: { x: "0", y: "40", class: "small" },
    element: [() => Text({ nodeValue: "Fill out all inputs!" })],
  };
};
export const Deep = () => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    element: [NestedInDeep],
  };
};
const NestedInDeep = () => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    element: [
      () => Coordinate({ coord: 10, name: "zz" }),
      () => Coordinate({ coord: 10, name: "zz" }),
    ],
  };
};
const Coordinate = ({ coord, name }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    element: [() => Text({ nodeValue: `${name} coordinate is: ${coord}` })],
  };
};
const Text = ({ nodeValue }) => {
  return {
    type: "textNode",
    domType: "text",
    props: { nodeValue },
    element: null,
  };
};
