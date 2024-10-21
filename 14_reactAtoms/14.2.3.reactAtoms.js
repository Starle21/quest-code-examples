// adding Hook

// DATA - WRITE - HOOK
let _values = [];
let pointer = 0;
function useState(initial) {
  const state = _values[pointer] || initial;
  let _pointer = pointer;
  const setValue = (newValue) => {
    _values[_pointer] = newValue;
    render();
  };
  pointer++;
  return [state, setValue];
}

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
  const [xCoord, setXCoord] = useState("");
  const [yCoord, setYCoord] = useState("");
  return jsxDiv({
    children: [
      jsxButton({
        children: jsxText("request remote data"),
        onClick: () => {
          makeNetworkRequest(({ x, y }) => {
            setXCoord(x);
            setYCoord(y);
            console.log("new data!", x, y);
          });
        },
      }),
      jsxDiv({ children: jsxText("x coordinate:") }),
      jsxInput({
        value: xCoord,
        onInput: (e) => {
          setXCoord(e.target.value);
        },
      }),
      jsxDiv({ children: jsxText("y coordinate:") }),
      jsxInput({
        value: yCoord,
        onInput: (e) => {
          setYCoord(e.target.value);
        },
      }),
      jsxSvg({
        children:
          xCoord && yCoord
            ? jsxSquare({ x: xCoord, y: yCoord })
            : jsxAlert({ children: jsxText("Fill out all inputs!") }),
      }),
      jsxDiv({ children: jsxText(`x coordinate is: ${xCoord}`) }),
      jsxDiv({ children: jsxText(`y coordinate is: ${yCoord}`) }),
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
    props: { textContent: text, children: null },
  };
};

// ----
let vDOM;
let prevVDOM;
let topAccessor;
let isFocusX = false;
let isFocusY = false;

// GATHER COMPONENTS TOGETHER
// pass data as prop
function createVDOM(description, parent) {
  let childEffect;
  if (description.type === "component") {
    childEffect = description.function();
    childEffect.return = parent;
  } else {
    childEffect = description;
    childEffect.return = parent;
  }
  if (childEffect.props.children) {
    if (childEffect.props.children instanceof Array) {
      childEffect.props.children.forEach((sub) => createVDOM(sub, childEffect));
    } else {
      createVDOM(childEffect.props.children, childEffect);
    }
  }
  return childEffect;
}

let _description;
// TOP LEVEL API
function render(description) {
  setFocus();

  if (description) _description = description;
  pointer = 0;
  if (!vDOM) {
    vDOM = createVDOM(_description, null);
    topAccessor = createDOMNodes(vDOM);
    document.body.replaceChildren(topAccessor);
    // console.log(vDOM);
  } else {
    prevVDOM = vDOM;
    vDOM = createVDOM(_description, null);
    diff(prevVDOM, vDOM);
  }

  keepFocus();
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
      element.accessor = node;
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
      element.accessor = node;
      break;
    }
    case "textNode": {
      node = document.createTextNode(element.props.textContent);
      element.accessor = node;
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

// children: array, object
// update, create whole subtree, delete with replace
// old vdom and newvdom needs to have the same length of array of children
function diff(prevVDOM, vDOM) {
  // console.log("---");
  if (vDOM instanceof Array) {
    // console.log("array");
    vDOM.map((child, index) => {
      diff(prevVDOM[index], child);
    });
  } else {
    if (prevVDOM !== null) {
      const current = Object.keys(vDOM.props)
        .filter((key) => key !== "children")
        .reduce((obj, key) => {
          obj[key] = vDOM.props[key];
          return obj;
        }, {});
      const previous = Object.keys(prevVDOM.props)
        .filter((key) => key !== "children")
        .reduce((obj, key) => {
          obj[key] = prevVDOM.props[key];
          return obj;
        }, {});

      vDOM.accessor = prevVDOM.accessor;

      if (
        vDOM.domType === prevVDOM.domType &&
        JSON.stringify(current) !== JSON.stringify(previous)
      ) {
        // console.log("different props", vDOM);
        switch (vDOM.type) {
          case "htmlNode":
          case "textNode": {
            Object.keys(current).map((key) => {
              vDOM.accessor[key] = current[key];
            });
            break;
          }
          case "svgNode": {
            Object.keys(current).map((key) => {
              vDOM.accessor.setAttribute(key, current[key]);
            });
            break;
          }
        }
      } else if (vDOM.domType !== prevVDOM.domType) {
        // create whole subtree and replace
        // console.log("different type", vDOM);
        let node = createDOMNodes(vDOM);
        vDOM.return.accessor.replaceChildren(node);
      } else {
        // console.log("same", vDOM);
      }
      // recurse down
      if (vDOM.props.children !== null && prevVDOM.props.children !== null) {
        diff(prevVDOM.props.children, vDOM.props.children);
      }
    }
  }
}

// HELPERS
function makeNetworkRequest(handler) {
  console.log("request pending");
  setTimeout(() => {
    handler({
      x: Math.ceil(Math.random() * 160),
      y: Math.ceil(Math.random() * 60),
    });
  }, 2000);
}

function setFocus() {
  topAccessor && document.activeElement == topAccessor.children[2]
    ? (isFocusX = true)
    : (isFocusX = false);
  topAccessor && document.activeElement == topAccessor.children[4]
    ? (isFocusY = true)
    : (isFocusY = false);
}

function keepFocus() {
  topAccessor && isFocusX && topAccessor.children[2].focus();
  topAccessor && isFocusY && topAccessor.children[4].focus();
}

// RUN
render(jsxApp());
