import { jsxTop, jsxAppTest } from "./test/14.reactAtoms.testComponents.2";
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
// jsx function (component or host) passed as a prop - so that it doesn't get rerendered
// host elements do not get non-dom props
// calling jsx right away when calling functional components

// -------------------------------------------------------------------------------
// -------------------------------------------------------------------------------
let wipRoot = null;
let _topmostEffect;
let _hostContainer;

// -------------------------------------------------------------------------------
// DATA - WRITE - HOOK
let currentlyProcessedFiber;
let wipHookArray = null;
let pointer;

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

// -------------------------------------------------------------------------------
// ELEMENTS / COMPONENTS
const jsxApp = ({ children }) => {
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

// -------------------------------------------------------------------------------
// CREATE ROOT
const fiberRoot = {
  accessor: null,
  current: null,
  type: "root",
};
let currentRoot = {
  accessor: null,
  alternate: null,
  childEffect: null,
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
function createWipRoot(currentRoot, childEffect) {
  let wipRoot = currentRoot.alternate;
  if (wipRoot === null) {
    wipRoot = {
      ...currentRoot,
      alternate: currentRoot,
      childEffect,
    };
    currentRoot.alternate = wipRoot;
  } else {
    wipRoot.accessor = currentRoot.accessor;
    wipRoot.childEffect = currentRoot.childEffect;
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

// -------------------------------------------------------------------------------
// TOP LEVEL API
function render(Effect, DOMRoot) {
  // initialization
  if (Effect) _topmostEffect = Effect;
  if (DOMRoot) {
    _hostContainer = DOMRoot;
    createFiberAndHostRoot(DOMRoot);
  }

  // MOUNT - dealing with create
  if (!wipRoot) {
    console.log("---");
    currentRoot.update = true;
    wipRoot = createWipRoot(currentRoot, _topmostEffect);
    wip = wipRoot;
    // go down and up - create fibers and accessors, append
    loop();
    // commit - traverse through the whole tree, do the flag effects

    console.log("wipRoot before commit", wipRoot);
    traverseAndCommitEffects(wipRoot);
    fiberRoot.current = wipRoot;
    console.log("mount end fiberRoot", fiberRoot);
    console.log("---");
  }
  // RERENDER - dealing with create, update, delete
  else {
    console.log("---");
    currentRoot = fiberRoot.current;
    wipRoot = createWipRoot(currentRoot);
    wip = wipRoot;
    // go down and up - reconcile, tag update, delete, create, create accessors, append
    loop();

    console.log("wipRoot before commit", wipRoot);
    traverseAndCommitEffects(wipRoot);
    fiberRoot.current = wipRoot;
    console.log("rerender end fiberRoot", fiberRoot);
    console.log("---");
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
// -------------------------------------------------------------------------------
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
          let child = wip.child;
          while (child !== null) {
            child.return = wip;
            child = child.sibling;
          }
          return null;
        } else {
          // copy over current pointers into new wip child fiber
          // child has scheduled updates, go to it
          const clonedChild = cloneFiber(current.child, wip);

          wip.child = clonedChild;
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
  if (wip.type === "root") {
    if (wip.childEffect === null) {
      wip.child = null;
      return null;
    }
    // run jsx()
    if (wip.childEffect instanceof Array) {
      childEffect = wip.childEffect.filter((effect) => effect);
    } else {
      childEffect = wip.childEffect;
    }
  }
  if (
    wip.type === "htmlNode" ||
    wip.type === "svgNode" ||
    wip.type === "textNode"
  ) {
    if (wip.props.children === null) {
      wip.child = null;
      return null;
    }
    if (wip.props.children instanceof Array) {
      childEffect = wip.props.children.filter((effect) => effect);
    } else {
      childEffect = wip.props.children;
    }
  }
  if (wip.type === "component") {
    currentlyProcessedFiber = wip;
    pointer = 0;
    wipHookArray = null;
    wip.hook = null;
    const props = wip.props;

    // run Component()
    childEffect = wip.function(props);

    if (childEffect === null) {
      wip.child = null;
      return null;
    }

    currentlyProcessedFiber = null;
  }
  console.log("childEffect", childEffect);

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
      markChildrenToDelete(oldFiber.sibling, returnFiber);
      const updatedFiber = updateFiber(currentFiber, childEffect, returnFiber);
      markChildPlacement(updatedFiber, subroot);

      return updatedFiber;
    } else {
      // didn't match, so delete and create below
      markChildrenToDelete(oldFiber, returnFiber);
    }
  }
  // create new fiber, there is no old fiber
  const newFiber = createNewFiber(childEffect, returnFiber);
  markChildPlacement(newFiber, subroot);
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
      markChildPlacement(newChildFiber, subroot);
    } else {
      // or delete and create
      markChildToDelete(oldFiber, returnFiber);
      newChildFiber = createNewFiber(childEffect[idx], returnFiber);
      oldFiber.alternate = newChildFiber;
      markChildPlacement(newChildFiber, subroot);
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
    markChildrenToDelete(oldFiber, returnFiber);
    return newFirstChildFiber;
  }
  // create new fibers
  if (oldFiber === null) {
    for (; idx < childEffect.length; idx++) {
      newChildFiber = createNewFiber(childEffect[idx], returnFiber);
      markChildPlacement(newChildFiber, subroot);
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

function markChildPlacement(newFiber, subroot) {
  if (subroot && newFiber.alternate === null) {
    newFiber.flag = "CREATE";
  }
}

function markChildrenToDelete(childToDelete, parent) {
  while (childToDelete) {
    markChildToDelete(childToDelete, parent);
    childToDelete = childToDelete.sibling;
  }
}
function markChildToDelete(childToDelete, parent) {
  const deletions = parent.deletions;
  if (deletions == null) {
    parent.deletions = [childToDelete];
    parent.flag = "DELETECHILD";
  } else {
    deletions.push(childToDelete);
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
    wip.childEffect = childEffect.childEffect;
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

function cloneFiber(fiber, returnFiber) {
  let child = fiber;
  let clonedFirstChildFiber = null;
  let clonedChildFiber = null;
  let clonedPreviousChildFiber = null;
  console.log("fiber to clone", fiber);
  while (child !== null) {
    clonedChildFiber = updateFiber(child, child, returnFiber);
    if (clonedFirstChildFiber === null) {
      clonedFirstChildFiber = clonedChildFiber;
    } else {
      clonedPreviousChildFiber.sibling = clonedChildFiber;
    }
    clonedPreviousChildFiber = clonedChildFiber;
    child = child.sibling;
  }
  return clonedFirstChildFiber;
}

// -------------------------------------------------------------------------------
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
            JSON.stringify(completedWork.props)
          ) {
            break;
          }
          markUpdate(completedWork);
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
            JSON.stringify(completedWork.props)
          ) {
            break;
          }
          markUpdate(completedWork);
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

          markUpdate(completedWork);
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

function markUpdate(fiber) {
  fiber.flag = fiber.flag === "DELETECHILD" ? "DELETEANDUPDATE" : "UPDATE";
}

function setInitialDOMProperties(effect) {
  let domPropsKeys = [];
  let handlers = [];
  domPropsKeys =
    effect.props &&
    Object.keys(effect.props).filter(
      (key) => key !== "children" && !key.startsWith("on")
    );
  handlers =
    effect.props &&
    Object.keys(effect.props).filter((key) => key.startsWith("on"));

  switch (effect.type) {
    case "component": {
      return;
    }
    case "htmlNode": {
      domPropsKeys.forEach((key) => {
        effect.accessor[key] = effect.props[key];
      });

      handlers.forEach((handle) => {
        const eventType = handle.toLocaleLowerCase().substring(2);
        effect.accessor.addEventListener(eventType, effect.props[handle]);
      });
      return;
    }
    case "svgNode": {
      domPropsKeys.forEach((key) => {
        effect.accessor.setAttribute(key, effect.props[key]);
      });
      return;
    }
    case "textNode": {
      domPropsKeys.forEach((key) => {
        effect.accessor[key] = effect.props[key];
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

// COMMIT EFFECT
// start at the host root
// check deletions, process them if there are any
// are there subtree flags?
//// while there is sibling
//// if there are, call COMMIT EFFECT with child
// if there are not, stay at this fiber
// commit placement if there are any
// commit update if there are any

function commitEffect(effect) {
  if (effect.flag === "DELETECHILD" || effect.flag === "DELETEANDUPDATE") {
    effect.deletions.forEach((child) => {
      if (child.type === "component") {
        // relying on fce component having only one direct child
        return commitDelete(child.children[0].accessor, effect.accessor);
      }
      commitDelete(child.accessor, effect.accessor);
    });
    effect.deletions = null;
    effect.flag = effect.flag === "DELETEANDUPDATE" ? "UPDATE" : null;
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
  effect.childUpdate = false;
  if (effect.alternate) effect.alternate.childUpdate = false;
  let child = effect.child;
  if (child !== null) {
    return child;
  } else {
    return effect.sibling;
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
  let domPropsKeys = [];
  let handlerKeys = [];
  let oldHandlers = [];
  domPropsKeys =
    effect.props &&
    Object.keys(effect.props).filter(
      (key) => key !== "children" && !key.startsWith("on")
    );
  handlerKeys =
    effect.props &&
    Object.keys(effect.props).filter((key) => key.startsWith("on"));
  oldHandlers =
    effect.alternate.props &&
    Object.keys(effect.alternate.props).filter((key) => key.startsWith("on"));

  switch (effect.type) {
    case "component": {
      return null;
    }
    case "htmlNode": {
      oldHandlers.forEach((handleKey) => {
        const eventType = handleKey.toLocaleLowerCase().substring(2);
        effect.alternate.accessor.removeEventListener(
          eventType,
          effect.alternate.props[handleKey]
        );
      });

      domPropsKeys.forEach((key) => {
        effect.accessor[key] = effect.props[key];
      });

      handlerKeys.forEach((handleKey) => {
        const eventType = handleKey.toLocaleLowerCase().substring(2);
        effect.accessor.addEventListener(eventType, effect.props[handleKey]);
      });

      return;
    }
    case "svgNode": {
      domPropsKeys.forEach((key) => {
        effect.accessor.setAttribute(key, effect.props[key]);
      });
      return;
    }
    case "textNode": {
      domPropsKeys.forEach((key) => {
        effect.accessor[key] = effect.props[key];
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

// -------------------------------------------------------------------------------
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

// -------------------------------------------------------------------------------
// RUN
const root = document.querySelector("#root");
render(jsxApp({ children: jsxImplicitMemo() }), root);
// render(jsxTop(), root);
// render(jsxAppTest({ num: 100 }), root);

//-------------------------------------------------------------------------------

// view = f(data)
// data - outside component = props, inside component = state
// component = f(props * state)
// component
// - type, mapping definition,
// - props = outside data passed to children data, self data,
// - state = inside data

// ------------------
// childEffect types - {}, [{},{}], null, ''
// ------------------
