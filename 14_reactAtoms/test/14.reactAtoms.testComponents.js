// import { useState } from "../14.reactAtoms.10";

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
  return {
    type: "htmlNode",
    domType: "div",
    props: { num: 2 },
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
        setOn(!on);
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
