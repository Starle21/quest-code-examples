import { jsxAppTest } from "./test/14.reactAtoms.testComponents";
import {
  rootFiber,
  functionalFiber,
  arrayFiber,
} from "./test/14.reactAtoms.memoization";
// description of an result element {type: '', props: {}, children: [Fce, Fce]}, handlers: [Fce, Fce]}
// MEMOIZE HOST AND COMPONENT FCES into each individual
// STACK FRAME = FIBER, forming
// a LINKED LIST of fibers
// mount, update, delete, commit (visiting each fiber)
// only ever creating 2 refences - one for wip and one for current
// and creating only one array for each fiber
// so that pointers are kept the same between whole passes
// and event handlers can tap into the same fiber
// ---
let wipRoot = null;
let _Element;
let _hostContainer;

// DATA - WRITE - HOOK
let currentlyProcessedFiber;
let wipHookArray = null;
let pointer;

// if wipHookArray is null
// grab array
// otherwise create new

// does previous fiber already have array?
// if not create new
// otherwise grab it and save it into wipHookArray

// first mount ever - no previous hook array and no wip hook array
// second useState - grab previous array

// rerender grab previous array

export function useState(initial) {
  let newHook;
  let newState;
  let previousHookArray = currentlyProcessedFiber.alternate?.hook;
  let previousHook = currentlyProcessedFiber.alternate?.hook[pointer];

  // if first hook for current fiber
  if (previousHookArray == null && wipHookArray === null) {
    const newArray = [];
    currentlyProcessedFiber.hook = wipHookArray = newArray;
  } else if (wipHookArray === null && previousHookArray !== null) {
    wipHookArray = previousHookArray;
    currentlyProcessedFiber.hook = previousHookArray;
  }
  // if no hook in previous pass
  if (previousHook == null) {
    newState = typeof initial === "function" ? initial() : initial;
    newHook = { state: initial, queued: { pending: false, value: null } };
    wipHookArray[pointer] = newHook;
  } else {
    // update hook - take from queue, keep the queue
    newHook = { state: previousHook.state, queued: previousHook.queued };
    if (previousHook.queued.pending === true) {
      let newState = previousHook.queued.value;
      newState =
        typeof newState === "function"
          ? newState(previousHook.state)
          : newState;
      newHook.state = newState;
      previousHook.queued.pending = false;
      previousHook.queued.value = null;
    }
    wipHookArray[pointer] = newHook;
  }

  console.log(currentlyProcessedFiber.hook);
  console.log(currentlyProcessedFiber.hook[pointer].state);

  const state = currentlyProcessedFiber.hook[pointer].state;

  const createSetState = (fiber, pointer, queued) => (newState) => {
    console.log("set new value", newState);
    queued.pending = true;
    queued.value = newState;
    markUpdateFromFiberToRoot(fiber);
    render();
  };
  const setState = createSetState(
    currentlyProcessedFiber,
    pointer,
    newHook.queued
  );

  pointer++;
  return [state, setState];
}

function markUpdateFromFiberToRoot(sourceFiber) {
  sourceFiber.update = true;
  let alternate = sourceFiber.alternate;
  if (alternate !== null) {
    alternate.update = true;
  }
  parent = sourceFiber.return;
  alternate = parent.alternate;
  do {
    parent.childUpdate = true;
    if (alternate !== null) {
      alternate.childUpdate = true;
    }
    parent = parent.return;
  } while (parent !== null);
}

// -------------------------------------
// ELEMENTS / COMPONENTS
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
  const [side, setSide] = useState("");
  return () =>
    jsxContainer({ xCoord, yCoord, side, setXCoord, setYCoord, setSide });
};

const jsxContainer = ({
  xCoord,
  yCoord,
  side,
  setXCoord,
  setYCoord,
  setSide,
}) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: {},
    element: [
      () => jsxNetworkButton({ setXCoord, setYCoord, setSide }),
      () => jsxLabel({ name: "x" }),
      () => jsxInput({ name: "x", coord: xCoord, setCoord: setXCoord }),
      () => jsxLabel({ name: "y" }),
      () => jsxInput({ name: "y", coord: yCoord, setCoord: setYCoord }),
      () => jsxSvg({ x: xCoord, y: yCoord }),
      () => jsxCoordinate({ coord: xCoord, name: "x" }),
      () => jsxCoordinate({ coord: yCoord, name: "y" }),
      () => jsxCoordinate({ coord: side, name: "side" }),
    ],
  };
};

