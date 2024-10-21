// DATA - WRITE
// store at the top
let xCoord = "";

// COMPONENT
const jsxApp = () => {
  return {
    type: "component",
    domType: null,
    props: {},
    function: App,
  };
};

const App = () => {
  return jsxDiv({
    children: [
      jsxButton({
        children: jsxText("request remote data"),
        onClick: () => {
          makeNetworkRequest((newValue) => {
            xCoord = newValue;
            console.log("new data!", xCoord);
          });
        },
      }),
      jsxDiv({ children: jsxText("x coordinate:") }),
      jsxInput({
        value: xCoord,
        onInput: (e) => {
          xCoord = e.target.value;
        },
      }),
      jsxSvg({
        children: xCoord
          ? jsxSquare({ x: xCoord })
          : jsxAlert({ children: jsxText("Fill out all inputs!") }),
      }),
      jsxDiv({ children: jsxText(`x coordinate is: ${xCoord}`) }),
    ],
  });
};

// ELEMENTS
const jsxInput = ({ value, onInput }) => {
  return {
    type: "htmlNode",
    domType: "input",
    props: { value, onInput, children: null },
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

const jsxSquare = ({ x }) => {
  return {
    type: "svgNode",
    domType: "rect",
    props: { x, y: "20", width: "30", height: "30", children: null },
  };
};

const jsxAlert = ({ children }) => {
  return {
    type: "svgNode",
    domType: "text",
    props: {
      x: "0",
      y: "40",
      class: "small",
      children,
    },
  };
};

const jsxDiv = ({ children }) => {
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
    props: { text, children: null },
  };
};

// ----
let vDOM;
let topAccessor;
let isFocus = false;

// GATHER COMPONENTS TOGETHER
// pass data as prop
function createVDOM(description) {
  let tree;
  if (description.type === "component") {
    tree = description.function();
  }
  return tree;
}

// TOP LEVEL API
function render(description) {
  topAccessor && document.activeElement == topAccessor.children[2]
    ? (isFocus = true)
    : (isFocus = false);

  vDOM = createVDOM(description);
  topAccessor = createDOMNodes(vDOM);
  document.body.replaceChildren(topAccessor);

  topAccessor && isFocus && topAccessor.children[2].focus();
}

// CREATE ACCESSORS, RENDER TO DOM
function createDOMNodes(element) {
  let node;
  switch (element.type) {
    case "htmlNode": {
      node = document.createElement(element.domType);
      Object.keys(element.props)
        .filter((key) => key !== "children" && !key.startsWith("on"))
        .map((key) => {
          node[key] = element.props[key];
        });
      Object.keys(element.props)
        .filter((key) => key.startsWith("on"))
        .map((key) => {
          const eventType = key.toLocaleLowerCase().substring(2);
          node.addEventListener(eventType, element.props[key]);
        });
      break;
    }
    case "svgNode": {
      node = document.createElementNS(
        "http://www.w3.org/2000/svg",
        element.domType
      );
      Object.keys(element.props)
        .filter((key) => key !== "children")
        .map((key) => {
          node.setAttribute(key, element.props[key]);
        });
      break;
    }
    case "textNode": {
      node = document.createTextNode(element.props.text);
      break;
    }
  }
  if (element.props.children instanceof Array) {
    element.props.children.forEach((child) => {
      let childNode = createDOMNodes(child);
      node.append(childNode);
    });
  } else if (element.props.children === null) {
    return node;
  } else {
    let childNode = createDOMNodes(element.props.children);
    node.append(childNode);
  }
  return node;
}

// HELPERS;
function makeNetworkRequest(handler) {
  console.log("request pending");
  setTimeout(() => {
    handler(Math.ceil(Math.random() * 160));
  }, 2000);
}

// RUN
// setInterval(() => render(jsxApp()), 200);
