import { jsxAppTest } from "./test/14.reactAtoms.testComponents";
// description of an result element {type: '', props: {}, children: [Fce, Fce]}, handlers: [Fce, Fce]}
// MEMOIZATION
// ---
let currentRoot;
let wipRoot;
let currentTopLevelParentAccessor;
let currentEffect;
let pointer;

// DATA - WRITE - HOOK
export function useState(initial) {
  currentEffect.state[pointer] = currentEffect.state[pointer] || initial;
  const state = currentEffect.state[pointer];

  let _pointer = pointer;
  const setValue = (newValue) => {
    currentEffect.state[_pointer] = newValue;
    render();
  };

  pointer++;
  return [state, setValue];
}

// ELEMENTS / COMPONENTS
const jsxApp = () => {
  return {
    type: "component",
    domType: null,
    props: null,
    children: null,
    function: App,
  };
};

const App = () => {
  const [xCoord, setXCoord] = useState("");
  const [yCoord, setYCoord] = useState("");
  return () => jsxContainer({ xCoord, yCoord, setXCoord, setYCoord });
};

const jsxContainer = ({ xCoord, yCoord, setXCoord, setYCoord }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    children: [
      () => jsxNetworkButton({ setXCoord, setYCoord }),
      () => jsxLabel({ name: "x" }),
      () => jsxInput({ name: "x", coord: xCoord, setCoord: setXCoord }),
      () => jsxLabel({ name: "y" }),
      () => jsxInput({ name: "y", coord: yCoord, setCoord: setYCoord }),
      () => jsxSvg({ x: xCoord, y: yCoord }),
      () => jsxCoordinate({ coord: xCoord, name: "x" }),
      () => jsxCoordinate({ coord: yCoord, name: "y" }),
    ],
  };
};

const jsxText = ({ nodeValue }) => {
  return {
    type: "textNode",
    domType: "text",
    props: { nodeValue },
    children: null,
  };
};

// <button onClick={handler}>request remote data</button>
const jsxNetworkButton = ({ setXCoord, setYCoord }) => {
  return {
    type: "htmlNode",
    domType: "button",
    props: null,
    children: [() => jsxText({ nodeValue: "request remote data" })],
    handlers: {
      onClick: () => {
        makeNetworkRequest(({ x, y }) => {
          setXCoord(x);
          setYCoord(y);
          console.log("local data updated from remote source");
        });
      },
    },
  };
};

// <div>{name} coordinate:</div>
const jsxLabel = ({ name }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    children: [() => jsxText({ nodeValue: `${name} coordinate:` })],
  };
};
const jsxInput = ({ name, coord, setCoord }) => {
  return {
    type: "htmlNode",
    domType: "input",
    props: { id: name, value: coord },
    children: null,
    handlers: {
      onInput: (e) => {
        setCoord(e.target.value);
      },
    },
  };
};
export const jsxSvg = ({ x, y }) => {
  const element = x && y ? () => jsxSquare({ x, y }) : () => jsxAlert();
  return {
    type: "svgNode",
    domType: "svg",
    props: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
    children: [element],
  };
};

const jsxAlert = () => {
  return {
    type: "svgNode",
    domType: "text",
    props: { x: "0", y: "40", class: "small" },
    children: [() => jsxText({ nodeValue: "Fill out all inputs!" })],
  };
};
const jsxSquare = ({ x, y }) => {
  return {
    type: "svgNode",
    domType: "rect",
    props: { x, y, width: "30", height: "30" },
    children: null,
  };
};
export const jsxCoordinate = ({ coord, name }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    children: [() => jsxText({ nodeValue: `${name} coordinate is: ${coord}` })],
  };
};

// TOP LEVEL API
let _Component;
let _currentRoot;
function render(Component, DOMRoot) {
  // initialization
  if (Component) _Component = Component;
  if (DOMRoot) {
    _currentRoot = DOMRoot;
  }

  // MOUNT - dealing with create
  if (!wipRoot) {
    wipRoot = createRoot(_currentRoot);
    // convert elements into effects
    createEffects(_Component, wipRoot);
    // convert effects into accessors - fibers (mounted stateful stack frame)
    diff(wipRoot, null);
    // apply effects - changes with respect to current state (null)
    traverseAndCommitEffects(wipRoot);
    console.log("wipRoot", wipRoot);
  }
  // RERENDER - dealing with create, update, delete
  else {
    // keep old fibers
    currentRoot = wipRoot;
    wipRoot = createRoot(_currentRoot);
    // convert elements into new effects, memoized functions which get the same args are not recalculated - incremental
    createEffects(_Component, wipRoot);
    // diff new effects with old fibers, tag changes
    diff(wipRoot, currentRoot);
    // apply effects - changes with respect to current state (previous output)
    traverseAndCommitEffects(wipRoot);
  }
}

