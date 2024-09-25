import { AppTest } from "./test/14.reactAtoms.testComponents";
// description of an result element {type: '', props: {}, children: [Fce, Fce]}, handlers: [Fce, Fce]}
// WORKS FOR NESTED FUNCTION COMPONENTS
// ---
let wipVDOM;
let currentVDOM;

// DATA - WRITE - HOOK
let _values = [];
let pointer = 0;
export function useState(initial) {
  let state = _values[pointer] || initial;
  let _pointer = pointer;
  const setValue = (newValue) => {
    _values[_pointer] = newValue;
    render();
  };
  pointer++;
  return [state, setValue];
}

// ELEMENTS / COMPONENTS
export const App = () => {
  const [xCoord, setXCoord] = useState("");
  const [yCoord, setYCoord] = useState("");
  return {
    type: "component",
    domType: null,
    props: null,
    children: [() => Container({ xCoord, yCoord, setXCoord, setYCoord })],
  };
};

const Container = ({ xCoord, yCoord, setXCoord, setYCoord }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    children: [
      () => NetworkButton({ setXCoord, setYCoord }),
      () => Label({ name: "x" }),
      () => Input({ name: "x", coord: xCoord, setCoord: setXCoord }),
      () => Label({ name: "y" }),
      () => Input({ name: "y", coord: yCoord, setCoord: setYCoord }),
      () => Svg({ x: xCoord, y: yCoord }),
      () => Coordinate({ coord: xCoord, name: "x" }),
      () => Coordinate({ coord: yCoord, name: "y" }),
    ],
  };
};

const Text = ({ nodeValue }) => {
  return {
    type: "textNode",
    domType: "text",
    props: { nodeValue },
    children: null,
  };
};