const jsxText = ({ nodeValue }) => {
  return {
    type: "textNode",
    domType: "text",
    props: { nodeValue },
    element: null,
  };
};

// only one setState
// batch and render after both setStates
// -- have a queue
// keep switching between this fiber and its alternate on every render change
const jsxNetworkButton = ({ setXCoord, setYCoord, setSide }) => {
  return {
    type: "htmlNode",
    domType: "button",
    props: {},
    element: () => jsxText({ nodeValue: "request remote data" }),
    handlers: {
      onClick: () => {
        makeNetworkRequest(({ x, y, side }) => {
          setXCoord(x);
          setYCoord(y);
          setSide(side);
          console.log("local data updated from remote source", x, y, side);
        });
      },
    },
  };
};

const jsxLabel = ({ name }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: {},
    element: () => jsxText({ nodeValue: `${name} coordinate:` }),
  };
};
const jsxInput = ({ name, coord, setCoord }) => {
  return {
    type: "htmlNode",
    domType: "input",
    props: { id: name, value: coord },
    element: null,
    handlers: {
      onInput: (e) => {
        setCoord(e.target.value);
      },
    },
  };
};
const jsxSvg = ({ x, y }) => {
  const element = x && y ? () => jsxSquare({ x, y }) : () => jsxAlert();
  return {
    type: "svgNode",
    domType: "svg",
    props: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
    element,
  };
};

const jsxAlert = () => {
  return {
    type: "svgNode",
    domType: "text",
    props: { x: "0", y: "40", class: "small" },
    element: () => jsxText({ nodeValue: "Fill out all inputs!" }),
  };
};
const jsxSquare = ({ x, y }) => {
  return {
    type: "svgNode",
    domType: "rect",
    props: { x, y, width: "30", height: "30" },
    element: null,
  };
};
const jsxCoordinate = ({ coord, name }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: {},
    element: () => jsxText({ nodeValue: `${name} coordinate is: ${coord}` }),
  };
};

// --------
// CREATE ROOT
const fiberRoot = {
  accessor: null,
  current: null,
  type: "root",
};
let currentRoot = {
  accessor: null,
  alternate: null,
  element: null,
  child: null,
  props: null,
  return: null,
  sibling: null,
  type: "root",
  update: false,
  childUpdate: false,
};
function createFiberAndHostRoot(hostAccessor) {
  fiberRoot.accessor = hostAccessor;
  fiberRoot.current = currentRoot;
  currentRoot.accessor = fiberRoot;
}
function createWipRoot(currentRoot, element) {
  let wipRoot = currentRoot.alternate;
  if (wipRoot === null) {
    wipRoot = {
      ...currentRoot,
      alternate: currentRoot,
      element,
    };
    currentRoot.alternate = wipRoot;
  } else {
    wipRoot.accessor = currentRoot.accessor;
    wipRoot.element = currentRoot.element;
    wipRoot.child = currentRoot.child;
    wipRoot.props = currentRoot.props;
    wipRoot.return = null;
    wipRoot.sibling = null;
    wipRoot.type = currentRoot.type;
    wipRoot.update = currentRoot.update;
    wipRoot.childUpdate = currentRoot.childUpdate;
  }
  return wipRoot;
}
// --------
// TOP LEVEL API
function render(Component, DOMRoot) {
  // initialization
  if (Component) _Element = Component;
  if (DOMRoot) {
    _hostContainer = DOMRoot;
    createFiberAndHostRoot(DOMRoot);
  }

  // MOUNT - dealing with create
  if (!wipRoot) {
    console.log("---");
    currentRoot.update = true;
    wipRoot = createWipRoot(currentRoot, _Element);
    wip = wipRoot;
    // go down and up - create fibers and accessors, append
    loop();
    // commit - traverse through the whole tree, do the flag effects
    traverseAndCommitEffects(wipRoot);
    fiberRoot.current = wipRoot;
    console.log("mount end fiberRoot", fiberRoot);
  }
  // RERENDER - dealing with create, update, delete
  else {
    console.log("---");
    currentRoot = fiberRoot.current;
    wipRoot = createWipRoot(currentRoot, _Element);
    wip = wipRoot;
    // go down and up - reconcile, tag update, delete, create, create accessors, append
    loop();

    traverseAndCommitEffects(wipRoot);
    fiberRoot.current = wipRoot;
    console.log("rerender end fiberRoot", fiberRoot);
  }
}

