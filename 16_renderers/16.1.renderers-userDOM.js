import { render, useState } from "./16.1.renderers-core";
// -------------------------------------------------------------------------------
// ELEMENTS / COMPONENTS
export const jsxApp = ({ children }) => {
  return {
    type: "component",
    domType: null,
    props: { children },
    function: () => App({ children }),
  };
};

const App = ({ children }) => {
  const [xCoord, setXCoord] = useState("");
  const [yCoord, setYCoord] = useState("");
  const [side, setSide] = useState("");
  return jsxDiv({
    children: [
      children,
      jsxBr(),
      jsxButton({
        children: jsxText("request remote data"),
        onClick: () => {
          makeNetworkRequest(({ x, y, side }) => {
            setXCoord(x);
            setYCoord(y);
            setSide(side);
            console.log("local data updated from remote source", x, y, side);
          });
        },
      }),
      jsxDiv({ children: jsxText("x coordinate:") }),
      jsxInput({
        id: "x",
        value: xCoord,
        onInput: (e) => setXCoord(e.target.value),
      }),
      jsxDiv({ children: jsxText("y coordinate:") }),
      jsxInput({
        id: "y",
        value: yCoord,
        onInput: (e) => setYCoord(e.target.value),
      }),
      jsxSvg({
        children:
          xCoord && yCoord
            ? jsxSquare({ x: xCoord, y: yCoord })
            : jsxAlert({
                children: jsxText("Fill out all inputs!"),
              }),
      }),
      jsxDiv({
        children: jsxText(`x coordinate is: ${xCoord}`),
      }),
      jsxDiv({
        children: jsxText(`y coordinate is: ${yCoord}`),
      }),
      jsxDiv({ children: jsxText(`side is: ${side}`) }),
    ],
  });
};

export const jsxImplicitMemo = () => {
  return {
    type: "component",
    domType: null,
    props: {},
    function: ImplicitMemo,
  };
};

const ImplicitMemo = () => {
  return jsxDiv({
    children: [
      jsxText(`Give me x and y and I'll create a square for you.`),
      jsxBr(),
      jsxText(`This text will not recalculate on parent update.`),
    ],
  });
};

// only one setState
// batch and render after both setStates
// -- have a queue
// keep switching between this fiber and its alternate on every render change
const jsxDiv = ({ onClick, children }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: { children },
  };
};

const jsxButton = ({ onClick, children }) => {
  return {
    type: "htmlNode",
    domType: "button",
    props: { onClick, children },
  };
};

const jsxText = (text) => {
  return {
    type: "textNode",
    domType: "text",
    props: text,
  };
};

const jsxBr = () => {
  return {
    type: "htmlNode",
    domType: "br",
    props: { children: null },
  };
};

const jsxInput = ({ id, value, onInput }) => {
  return {
    type: "htmlNode",
    domType: "input",
    props: { id, value, onInput, children: null },
  };
};

const jsxSvg = ({ children }) => {
  return {
    type: "svgNode",
    domType: "svg",
    props: {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 200 80",
      children,
    },
  };
};

const jsxSquare = ({ x, y }) => {
  return {
    type: "svgNode",
    domType: "rect",
    props: { x, y, width: "30", height: "30", children: null },
  };
};

const jsxAlert = ({ children }) => {
  return {
    type: "svgNode",
    domType: "text",
    props: { x: "0", y: "40", class: "small", children },
  };
};

// -------------------------------------------------------------------------------
// HANDLERS
function makeNetworkRequest(handler) {
  console.log("request pending");
  setTimeout(() => {
    handler({
      x: Math.ceil(Math.random() * 160),
      y: Math.ceil(Math.random() * 40),
      side: Math.ceil(Math.random() * 30),
    });
  }, 2000);
}

// -------------------------------------------------------------------------------
// -------------------------------------------------------------------------------
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
  let sum = 5 + 3;
  return jsxDivWithNum({
    num,
    children: [
      jsxButtonWithOn({
        turnedOn: on,
        onClick: () => {
          setOn((on) => !on);
        },
        children: jsxText(`Toggle ${on ? "off" : "on"}`),
      }),
      jsxText(`sum is: ${sum}`),
      jsxTestComp({ test: "testComp", on }),
      on
        ? jsxDivWithNum({
            num: 3,
            children: jsxH1WithNum({
              num: 4,
              className: "whatever",
              children: jsxText("On!"),
            }),
          })
        : null,
      on
        ? jsxDivWithNum({
            num: 5,
            children: jsxText(`Ahoj`),
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
    children: jsxText(
      on ? "It's on, rise and shine!" : "It's off, go to sleep!"
    ),
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

// -------------------------------------------------------------------------------
// RUN
const root = document.querySelector("#root");
render(jsxApp({ children: jsxImplicitMemo() }), root);
// render(jsxAppTest({ num: 100 }), root);
