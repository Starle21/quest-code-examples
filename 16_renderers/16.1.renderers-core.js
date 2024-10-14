// SPLIT CODE INTO RECONCILER - RENDERER, to allow different renderers
// -------------------------------------------------------------------------------
import {
  createHostNode,
  createHostTextNode,
  appendChildToContainer,
  commitHostTextUpdate,
  removeChild,
  shouldNotMarkForCommitUpdate,
  commitHostNodeUpdate,
} from "./16.1.renderers-renderer";

// -------------------------------------------------------------------------------
// HOOK
let currentlyProcessedFiber;
let wipHookArray = null;
let pointer;

function useState(initial) {
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

export function getFiber() {
  return currentlyProcessedFiber;
}

// -------------------------------------------------------------------------------
// CREATE ROOT
let wipRoot = null;

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
  // MOUNT - dealing with create
  if (!wipRoot) {
    createFiberAndHostRoot(DOMRoot);
    currentRoot.update = true;
  } else {
    // RERENDER - dealing with create, update, delete
    currentRoot = fiberRoot.current;
  }

  wipRoot = createWipRoot(currentRoot, Effect);
  wip = wipRoot;
  loop();
  traverseAndCommitEffects(wipRoot);
  fiberRoot.current = wipRoot;
}

// MAIN LOOP
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

  let childEffect;
  switch (wip.type) {
    case "root": {
      if (wip.childEffect === null) {
        wip.child = null;
        return null;
      }
      if (wip.childEffect instanceof Array) {
        childEffect = wip.childEffect.filter((effect) => effect);
      } else {
        childEffect = wip.childEffect;
      }
      break;
    }
    case "htmlNode":
    case "svgNode": {
      if (wip.props.children === null) {
        wip.child = null;
        return null;
      }
      if (wip.props.children instanceof Array) {
        childEffect = wip.props.children.filter((effect) => effect);
      } else {
        childEffect = wip.props.children;
      }
      break;
    }
    case "textNode": {
      wip.child = null;
      return null;
    }
    case "component": {
      currentlyProcessedFiber = wip;
      pointer = 0;
      wipHookArray = null;
      wip.hook = null;
      const props = wip.props;

      childEffect = wip.function(props);

      if (childEffect === null) {
        wip.child = null;
        return null;
      }

      currentlyProcessedFiber = null;
      break;
    }
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
function goUp(completedWork) {
  let next = null;
  do {
    console.log("complete", completedWork);
    let current = completedWork.alternate;
    let returnFiber = completedWork.return;

    switch (completedWork.type) {
      case "root": {
        console.log("goUp completed", completedWork);
        break;
      }
      case "component": {
        // noop
        break;
      }
      case "htmlNode":
      case "svgNode": {
        if (current !== null && completedWork.accessor != null) {
          console.log("props old new", current.props, completedWork.props);
          console.log("equal", current.props === completedWork.props);
          if (
            shouldNotMarkForCommitUpdate(current.props, completedWork.props)
          ) {
            break;
          }
          markUpdate(completedWork);
        } else {
          let node = createHostNode(
            completedWork.type,
            completedWork.domType,
            completedWork.props
          );
          completedWork.accessor = node;
          appendAllChildren(completedWork);
        }
        break;
      }
      case "textNode": {
        if (current !== null && completedWork.accessor != null) {
          if (current.props === completedWork.props) {
            break;
          }
          markUpdate(completedWork);
        } else {
          let node = createHostTextNode(completedWork.props);
          completedWork.accessor = node;
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

function appendAllChildren(completedWork) {
  let toAppend = completedWork.child;
  while (toAppend !== null) {
    if (
      toAppend.type === "htmlNode" ||
      toAppend.type === "textNode" ||
      toAppend.type === "svgNode"
    ) {
      appendChildToContainer(completedWork.accessor, toAppend.accessor);
    } else if (toAppend.type === "component" && toAppend.child !== null) {
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
function commitEffect(effect) {
  if (effect.flag === "DELETECHILD" || effect.flag === "DELETEANDUPDATE") {
    effect.deletions.forEach((child) => {
      if (child.type === "component") {
        // relying on fce component having one direct host component child
        return commitDelete(child.child.accessor, effect.accessor);
      }
      commitDelete(child.accessor, effect.accessor);
    });
    effect.deletions = null;
    effect.flag = effect.flag === "DELETEANDUPDATE" ? "UPDATE" : null;
  }
  if (effect.flag === "CREATE") {
    const topAccessor = searchForHostParentAccessor(effect);
    const node = findAccessor(effect);
    commitPlacement(node, topAccessor);
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

function commitPlacement(child, parent) {
  appendChildToContainer(parent, child);
}

function commitDelete(child, parent) {
  removeChild(parent, child);
}

function commitUpdate(effect) {
  switch (effect.type) {
    case "htmlNode":
    case "svgNode": {
      commitHostNodeUpdate(
        effect.type,
        effect.accessor,
        effect.props,
        effect.alternate.props
      );
      return;
    }
    case "textNode": {
      commitHostTextUpdate(effect.accessor, effect.props);
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

export { render, useState };
