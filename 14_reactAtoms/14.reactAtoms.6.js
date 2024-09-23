// description of an result element {type: '', props: {}, children: [Fce, Fce]}, handlers: [Fce, Fce]}
// CLEAR DUPLICATE CODE
// ---
let wipVDOM;
let currentVDOM;

// DATA - WRITE - HOOK
let _values = [];
let pointer = 0;
function useState(initial) {
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
// for testing
export const SvgMultiple = ({ x, y }) => {
  const element = x && y ? () => Square({ x, y }) : () => Text();
  return {
    type: "svgNode",
    domType: "svg",
    props: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
    children: [element, element],
  };
};

export const Deep = ({ coord, name }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    children: [NestedInDeep],
  };
};
const NestedInDeep = () => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    children: [
      () => Coordinate({ coord: 10, name: "zz" }),
      () => Coordinate({ coord: 10, name: "zz" }),
    ],
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
    diff([wipVDOM], null);
    // apply effects - changes with respect to current state (null)
    commitEffects([wipVDOM]);
  }
  // RERENDER - dealing with create, update, delete
  else {
    // keep old fibers
    currentVDOM = wipVDOM;
    // convert elements into new effects, memoized functions which get the same args are not recalculated - incremental
    wipVDOM = createVDOM(_Component, _currentRoot);
    // diff new effects with old fibers, tag changes
    diff([wipVDOM], [currentVDOM]);
    // apply effects - changes with respect to current state (previous output)
    commitEffects([wipVDOM]);
  }
}

// GATHER COMPONENTS, EFFECTS TOGETHER
// args: component : fce, parent dom accessor
// returns: effects : objs tree
export const createVDOM = (component, parent) => {
  let effect = component();
  effect.return = parent;
  if (effect.children instanceof Array) {
    const children = effect.children.map((el) => {
      return createVDOM(el, effect);
    });
    effect.children = children;
    effect.return = parent;
    return effect;
  }
  return effect;
};

// DIFF FOR CREATE, UPDATE, DELETE - NO OUTSIDE DIFFERENCE BETWEEN CREATE AND UDPATE
function diff(newArray, oldArray) {
  // MOUNT - if current null - only create
  if (!currentVDOM) {
    const effect = newArray[0];
    createDOMNodes(effect);
    effect.flag = "CREATE";
  }
  // RERENDER - if current exists - create, update, delete
  else {
    newArray.forEach((newEffect, index) => {
      const oldEffect = oldArray && oldArray[index];
      if (newEffect.children) {
        reconcileChildren(newEffect.children, oldEffect.children, newEffect);
        diff(newEffect.children, oldArray[index].children);
      }
    });
  }
}

// RECONCILE DIFFERENCES
// TODO: create tag - make sure, it only gets created on the top subroot node
export function reconcileChildren(newChildren, oldChildren, newParent) {
  // TODO: what if child is a functional component and does not have accessor?
  let idx = 0;
  for (; oldChildren && oldChildren[idx] && idx < newChildren.length; idx++) {
    if (newChildren[idx].domType === oldChildren[idx].domType) {
      // update
      newChildren[idx].accessor = oldChildren[idx].accessor;
      if (
        JSON.stringify(newChildren[idx].props) !==
        JSON.stringify(oldChildren[idx].props)
      ) {
        newChildren[idx].flag = "UPDATE";
      }
      // TODO: what if props are the same and children are different?
    } else {
      // delete and create
      deleteOldChild(oldChildren[idx], newParent);
      createDOMNodes(newChildren[idx]);
      newChildren[idx].flag = "CREATE";
    }
  }
  // new children array has less elements
  if (oldChildren && oldChildren[idx] && idx === newChildren.length) {
    for (; idx < oldChildren.length; idx++) {
      deleteOldChild(oldChildren[idx], newParent);
    }
    return;
  }
  // new children array has more elements
  if (oldChildren && oldChildren[idx] == undefined && newChildren[idx]) {
    for (; idx < newChildren.length; idx++) {
      createDOMNodes(newChildren[idx]);
      newChildren[idx].flag = "CREATE";
    }
  }
  return newChildren;
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

  // appendToParent
  // if parent null? if child null?
  const parentContainer = effect.return.accessor
    ? effect.return.accessor
    : searchForHostParentAccessor(effect);

  if (parentContainer && effect.accessor && parentContainer !== _currentRoot)
    appendToParent(effect.accessor, parentContainer);
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

function searchForHostParentAccessor(effect) {
  // TODO: what if parent does not have accessor? - (now there can't be 2 functional component one after the other, but what if?)
  const childEffect = effect;
  const parent = effect.return;
  const parentContainer = parent.return;
  return parentContainer;
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
function commitEffects(finishedTree) {
  finishedTree.forEach((effect, index) => {
    if (effect.flag === "DELETECHILD") {
      effect.deletions.forEach((child) => {
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
    // FIXME: && subtreeFlags
    if (effect.children) {
      commitEffects(effect.children);
    }
  });
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