const NetworkButton = ({ setXCoord, setYCoord }) => {
  return {
    type: "htmlNode",
    domType: "button",
    props: null,
    children: [() => Text({ nodeValue: "request remote data" })],
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
const Label = ({ name }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    children: [() => Text({ nodeValue: `${name} coordinate:` })],
  };
};
const Input = ({ name, coord, setCoord }) => {
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
export const Svg = ({ x, y }) => {
  const element = x && y ? () => Square({ x, y }) : () => Alert();
  return {
    type: "svgNode",
    domType: "svg",
    props: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
    children: [element],
  };
};

const Alert = () => {
  return {
    type: "svgNode",
    domType: "text",
    props: { x: "0", y: "40", class: "small" },
    children: [() => Text({ nodeValue: "Fill out all inputs!" })],
  };
};
const Square = ({ x, y }) => {
  return {
    type: "svgNode",
    domType: "rect",
    props: { x, y, width: "30", height: "30" },
    children: null,
  };
};
export const Coordinate = ({ coord, name }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    children: [() => Text({ nodeValue: `${name} coordinate is: ${coord}` })],
  };
};

// TOP LEVEL API
let _Component;
let _currentRoot;
function render(Component, DOMRoot) {
  // initialization
  if (Component) _Component = Component;
  if (DOMRoot) _currentRoot = DOMRoot;
  pointer = 0;

  // MOUNT - dealing with create
  if (!wipVDOM) {
    // convert elements into effects
    wipVDOM = createVDOM(_Component, _currentRoot);
    // convert effects into accessors - fibers (mounted stateful stack frame)
    diff(wipVDOM, null, currentVDOM);
    // console.log("mount accessors", wipVDOM);
    // apply effects - changes with respect to current state (null)
    traverseAndCommitEffects(wipVDOM);
    // console.log("after first mount", wipVDOM);
  }
  // RERENDER - dealing with create, update, delete
  else {
    // keep old fibers
    currentVDOM = wipVDOM;
    // convert elements into new effects, memoized functions which get the same args are not recalculated - incremental
    wipVDOM = createVDOM(_Component, _currentRoot);
    // diff new effects with old fibers, tag changes
    diff(wipVDOM, currentVDOM, currentVDOM);
    // console.log("new vdom", wipVDOM);
    // apply effects - changes with respect to current state (previous output)
    traverseAndCommitEffects(wipVDOM);
    // console.log("after rerender", wipVDOM);
    // console.log("--");
  }
}

// GATHER COMPONENTS, EFFECTS TOGETHER
// args: component : fce, parent dom accessor
// returns: effects : objs tree
export const createVDOM = (component, parent) => {
  if (!(component instanceof Function)) {
    return null;
  }
  // jsx()
  let effect = component();
  effect.return = parent;
  if (effect.children instanceof Array) {
    const children = effect.children
      .map((el) => {
        return createVDOM(el, effect);
      })
      .filter((child) => child != null);

    effect.children = children;
    effect.return = parent;
    return effect;
  }
  return effect;
};

// DIFF FOR CREATE, UPDATE, DELETE - NO OUTSIDE DIFFERENCE BETWEEN CREATE AND UDPATE
export function diff(newEffect, oldEffect, currentVDOM) {
  // MOUNT - if current null - only create
  if (!currentVDOM) {
    currentTopLevelParentAccessor = _currentRoot;
    createDOMNodes(newEffect);
    newEffect.flag = "CREATE";
  }
  // RERENDER - if current exists - create, update, delete
  else {
    diffChildren(newEffect, oldEffect);
  }
}

function diffChildren(newEffect, oldEffect) {
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
let currentTopLevelParentAccessor;
// TODO: create tag - make sure, it only gets created on the top subroot node
function reconcile(newEl, oldEl, newParent) {
  // TODO: what if child is a functional component and does not have accessor?

  if (newEl && oldEl) {
    if (newEl.domType === oldEl.domType) {
      newEl.accessor = oldEl.accessor;
      if (JSON.stringify(newEl.props) !== JSON.stringify(oldEl.props)) {
        newEl.flag = "UPDATE";
      }
      diffChildren(newEl, oldEl);
    } else {
      deleteOldChild(oldEl, newParent);
      currentTopLevelParentAccessor = newParent.accessor ?? newParent.return;
      createDOMNodes(newEl);
      newEl.flag = "CREATE";
    }
  }
  if (newEl && !oldEl) {
    currentTopLevelParentAccessor = newParent.accessor;
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

  // if parent null? if child null?
  const parentContainer = effect.return.accessor
    ? effect.return.accessor
    : searchForHostParentAccessor(effect);

  if (
    parentContainer &&
    effect.accessor &&
    parentContainer !== currentTopLevelParentAccessor
  )
    appendToParent(effect.accessor, parentContainer);
}

function searchForHostParentAccessor(effect) {
  // TODO: what if parent does not have accessor? - (now there can't be 2 functional component one after the other, but what if?)
  const childEffect = effect;
  const parent = effect.return;
  if (parent === _currentRoot) {
    return parent;
  }
  const parentContainer = parent.accessor;

  if (!parentContainer) {
    return searchForHostParentAccessor(parent);
  }
  return parentContainer;
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

function appendToParent(child, parent) {
  parent.appendChild(child);
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
  // FIXME: && subtreeFlags
  if (finishedTree.children) {
    finishedTree.children.forEach((child) => traverseAndCommitEffects(child));
  }
}

function commitEffect(effect) {
  if (effect.flag === "DELETECHILD") {
    effect.deletions.forEach((child) => {
      if (child.type === "component") {
        return commitDelete(child.children[0].accessor, effect.accessor);
      }
      commitDelete(child.accessor, effect.accessor);
    });
    effect.deletions = null;
    effect.flag = null;
  }
  if (effect.flag === "CREATE") {
    if (effect.return === _currentRoot) {
      commitRoot(effect, effect.return);
    } else commitRoot(effect, effect.return.accessor);
    effect.flag = null;
  }
  if (effect.flag === "UPDATE") {
    commitUpdate(effect);
    effect.flag = null;
  }
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

function commitRoot(effect, parent) {
  let node = findAccessor(effect);
  parent.appendChild(node);
}

function findAccessor(effect) {
  if (effect.accessor) {
    return effect.accessor;
  }
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
render(App, root);
// render(AppTest, root);
