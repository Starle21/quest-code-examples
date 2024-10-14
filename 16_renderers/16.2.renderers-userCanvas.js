import { getFiber, render, useState } from "./16.1.renderers-core";
// imperative code in a prop
// -------------------------------------------------------------------------------
// canvas
// const canvas = document.getElementById("canvas");
// const context = canvas.getContext("2d");
// context.fillStyle = "green";
// context.fillRect(10, 10, 150, 100);
// context.clearRect(10, 10, 120, 100);

// ----------------------------------------------------------------------

// app
export const jsxAppCanvas = () => {
  return {
    type: "component",
    domType: null,
    props: {},
    function: AppCanvas,
  };
};

const AppCanvas = () => {
  const [x, setX] = useState(170);
  const [show, setShow] = useState(true);
  return jsxDiv({
    children: [
      jsxCanvas({
        width: 400,
        height: 250,
        children: [
          jsxCanvasRect({
            x: 10,
            draw: (context) => {
              context.fillStyle = "green";
              context.fillRect(10, 10, 150, 100);
            },
            clear: (context, oldX) => {
              context.clearRect(oldX, 100, 150, 100);
            },
          }),
          show &&
            jsxCanvasRect({
              x,
              draw: (context) => {
                context.fillStyle = "blue";
                context.fillRect(x, 100, 150, 100);
              },
              clear: (context, oldX) => {
                context.clearRect(oldX, 100, 150, 100);
              },
            }),
        ],
      }),
      jsxBr(),
      jsxInput({ value: x, onInput: (e) => setX(e.target.value) }),
      jsxBr(),
      jsxButton({
        children: jsxText(`${show ? "hide" : "show"} rect`),
        onClick: () => {
          setShow(!show);
        },
      }),
    ],
  });
};

// canvas element
const jsxCanvas = ({ width, height, children }) => {
  return {
    type: "htmlNode",
    domType: "canvas",
    props: {
      width,
      height,
      children,
    },
  };
};

const jsxCanvasRect = ({ draw, clear, x }) => {
  return {
    type: "canvasNode",
    domType: "canvas-rectangle",
    props: { x, draw, clear, children: null },
  };
};

const jsxDiv = ({ children }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: { children },
  };
};

const jsxInput = ({ value, onInput }) => {
  return {
    type: "htmlNode",
    domType: "input",
    props: { value, onInput, children: null },
  };
};

const jsxButton = ({ onClick, children }) => {
  return {
    type: "htmlNode",
    domType: "button",
    props: { onClick, children },
  };
};

const jsxBr = () => {
  return {
    type: "htmlNode",
    domType: "br",
    props: { children: null },
  };
};

const jsxText = (text) => {
  return {
    type: "textNode",
    domType: "text",
    props: text,
  };
};

// -------------------------------------------------------------------------------
// RUN
const root = document.querySelector("#root");
render(jsxAppCanvas(), root);
