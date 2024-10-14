import { getFiber, render } from "./16.1.renderers-core";
// NOT WORKING, imperative code in a prop
// -------------------------------------------------------------------------------
// canvas
// const canvas = document.getElementById("canvas");
// const context = canvas.getContext("2d");
// context.fillStyle = "green";
// context.fillRect(10, 10, 150, 100);
// context.clearRect(10, 10, 120, 100);

// in canvas element
// const context = canvas.getContext("2d");

// ----------------------------------------------------------------------
// native elements
// jsxInput
// props id, value, onInput
// return { ... }
// current null or types didn't match --> document.createElement(div)
// types didn't match --> document.removeChild(div)
// update props --> accessor[value] = newProps[value]

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
  return jsxDiv({
    children: jsxCanvasContainer({
      width: 400,
      height: 250,
      children: (context) =>
        jsxCanvasRect({
          // - function to create rectangle in canvas
          render: () => {
            context.fillStyle = "blue";
            context.fillRect(10, 10, 150, 100);
            return "canvas-rectangle";
          },
        }),
    }),
  });
};

const jsxDiv = ({ children }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: { children },
  };
};

function jsxCanvasContainer({ width, height, children }) {
  return {
    type: "component",
    domType: null,
    props: { width, height, children },
    function: () => CanvasContainer({ width, height, children }),
  };
}

// canvas component
function CanvasContainer({ width, height, children }) {
  //   console.log("fiber", getFiber());
  const canvasAccessor = getFiber().accessor;
  console.log("canvasAccessor", canvasAccessor);
  const context = canvasAccessor && canvasAccessor.getContext("2d");
  return context && jsxCanvas({ width, height, children: children(context) });
}

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

const jsxCanvasRect = ({ render, clear }) => {
  return {
    type: "canvasNode",
    domType: null,
    props: { render, clear, children: null },
  };
};

//<element
//  render={(context) => {
//    context.fillStyle = "blue";
//    context.drawRect(/*...*/);
//  }}
///>;
// current null or types didn't match --> props.render()
// types didn't match --> props.clear()
// update props --> props.render()

// Canvas children: (context)=> jsxCanvasChild(context)

// -------------------------------------------------------------------------------
// RUN
const root = document.querySelector("#root");
render(jsxAppCanvas(), root);