// MAIN LOOP
// wip effect - root { element: jsx(), children: null }
//   (there is always current root, created before, it never gets created it in the main loop)
// wip effect - functional { function: App(), children: null, element: null }
// wip effect - host { element: jsx(), children: null }
let wip;
function loop() {
  let nextWip;
  // calculation phase
  while (wip) {
    nextWip = goDown(wip);
    if (nextWip === null) {
      goUp(wip);
    } else {
      wip = nextWip;
    }
  }
}

// BEGIN
// goDown
// in: { parent fiber }
// out: { cloned old child fiber } or { reused old child fiber with newly calculated props } of { fresh new child fiber } or null
function goDown(wip) {
  console.warn("wip", wip);
  const current = wip.alternate;
  // diff fiber
  if (current !== null) {
    // passed in props that match
    const oldProps = current.props;
    const newProps = wip.props;
    console.log("equal props?", oldProps === newProps);

    if (newProps === oldProps) {
      // if there is no update on this fiber
      // no recalculation
      if (current.update === false) {
        // check if there are updates scheduled for children
        if (wip.childUpdate === false) {
          // bail from the whole subtree
          console.log("bail out from begin for the whole subtree");
          return null;
        } else {
          // copy over current pointers into new wip child fiber
          // child has scheduled updates, go to it
          const clonedCurrentChildFiber = updateFiber(
            current.child,
            current.child,
            wip
          );
          wip.child = clonedCurrentChildFiber;
          console.log("child fiber needs to be recalculated", wip);
          return wip.child;
        }
      }
      console.log("this fiber needs to be recalculated");
      current.update = false;
    }
  }
  // reset update
  wip.update = false;

  // get child effect
  let childEffect;
  if (
    wip.type === "root" ||
    wip.type === "htmlNode" ||
    wip.type === "svgNode" ||
    wip.type === "textNode"
  ) {
    if (wip.element === null) {
      wip.child = null;
      return null;
    }
    // run jsx()
    if (wip.element instanceof Array) {
      childEffect = wip.element
        .filter((child) => child)
        .map((el) => {
          return el();
        });
    } else {
      childEffect = wip.element();
    }
  }
  if (wip.type === "component") {
    currentlyProcessedFiber = wip;
    pointer = 0;
    wipHookArray = null;
    wip.hook = null;

    // run Component()
    const childJsx = wip.function();
    if (childJsx === null) {
      return null;
    }
    // run jsx()
    childEffect = childJsx();
    currentlyProcessedFiber = null;
    console.log("childEffect", childEffect);
  }

  // reconcile child effect with the previous version
  // old child fiber exists
  if (current === null) {
    // no CREATE flags when it is just a child of subroot
    wip.child = reconcileChildFibers(childEffect, null, wip, false);
  } else {
    // place CREATE flags on subroot fibers
    wip.child = reconcileChildFibers(childEffect, current.child, wip, true);
  }
  return wip.child;
}

function reconcileChildFibers(newEffect, oldFiber, returnFiber, subroot) {
  if (newEffect instanceof Array) {
    return reconcileChildArray(oldFiber, newEffect, returnFiber, subroot);
  } else {
    return reconcileSingleChild(oldFiber, newEffect, returnFiber, subroot);
  }
}

function reconcileSingleChild(currentFiber, childEffect, returnFiber, subroot) {
  console.log("reconcile single", childEffect);
  const oldFiber = currentFiber;
  if (oldFiber !== null) {
    if (
      oldFiber.type === childEffect.type &&
      oldFiber.domType === childEffect.domType
    ) {
      // delete remaining children - check for currentFiber.sibling
      deleteOldChildren(oldFiber.sibling, returnFiber);
      const updatedFiber = updateFiber(currentFiber, childEffect, returnFiber);
      placeChild(updatedFiber, subroot);

      return updatedFiber;
    } else {
      // didn't match, so delete and create below
      deleteOldChildren(oldFiber, returnFiber);
    }
  }
  // create new fiber, there is no old fiber
  const newFiber = createNewFiber(childEffect, returnFiber);
  placeChild(newFiber, subroot);
  return newFiber;
}