function createRoot(hostAccessor) {
  return {
    type: "root",
    accessor: hostAccessor,
    children: null,
  };
}

// GATHER COMPONENTS, EFFECTS TOGETHER

// args: element : fce, parent dom effect
// returns: effects : objs tree
function createEffects(element, parent) {
  let effect;
  // console.log(element);
  // console.log(parent);
  // console.log("---");
  if (element instanceof Function) {
    // jsx()
    effect = element();
    // fiber
    effect.return = parent;
  }
  if (effect.type === "component") {
    effect.state = [];
    pointer = 0;
    console.log(effect);
    currentEffect = effect;
    // functional element
    let jsxChild = effect.function();
    // fiber
    effect.return = parent;
    effect.children = [jsxChild];
  }
  if (effect.children == null) {
    // stop recursion
    return effect;
  }
  // recurse down
  if (effect.children instanceof Array) {
    const children = effect.children
      .map((childElement) => createEffects(childElement, effect))
      .filter((child) => child != null);
    // go up
    effect.children = children;
    if (parent.type === "root") {
      parent.children = [effect];
    }
    return effect;
  }
}

// DIFF FOR CREATE, UPDATE, DELETE - NO OUTSIDE DIFFERENCE BETWEEN CREATE AND UDPATE
// MOUNT - if current null - only create
// RERENDER - if current exists - create, update, delete
function diff(newEffect, oldEffect) {
  if (newEffect.children && oldEffect?.children) {
    let idx = 0;
    while (newEffect.children[idx] || oldEffect.children[idx]) {
      reconcile(newEffect.children[idx], oldEffect.children[idx], newEffect);
      idx++;
    }
  }
  if (newEffect.children && !oldEffect?.children) {
    let idx = 0;
    while (newEffect.children[idx]) {
      reconcile(newEffect.children[idx], null, newEffect);
      idx++;
    }
  }
  if (!newEffect.children && oldEffect?.children) {
    let idx = 0;
    while (oldEffect.children[idx]) {
      reconcile(null, oldEffect.children[idx], newEffect);
      idx++;
    }
  }
}

// RECONCILE DIFFERENCES
function reconcile(newEl, oldEl, newParent) {
  if (newEl && oldEl) {
    if (newEl.domType === oldEl.domType) {
      newEl.accessor = oldEl.accessor;
      if (oldEl.handlers !== newEl.handlers) {
        newEl.removeListeners = oldEl.handlers;
        newEl.flag = "UPDATE";
      }
      if (JSON.stringify(newEl.props) !== JSON.stringify(oldEl.props)) {
        newEl.flag = "UPDATE";
      }
      diff(newEl, oldEl);
    } else {
      deleteOldChild(oldEl, newParent);
      currentTopLevelParentAccessor = searchForHostParentAccessor(newEl);
      createDOMNodes(newEl);
      newEl.flag = "CREATE";
    }
  }
  if (newEl && !oldEl) {
    currentTopLevelParentAccessor = searchForHostParentAccessor(newEl);
    createDOMNodes(newEl);
    newEl.flag = "CREATE";
  }
  if (!newEl && oldEl) {
    deleteOldChild(oldEl, newParent);
  }
}

// DIFF - CREATE
function createDOMNodes(effect) {
  createAccessor(effect);
  if (effect.children) {
    effect.children.forEach((childEffect) => createDOMNodes(childEffect));
  }
}

function createAccessor(effect) {
  convertToDOMNode(effect);
  setInitialDOMProperties(effect);
  appendChildToParent(effect);
}

function appendChildToParent(effect) {
  const parentAccessor = searchForHostParentAccessor(effect);
  if (effect.accessor && parentAccessor !== currentTopLevelParentAccessor) {
    parentAccessor.appendChild(effect.accessor);
  }
}

function searchForHostParentAccessor(effect) {
  const parent = effect.return;
  const parentAccessor = parent.accessor;

  // above parent is component
  // - effect.return.accessor null
  if (!parentAccessor) {
    return searchForHostParentAccessor(parent);
  }
  return parentAccessor;
}

