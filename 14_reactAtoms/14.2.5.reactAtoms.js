// dividing diff into calculation and effect

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

function createHostRoot(DOMRoot, effect) {
  return {
    type: "root",
    return: null,
    accessor: DOMRoot,
    props: null,
    childEffect: effect,
  };
}

// ----
let vDOM;
let prevVDOM;
let hostRoot;
// TOP LEVEL API
function render(effect, DOMRoot) {
  if (DOMRoot && effect) {
    hostRoot = createHostRoot(DOMRoot, effect);
  }
  pointer = 0;
  if (!vDOM) {
    vDOM = createVDOM({ ...hostRoot });
    createDOMNodes(vDOM);
    commit(vDOM);
    console.log(vDOM);
  } else {
    prevVDOM = { ...vDOM };
    vDOM = createVDOM(vDOM);
    diff(prevVDOM, vDOM);
  }
}

function diff(current, wip) {
  const currentChild = current.child;
  const wipChild = wip.child;

  if (wipChild instanceof Array) {
    let idx = 0;
    // both exist
    while (currentChild[idx] != null && idx < wipChild.length) {
      // only updates or delete/create
      diffEffects(currentChild[idx], wipChild[idx]);
      idx++;
    }
    // current exists, wip does not
    if (currentChild[idx] !== null && idx === wipChild.length) {
      // delete rest of old
      while (currentChild[idx] != null) {
        current.accessor.removeChild(currentChild[idx].accessor);
        idx++;
      }
      return;
    }
    // wip exists, current does not
    if (currentChild[idx] == null) {
      // create
      while (wipChild[idx]) {
        let node = createDOMNodes(wipChild[idx]);
        wip.accessor.append(node);
        idx++;
      }
      return;
    }
  } else {
    if (currentChild != null && wipChild != null) {
      diffEffects(currentChild, wipChild);
    }
    if (currentChild != null && wipChild == null) {
      current.accessor.removeChild(currentChild.accessor);
      return;
    }
    if (currentChild == null && wipChild != null) {
      let node = createDOMNodes(wipChild);
      wip.accessor.append(node);
      return;
    }
  }
}

function diffEffects(currentEffect, wipEffect) {
  console.log("---");
  console.log("curr", currentEffect);
  console.log("wip", wipEffect);
  if (currentEffect != null && wipEffect != null) {
    if (wipEffect.domType === currentEffect.domType) {
      wipEffect.accessor = currentEffect.accessor;

      const wipProps =
        wipEffect.props !== null
          ? Object.keys(wipEffect.props)
              .filter((key) => key !== "children")
              .reduce((obj, key) => {
                obj[key] = wipEffect.props[key];
                return obj;
              }, {})
          : null;
      const currentProps =
        currentEffect.props !== null
          ? Object.keys(currentEffect.props)
              .filter((key) => key !== "children")
              .reduce((obj, key) => {
                obj[key] = currentEffect.props[key];
                return obj;
              }, {})
          : null;

      if (JSON.stringify(wipProps) !== JSON.stringify(currentProps)) {
        console.log("different props", wipEffect);
        switch (wipEffect.type) {
          case "htmlNode":
          case "textNode": {
            Object.keys(wipProps).map((key) => {
              wipEffect.accessor[key] = wipProps[key];
            });
            break;
          }
          case "svgNode": {
            Object.keys(wipProps).map((key) => {
              wipEffect.accessor.setAttribute(key, wipProps[key]);
            });
            break;
          }
        }
        Object.keys(currentProps)
          .filter((key) => key.startsWith("on"))
          .map((key) => {
            const eventType = key.toLocaleLowerCase().substring(2);
            currentEffect.accessor.removeEventListener(
              eventType,
              currentProps[key]
            );
          });
        Object.keys(wipProps)
          .filter((key) => key.startsWith("on"))
          .map((key) => {
            const eventType = key.toLocaleLowerCase().substring(2);
            wipEffect.accessor.addEventListener(eventType, wipProps[key]);
          });
      }
      diff(currentEffect, wipEffect);
    } else {
      console.log("different type", wipEffect);
      currentEffect.return.accessor.removeChild(currentEffect.accessor);
      let node = createDOMNodes(wipEffect);

      wipEffect.return.accessor.appendChild(node);
    }
  }
}

