import { jsxAppTest } from "./test/14.reactAtoms.testComponents";
import {
  rootFiber,
  functionalFiber,
  arrayFiber,
} from "./test/14.reactAtoms.memoization";
// description of an result element {type: '', props: {}, children: [Fce, Fce]}, handlers: [Fce, Fce]}
// MEMOIZE JSX AND COMPONENT FCES
// STACK FRAME = FIBER
// LINKED LIST
// ---
let currentRoot;
let wipRoot;
let _Component;
let _currentRoot;
let currentTopLevelParentAccessor;
let currentFiber;
let pointer;
let update;

// DATA - WRITE - HOOK
export function useState(initial) {
  console.log("hook", currentFiber.hook.state[pointer]);

  if (currentFiber.hook.state[pointer] == undefined) {
    currentFiber.hook.state[pointer] = initial;
  }

  const state = currentFiber.hook.state[pointer];
  currentFiber.hook.queue[pointer] = state;

  const dispatch = (fiber, pointer) => {
    return (newState) => {
      console.log("set new value", newState);
      fiber.hook.queue[pointer] = newState;
      markUpdateFromFiberToRoot(fiber);
      render();
    };
  };
  const setState = dispatch(currentFiber, pointer);

  pointer++;
  return [state, setState];
}

function markUpdateFromFiberToRoot(sourceFiber) {
  sourceFiber.update = true;
  parent = sourceFiber.return;
  do {
    parent.childUpdate = true;
    parent = parent.return;
  } while (parent && parent.type !== root);
}

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
  return () => jsxContainer({ xCoord, yCoord, setXCoord, setYCoord });
};

const jsxContainer = ({ xCoord, yCoord, setXCoord, setYCoord }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: {},
    element: [
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
    element: null,
  };
};

const jsxNetworkButton = ({ setXCoord, setYCoord }) => {
  return {
    type: "htmlNode",
    domType: "button",
    props: {},
    element: () => jsxText({ nodeValue: "request remote data" }),
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
const hostRoot = {
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
  fiberRoot.current = hostRoot;
  hostRoot.accessor = fiberRoot;
}
function createWipRoot(root, element) {
  const newWipHostRoot = {
    ...root,
    alternate: root,
    element,
  };
  root.alternate = newWipHostRoot;
  return newWipHostRoot;
}

// --------
// TOP LEVEL API
function render(Component, DOMRoot) {
  // initialization
  if (Component) _Component = Component;
  if (DOMRoot) {
    _currentRoot = DOMRoot;
    createFiberAndHostRoot(DOMRoot);
  }

  // MOUNT - dealing with create
  if (!wipRoot) {
    // before loop
    hostRoot.update = true;
    wipRoot = createWipRoot(hostRoot, _Component);
    console.log("wipRoot", wipRoot);
    wip = wipRoot;
    // go down and up - reconcile, tag, create accessors
    loop();
    // commit - traverse through the whole tree, do the flag effects
    console.log("mount before commit wipRoot", wipRoot);
    traverseAndCommitEffects(wipRoot);
    fiberRoot.current = wipRoot;
    // hostRoot.update = false;
    wipRoot.update = false;
    console.log("mount end fiberRoot", fiberRoot);
  }
  // RERENDER - dealing with create, update, delete
  else {
    // before loop
    currentRoot = wipRoot;
    wipRoot = createWipRoot(currentRoot, _Component);
    // update = true;
    wip = wipRoot;
    loop();
    console.log("rerender before commit wipRoot", wipRoot);
    // if (currentRoot && wip.props.nodeValue === "Bye!") throw new Error("stop");

    // traverseAndCommitEffects(wipRoot);
    // fiberRoot.current = wipRoot;
    // wipRoot.childUpdate = false;
    // console.log("rerender end fiberRoot", fiberRoot);
  }
}

// MAIN LOOP
// wip effect - root { element: jsx(), children: null } (there is always current root, created before, it never gets created it in the main loop)
// wip effect - functional { function: App(), children: null }
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
// out: { old child fiber } or { new child fiber } or null
// reusing or creating new fibers (memoized effects) - storing state
// reconciling children
// tagging
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
          const clonedCurrentChildFiber = {
            ...current.child,
            alternate: current.child,
            return: wip,
          };
          current.child.alternate = clonedCurrentChildFiber;
          wip.child = clonedCurrentChildFiber;
          console.log("child fiber needs to be recalculated", wip);
          return wip.child;
        }
      }
      console.log("this fiber needs to be recalculated");
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
    currentFiber = wip;
    pointer = 0;
    wip.hook = { state: [], queue: [] };
    if (current !== null && current.hook != null) {
      wip.hook.state = current.hook.queue;
    }
    // run Component()
    const childJsx = wip.function();
    if (childJsx === null) {
      return null;
    }
    // run jsx()
    childEffect = childJsx();
    currentFiber = null;
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
      const updatedFiber = {
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
      console.log("reconcile single", currentFiber.props);
      console.log("reconcile single", updatedFiber.props);
      console.log(
        "reconcile single",
        updatedFiber.props === currentFiber.props
      );
      currentFiber.alternate = updatedFiber;
      placeChild(updatedFiber, subroot);

      return updatedFiber;
    } else {
      // didn't match, so delete and create below
      deleteOldChildren(child, returnFiber);
    }
  }
  // create new fiber, there is no old fiber
  const newFiber = createNewFiber(childEffect, returnFiber);
  placeChild(newFiber, subroot);
  return newFiber;
}

function placeChild(newFiber, subroot) {
  if (subroot && newFiber.alternate === null) {
    newFiber.flag = "CREATE";
  }
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
      newChildFiber = {
        ...childEffect[idx],
        alternate: oldFiber,
        accessor: oldFiber.accessor,
        child: oldFiber.child,
        domType: oldFiber.domType,
        return: returnFiber,
        sibling: null,
        hook: oldFiber.hook,
        type: oldFiber.type,
        deletions: oldFiber.deletions,
        update: currentFiber.update,
        childUpdate: currentFiber.childUpdate,
      };
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

function createNewFiber(effect, parentFiber) {
  return {
    ...effect,
    return: parentFiber,
    alternate: null,
    sibling: null,
    child: null,
    deletions: null,
    accessor: null,
    update: false,
    childUpdate: false,
  };
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
            JSON.stringify(completedWork.props)
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
            JSON.stringify(completedWork.props)
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

// ---------------------------------------------------------------------------------------------

function searchForHostParentAccessor(effect) {
  const parent = effect.return;
  const parentAccessor = parent.accessor;

  if (parent.type === "root") {
    return parentAccessor.accessor;
  }

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

function deleteOldChildren(childToDelete, parent) {
  while (childToDelete) {
    deleteOldChild(childToDelete, parent);
    childToDelete = childToDelete.sibling;
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

// --------
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