function reconcileChildArray(currentFiber, childEffect, returnFiber, subroot) {
  console.log("reconcile array", childEffect);
  let oldFiber = currentFiber;
  let newChildFiber = null;
  let previousNewChildFiber = null;
  let newFirstChildFiber = null;
  let idx = 0;

  while (oldFiber !== null && idx < childEffect.length) {
    // update - compare
    if (
      oldFiber.type === childEffect[idx].type &&
      oldFiber.domType === childEffect[idx].domType
    ) {
      // reuse existing fiber fields
      newChildFiber = updateFiber(oldFiber, childEffect[idx], returnFiber);
      oldFiber.alternate = newChildFiber;
      placeChild(newChildFiber, subroot);
    } else {
      // or delete and create
      deleteOldChild(oldFiber, returnFiber);
      newChildFiber = createNewFiber(childEffect[idx], returnFiber);
      oldFiber.alternate = newChildFiber;
      placeChild(newChildFiber, subroot);
    }
    if (newFirstChildFiber === null) {
      newFirstChildFiber = newChildFiber;
    } else {
      previousNewChildFiber.sibling = newChildFiber;
    }
    previousNewChildFiber = newChildFiber;
    oldFiber = oldFiber.sibling;
    idx++;
  }
  // delete rest of old fibers
  if (oldFiber !== null && idx === childEffect.length) {
    deleteOldChildren(oldFiber, returnFiber);
    return newFirstChildFiber;
  }
  // create new fibers
  if (oldFiber === null) {
    for (; idx < childEffect.length; idx++) {
      newChildFiber = createNewFiber(childEffect[idx], returnFiber);
      placeChild(newChildFiber, subroot);
      if (newFirstChildFiber === null) {
        newFirstChildFiber = newChildFiber;
      } else {
        previousNewChildFiber.sibling = newChildFiber;
      }
      previousNewChildFiber = newChildFiber;
    }
  }
  return newFirstChildFiber;
}

function placeChild(newFiber, subroot) {
  if (subroot && newFiber.alternate === null) {
    newFiber.flag = "CREATE";
  }
}

function createNewFiber(effect, parentFiber) {
  return {
    ...effect,
    alternate: null,
    child: null,
    sibling: null,
    return: parentFiber,
    accessor: null,
    deletions: null,
    update: false,
    childUpdate: false,
    hook: null,
  };
}

function updateFiber(currentFiber, childEffect, returnFiber) {
  let wip = currentFiber.alternate;
  if (wip === null) {
    wip = {
      ...childEffect,
      type: currentFiber.type,
      domType: currentFiber.domType,
      accessor: currentFiber.accessor,
      alternate: currentFiber,
      child: currentFiber.child,
      sibling: null,
      return: returnFiber,
      hook: currentFiber.hook,
      deletions: currentFiber.deletions,
      update: currentFiber.update,
      childUpdate: currentFiber.childUpdate,
    };
    currentFiber.alternate = wip;
  } else {
    wip.props = childEffect.props;
    wip.element = childEffect.element;
    wip.handlers = childEffect.handlers;
    wip.type = currentFiber.type;
    wip.domType = currentFiber.domType;
    wip.accessor = currentFiber.accessor;
    wip.child = currentFiber.child;
    wip.sibling = null;
    wip.hook = currentFiber.hook;
    wip.deletions = currentFiber.deletions;
    wip.update = currentFiber.update;
    wip.childUpdate = currentFiber.childUpdate;
    wip.return = returnFiber;
  }
  return wip;
}

// COMPLETE
// creating accessors for host fibers
// appending into dom tree
function goUp(completedWork) {
  let next = null;
  do {
    console.log("complete", completedWork);
    let current = completedWork.alternate;
    let returnFiber = completedWork.return;

    switch (completedWork.type) {
      case "root": {
        // completed whole tree - end complete phase
        console.log("goUp completed", completedWork);
        break;
      }
      case "component": {
        // noop
        break;
      }
      case "htmlNode": {
        // if oldProps !== newProps -> FLAG UPDATE
        if (current !== null && completedWork.accessor != null) {
          console.log("props old new", current.props, completedWork.props);
          console.log("equal", current.props === completedWork.props);
          if (
            JSON.stringify(current.props) ===
              JSON.stringify(completedWork.props) &&
            completedWork.handlers === current.handlers
          ) {
            break;
          }
          completedWork.flag = "UPDATE";
        } else {
          let node = document.createElement(completedWork.domType);
          completedWork.accessor = node;
          setInitialDOMProperties(completedWork);
          appendAllChildren(completedWork);
        }
        break;
      }
      case "svgNode": {
        if (current !== null && completedWork.accessor != null) {
          if (
            JSON.stringify(current.props) ===
              JSON.stringify(completedWork.props) &&
            completedWork.handlers === current.handlers
          ) {
            break;
          }
          completedWork.flag = "UPDATE";
        } else {
          let node = document.createElementNS(
            "http://www.w3.org/2000/svg",
            completedWork.domType
          );
          completedWork.accessor = node;
          setInitialDOMProperties(completedWork);
          appendAllChildren(completedWork);
        }

        break;
      }
      case "textNode": {
        if (current !== null && completedWork.accessor != null) {
          if (current.props.nodeValue === completedWork.props.nodeValue) {
            break;
          }

          completedWork.flag = "UPDATE";
        } else {
          let node = document.createTextNode("");
          completedWork.accessor = node;
          setInitialDOMProperties(completedWork);
        }
        break;
      }
    }

    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      wip = siblingFiber;
      return;
    }

    completedWork = returnFiber;

    wip = completedWork;
  } while (completedWork !== null);
  console.log("goUp root was reached");
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

