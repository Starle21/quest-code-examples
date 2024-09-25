import { useState } from "../14.reactAtoms.6";

// TEST APP 1
export const AppTest = () => {
  const [on, setOn] = useState(false);
  return {
    type: "component",
    domType: null,
    props: { num: 1 },
    children: [() => ContainerTest({ on, setOn })],
  };
};
const ContainerTest = ({ on, setOn }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: { num: 2 },
    children: [
      () => OnButton({ on, setOn }),
      on ? () => StatusAndTitle() : "",
      on ? () => Status() : "",
      () => TestComp(),
    ],
  };
};

const TestComp = () => {
  return {
    type: "component",
    domType: null,
    props: { test: "testComp" },
    children: [() => Status()],
  };
};

const OnButton = ({ on, setOn }) => {
  return {
    type: "htmlNode",
    domType: "button",
    props: { turnedOn: on },
    children: [() => TextStatus({ nodeValue: `Toggle ${on ? "off" : "on"}` })],
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
    children: [() => Title()],
  };
};
const Title = () => {
  return {
    type: "htmlNode",
    domType: "h1",
    props: { class: "whatever", num: 4 },
    children: [() => TextStatus({ nodeValue: "On!" })],
  };
};

const Status = () => {
  return {
    type: "htmlNode",
    domType: "div",
    props: { num: 3 },
    children: [() => TextStatus({ nodeValue: "On!" })],
  };
};
const TextStatus = ({ nodeValue }) => {
  return {
    type: "textNode",
    domType: "text",
    props: { nodeValue },
    children: null,
  };
};

// ---------------------------
// TEST APP 2
const Container = ({ xCoord, yCoord, setXCoord, setYCoord }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    children: [() => SvgMultiple({ x: xCoord, y: yCoord }), () => Deep()],
  };
};
export const SvgMultiple = ({ x, y }) => {
  const element = x && y ? () => Square({ x, y }) : () => Alert();
  return {
    type: "svgNode",
    domType: "svg",
    props: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
    children: [element, element],
  };
};
const Square = ({ x, y }) => {
  return {
    type: "svgNode",
    domType: "rect",
    props: { x, y, width: "30", height: "30" },
    children: null,
  };
};
const Alert = () => {
  return {
    type: "svgNode",
    domType: "text",
    props: { x: "0", y: "40", class: "small" },
    children: [() => Text({ nodeValue: "Fill out all inputs!" })],
  };
};
export const Deep = () => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    children: [NestedInDeep],
  };
};
const NestedInDeep = () => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    children: [
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
    children: [() => Text({ nodeValue: `${name} coordinate is: ${coord}` })],
  };
};
const Text = ({ nodeValue }) => {
  return {
    type: "textNode",
    domType: "text",
    props: { nodeValue },
    children: null,
  };
};