function createVDOM(effect) {
  let childEffect;
  switch (effect.type) {
    case "root": {
      childEffect = effect.childEffect;
      break;
    }
    case "component": {
      childEffect = effect.function();
      break;
    }
    case "svgNode":
    case "textNode":
    case "htmlNode": {
      childEffect = effect.props.children;
    }
  }
  if (childEffect === null) {
    effect.child = null;
    return effect;
  } else if (childEffect instanceof Array) {
    let childArray = childEffect.map((child) => {
      let newChild = { ...child, return: effect };
      return createVDOM(newChild);
    });
    effect.child = childArray;
  } else {
    let newChild = { ...childEffect, return: effect };
    effect.child = createVDOM(newChild);
  }
  return effect;
}

// CREATE ACCESSORS, RENDER TO DOM
function createDOMNodes(effect) {
  let node;
  switch (effect.type) {
    case "root": {
      node = null;
      break;
    }
    case "component": {
      effect.accessor = null;
      node = null;
      break;
    }
    case "htmlNode": {
      node = document.createElement(effect.domType);
      Object.keys(effect.props)
        .filter((key) => key !== "children" && !key.startsWith("on"))
        .map((key) => {
          node[key] = effect.props[key];
        });
      Object.keys(effect.props)
        .filter((key) => key.startsWith("on"))
        .map((key) => {
          const eventType = key.toLocaleLowerCase().substring(2);
          node.addEventListener(eventType, effect.props[key]);
        });
      effect.accessor = node;
      break;
    }
    case "svgNode": {
      node = document.createElementNS(
        "http://www.w3.org/2000/svg",
        effect.domType
      );
      Object.keys(effect.props)
        .filter((key) => key !== "children")
        .map((key) => {
          node.setAttribute(key, effect.props[key]);
        });
      effect.accessor = node;
      break;
    }
    case "textNode": {
      node = document.createTextNode(effect.props.textContent);
      effect.accessor = node;
      break;
    }
  }
  if (effect.child instanceof Array) {
    effect.child.forEach((child) => {
      let childNode = createDOMNodes(child);
      if (node != null) {
        childNode =
          childNode !== null ? childNode : searchForChildAccessor(effect);
        node.append(childNode);
      }
    });
  } else if (effect.child === null) {
    return node;
  } else {
    let childNode = createDOMNodes(effect.child);
    if (node != null) {
      childNode =
        childNode !== null ? childNode : searchForChildAccessor(effect);
      node.append(childNode);
    }
  }
  return node;
}

function commit(effect) {
  const childAccessor = searchForChildAccessor(effect);
  document.body.replaceChildren(childAccessor);
}

function searchForChildAccessor(effect) {
  if (effect.child.type === "component") {
    return effect.child.child.accessor;
  } else {
    return effect.child.accessor;
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

// RUN
const root = document.querySelector("#root");
render(jsxApp(), root);

// -----------------
// createVDOM linked list and loop

// function createVDOM(effect) {
//   console.log("effect", effect);
//   let childEffect;
//   switch (effect.type) {
//     case "component": {
//       childEffect = effect.function();
//       break;
//     }
//     case "root":
//     case "svgNode":
//     case "textNode":
//     case "htmlNode": {
//       childEffect = effect.props.children;
//     }
//   }
//   if (childEffect === null) {
// effect.child = null;
//     return null;
//   }
//   if (childEffect instanceof Array) {
//     let newFirstChild = null;
//     let previousChild = null;
//     childEffect.forEach((singleChildEffect) => {
//       let enhanced = { ...singleChildEffect, return: effect, sibling: null };
//       if (newFirstChild === null) {
//         newFirstChild = enhanced;
//       } else {
//         previousChild.sibling = enhanced;
//       }
//       previousChild = enhanced;
//     });
//     effect.child = newFirstChild;
//     return effect.child;
//   } else {
//     effect.child = { ...childEffect, return: effect, sibling: null };
//     return effect.child;
//   }
// }

// let nextWip;
// let wip;
// wip = hostRoot;

// while (wip) {
//   nextWip = createVDOM(wip);
//   if (nextWip !== null) {
//     wip = nextWip;
//   } else {
//     console.log("nextWip", nextWip);
//     console.log("wip", wip);
//     do {
//       if (wip.sibling !== null) {
//         wip = wip.sibling;
//         break;
//       }
//       wip = wip.return;
//     } while (wip !== null);
//   }
// }