function appendAllChildren(completedWork) {
  let toAppend = completedWork.child;
  while (toAppend !== null) {
    if (
      toAppend.type === "htmlNode" ||
      toAppend.type === "textNode" ||
      toAppend.type === "svgNode"
    ) {
      completedWork.accessor.appendChild(toAppend.accessor);
    } else if (toAppend.child !== null) {
      toAppend = toAppend.child;
      continue;
    }
    if (toAppend === completedWork) {
      return;
    }
    while (toAppend.sibling === null) {
      if (toAppend.return === null || toAppend.return === completedWork) {
        return;
      }
      toAppend = toAppend.return;
    }
    toAppend = toAppend.sibling;
  }
}

function deleteOldChildren(childToDelete, parent) {
  while (childToDelete) {
    deleteOldChild(childToDelete, parent);
    childToDelete = childToDelete.sibling;
  }
}
function deleteOldChild(childToDelete, parent) {
  const deletions = parent.deletions;
  if (deletions == null) {
    parent.deletions = [childToDelete];
    parent.flag = "DELETECHILD";
  } else {
    deletions.push(childToDelete);
  }
}

// -------------------------------------------------------------------------------
// COMMIT
function traverseAndCommitEffects(finishedTree) {
  // TODO: add subtreeFlags
  let commitChild = finishedTree.child;
  let parent;
  let next;
  // depth first recursion on linked list
  while (commitChild !== null) {
    next = commitEffect(commitChild);
    if (next !== null) {
      commitChild = next;
    } else {
      parent = commitChild.return;
      commitChild = null;
      do {
        if (parent.sibling !== null) {
          commitChild = parent.sibling;
          break;
        } else {
          parent = parent.return;
        }
      } while (parent !== null);
    }
  }
  finishedTree.alternate.childUpdate = false;
  finishedTree.childUpdate = false;
  console.log("commit reached back the top");
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
  let child = effect.child;
  if (child !== null) {
    return child;
  } else {
    return effect.sibling;
  }
  effect.childUpdate = false;
  if (effect.alternate) effect.alternate.childUpdate = false;
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
      effect.alternate.handlers &&
        Object.keys(effect.alternate.handlers).forEach((handle) => {
          const eventType = handle.toLocaleLowerCase().substring(2);
          effect.alternate.accessor.removeEventListener(
            eventType,
            effect.alternate.handlers[handle]
          );
        });

      // TODO: nice to have - filter out non dom props so they don't get placed in dom node
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

function searchForHostParentAccessor(effect) {
  const parent = effect.return;
  const parentAccessor = parent.accessor;

  if (parent.type === "root") {
    return parentAccessor.accessor;
  }

  if (!parentAccessor) {
    return searchForHostParentAccessor(parent);
  }
  return parentAccessor;
}

function findAccessor(effect) {
  if (effect.accessor) {
    return effect.accessor;
  }
  // assumes that component effect has only one direct child
  let childEffect = effect.child.accessor;
  if (!childEffect) {
    return findAccessor(effect.child);
  } else {
    return childEffect;
  }
}

// HELPERS
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

// RUN
const root = document.querySelector("#root");
render(jsxApp, root);
// render(jsxAppTest, root);

// ---------------------------------------------------------------------------------------------
// TESTS
// const resultRoot = goDown(rootFiber);
// console.log("resultRoot", resultRoot);
// --
// const resultHost = goDown(functionalFiber);
// console.log("resultHost", resultHost);
// --
// const resultArray = goDown(arrayFiber);
// console.log("resultHost", resultArray);
// --
// const rootExplainerApp = goDown(topmostFiber);
// console.log("rootExplainerApp", rootExplainerApp);
// // --
// const explainerApp = goDown(rootExplainerApp);
// console.log("explainerApp", explainerApp);
// // --
// const div = goDown(explainerApp);
// console.log("div", div);
// --
