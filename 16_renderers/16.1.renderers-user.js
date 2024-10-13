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
        children: jsxText({ nodeValue: "request remote data" }),
        onClick: () => {
          makeNetworkRequest(({ x, y, side }) => {
            setXCoord(x);
            setYCoord(y);
            setSide(side);
            console.log("local data updated from remote source", x, y, side);
          });
        },
      }),
      jsxDiv({ children: jsxText({ nodeValue: "x coordinate:" }) }),
      jsxInput({
        id: "x",
        value: xCoord,
        onInput: (e) => setXCoord(e.target.value),
      }),
      jsxDiv({ children: jsxText({ nodeValue: "y coordinate:" }) }),
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
                children: jsxText({ nodeValue: "Fill out all inputs!" }),
              }),
      }),
      jsxDiv({
        children: jsxText({ nodeValue: `x coordinate is: ${xCoord}` }),
      }),
      jsxDiv({
        children: jsxText({ nodeValue: `y coordinate is: ${yCoord}` }),
      }),
      jsxDiv({ children: jsxText({ nodeValue: `side is: ${side}` }) }),
    ],
  });
};

const jsxImplicitMemo = () => {
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
      jsxText({
        nodeValue: `Give me x and y and I'll create a square for you.`,
      }),
      jsxBr(),
      jsxText({
        nodeValue: `This text will not recalculate on parent update.`,
      }),
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

const jsxText = ({ nodeValue }) => {
  return {
    type: "textNode",
    domType: "text",
    props: { nodeValue, children: null },
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
