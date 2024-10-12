import { useState } from "../14.reactAtoms.12";

// TEST APP 4 PASS IN FUNCTIONAL COMPONENT AS A PROP - after changing object definitions

// functional components - scriptable node that can modify execution tree
const jsxTop = ({}) => {
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
