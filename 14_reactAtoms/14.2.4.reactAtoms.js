// diff
// create host root
// createVDOM with host root
// component captured in the tree in createVDOM
// enabling for nested component functions

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
  console.error("before", vDOM);
  if (!vDOM) {
    vDOM = createVDOM({ ...hostRoot });
    console.warn("root reached", vDOM);
    createDOMNodes(vDOM);
    commit(vDOM);
    console.warn(vDOM);
  } else {
    console.error("DIFF");
    prevVDOM = { ...vDOM };
    vDOM = createVDOM(vDOM);
    console.log("diff", vDOM);
    diff(prevVDOM, vDOM);
  }
}

function createVDOM(effect) {
  console.log("effect", effect);
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
  console.log("up", effect);
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
      console.log("node 2", node);
      console.log("childNode 2", childNode);
      console.log("effect 2", effect);
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
    console.log("node 1", node);
    console.log("childNode 1", childNode);
    console.log("effect 1", effect);
    if (node != null) {
      childNode =
        childNode !== null ? childNode : searchForChildAccessor(effect);
      node.append(childNode);
    }
  }
  return node;
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

function commit(effect) {
  console.log(effect);
  const childAccessor = searchForChildAccessor(effect);
  console.log(childAccessor);
  document.body.replaceChildren(childAccessor);
}

function searchForChildAccessor(effect) {
  if (effect.child.type === "component") {
    return effect.child.child.accessor;
  } else {
    return effect.child.accessor;
  }
}

// children: array, object
// update, create whole subtree, delete with replace
// old vdom and newvdom needs to have the same length of array of children

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

// ------------
// previous diff version - works, but only for arrays of the same length

// function diff(current, wip) {
//   console.log("---");
//   console.log("current", current);
//   console.log("wip", wip);
//   if (wip instanceof Array) {
//     console.log("array", wip);
//     wip.map((child, index) => {
//       diff(current[index], child);
//     });
//   } else {
//     if (current !== null) {
//       const wipProps =
//         wip.props !== null
//           ? Object.keys(wip.props)
//               .filter((key) => key !== "children")
//               .reduce((obj, key) => {
//                 obj[key] = wip.props[key];
//                 return obj;
//               }, {})
//           : null;
//       const currentProps =
//         wip.props !== null
//           ? Object.keys(current.props)
//               .filter((key) => key !== "children")
//               .reduce((obj, key) => {
//                 obj[key] = current.props[key];
//                 return obj;
//               }, {})
//           : null;

//       wip.accessor = current.accessor;

//       if (
//         wip.domType === current.domType &&
//         JSON.stringify(wipProps) !== JSON.stringify(currentProps)
//       ) {
//         console.log("different props", wip);
//         switch (wip.type) {
//           case "htmlNode":
//           case "textNode": {
//             Object.keys(wipProps).map((key) => {
//               wip.accessor[key] = wipProps[key];
//             });
//             break;
//           }
//           case "svgNode": {
//             Object.keys(wipProps).map((key) => {
//               wip.accessor.setAttribute(key, wipProps[key]);
//             });
//             break;
//           }
//         }
//       } else if (wip.domType !== current.domType) {
//         // create whole subtree and replace
//         console.log("different type", wip);
//         let node = createDOMNodes(wip);
//         wip.return.accessor.replaceChildren(node);
//       } else {
//         console.log("same", wip);
//       }
//       // recurse down
//       if (wip.child !== null && current.child !== null) {
//         diff(current.child, wip.child);
//       }
//     }
//   }
// }