function convertToDOMNode(effect) {
  switch (effect.type) {
    case "component": {
      effect.accessor = null;
      return;
    }
    case "htmlNode": {
      let node = document.createElement(effect.domType);
      effect.accessor = node;
      return;
    }
    case "svgNode": {
      let node = document.createElementNS(
        "http://www.w3.org/2000/svg",
        effect.domType
      );
      effect.accessor = node;
      return;
    }
    case "textNode": {
      let node = document.createTextNode("");
      effect.accessor = node;
      return;
    }
  }
}

function setInitialDOMProperties(effect) {
  // TODO: filter out non dom properties
  switch (effect.type) {
    case "component": {
      return;
    }
    case "htmlNode": {
      effect.props &&
        Object.keys(effect.props).forEach((prop) => {
          effect.accessor[prop] = effect.props[prop];
        });

      effect.handlers &&
        Object.keys(effect.handlers).forEach((handle) => {
          const eventType = handle.toLocaleLowerCase().substring(2);
          effect.accessor.addEventListener(eventType, effect.handlers[handle]);
        });
      return;
    }
    case "svgNode": {
      effect.props &&
        Object.keys(effect.props).forEach((prop) => {
          effect.accessor.setAttribute(prop, effect.props[prop]);
        });
      return;
    }
    case "textNode": {
      effect.props &&
        Object.keys(effect.props).forEach((prop) => {
          effect.accessor[prop] = effect.props[prop];
        });
      return;
    }
  }
}

// DIFF - DELETE
function deleteOldChild(childToDelete, parent) {
  const deletions = parent.deletions;
  if (deletions == null) {
    parent.deletions = [childToDelete];
    parent.flag = "DELETECHILD";
  } else {
    deletions.push(childToDelete);
  }
}

// COMMIT
function traverseAndCommitEffects(finishedTree) {
  commitEffect(finishedTree);
  // TODO: && subtreeFlags
  if (finishedTree.children) {
    finishedTree.children.forEach((child) => traverseAndCommitEffects(child));
  }
}

function commitEffect(effect) {
  if (effect.flag === "DELETECHILD") {
    effect.deletions.forEach((child) => {
      if (child.type === "component") {
        // relying on fce component having only one direct child
        return commitDelete(child.children[0].accessor, effect.accessor);
      }
      commitDelete(child.accessor, effect.accessor);
    });
    effect.deletions = null;
    effect.flag = null;
  }
  if (effect.flag === "CREATE") {
    const topAccessor = searchForHostParentAccessor(effect);
    commitRoot(effect, topAccessor);
    effect.flag = null;
  }
  if (effect.flag === "UPDATE") {
    commitUpdate(effect);
    effect.flag = null;
  }
}

function commitRoot(effect, parent) {
  let node = findAccessor(effect);
  parent.appendChild(node);
}

function commitDelete(child, parent) {
  parent.removeChild(child);
}

function commitUpdate(effect) {
  switch (effect.type) {
    case "component": {
      return null;
    }
    case "htmlNode": {
      effect.removeListeners &&
        Object.keys(effect.removeListeners).forEach((handle) => {
          const eventType = handle.toLocaleLowerCase().substring(2);
          effect.accessor.removeEventListener(
            eventType,
            effect.removeListeners[handle]
          );
        });
      effect.removeListeners = null;

      effect.props &&
        Object.keys(effect.props).forEach((prop) => {
          effect.accessor[prop] = effect.props[prop];
        });

      effect.handlers &&
        Object.keys(effect.handlers).forEach((handle) => {
          const eventType = handle.toLocaleLowerCase().substring(2);
          effect.accessor.addEventListener(eventType, effect.handlers[handle]);
        });
      effect.flag = null;

      return;
    }
    case "svgNode": {
      effect.props &&
        Object.keys(effect.props).forEach((prop) => {
          effect.accessor.setAttribute(prop, effect.props[prop]);
        });
      return;
    }
    case "textNode": {
      effect.props &&
        Object.keys(effect.props).forEach((prop) => {
          effect.accessor[prop] = effect.props[prop];
        });
      return;
    }
  }
}

function findAccessor(effect) {
  if (effect.accessor) {
    return effect.accessor;
  }
  // assumes that component effect has only one direct child
  let childEffect = effect.children.find((child) => child.accessor);
  if (!childEffect) {
    return findAccessor(effect.children);
  } else {
    return childEffect.accessor;
  }
}

// HELPERS
function makeNetworkRequest(handler) {
  console.log("request pending");
  setTimeout(() => {
    handler({
      x: Math.ceil(Math.random() * 160),
      y: Math.ceil(Math.random() * 40),
    });
  }, 2000);
}

// RUN
const root = document.querySelector("#root");
render(jsxApp, root);
// render(jsxAppTest, root);
