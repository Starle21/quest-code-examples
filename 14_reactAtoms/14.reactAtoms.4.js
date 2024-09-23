// description of an result element {type:'', props:{}, children:[ Fce, Fce]}, handler: Fce}
// BETTER CREATEVDOM, BETTER CONVERT, BETTER DIFF, BETTER HANDLING OF UPDATE AND DELETE
// passing top root element, calling component fce inside create VDOM
// dividing calculation from effect
// ---
let wipVDOM;
let currentVDOM;
let accessors;
const focusables = [
  { type: "x", focused: undefined },
  { type: "y", focused: undefined },
];

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

// GATHER COMPONENTS, EFFECTS TOGETHER
// args: component : fce
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

// TOP LEVEL API
let _Component;
let _currentRoot;
function render(Component, DOMRoot) {
  setFocus();

  // initialization
  if (Component) _Component = Component;
  if (DOMRoot) _currentRoot = DOMRoot;
  pointer = 0;

  // MOUNT - dealing with create
  if (!wipVDOM) {
    // CALCULATION
    // unwrap components into effects
    wipVDOM = createVDOM(_Component, _currentRoot);
    console.log("after creating VDOM", wipVDOM);

    // turn effects into accessors and connect them together except for the top one
    accessors = createDOMNodes(wipVDOM, _currentRoot);
    console.log("after creating DOM nodes", wipVDOM);

    // EFFECT
    commitToRoot(wipVDOM);
  }
  // RERENDER - dealing with create, update, delete
  else {
    // CALCULATION
    console.log("---");
    currentVDOM = wipVDOM;
    wipVDOM = createVDOM(_Component, _currentRoot);

    console.log("current", currentVDOM);
    console.log("wip", wipVDOM);
    console.log("---");

    diff([wipVDOM], [currentVDOM]);
    console.log("---");
    console.log("diffs", wipVDOM);
    console.log("---");

    // EFFECT
    commitEffects([wipVDOM]);
    console.log("---");
    console.log("after commit", wipVDOM);
    console.log("---");
  }

  keepFocus();
}

// RERENDER commit
function commitDelete(child, parent) {
  parent.removeChild(child);
}

function commitRoot(child, parent) {
  console.log("commit root", child, parent);
  appendToParent(child, parent);
}

function commitEffects(finishedTree) {
  // console.log(finishedTree);
  finishedTree.forEach((effect, index) => {
    // console.log("---");
    // console.log(effect);
    if (effect.flag === "DELETECHILD") {
      effect.deletions.forEach((child) => {
        // console.log("commit delete!", effect);
        // console.log("on:", child);
        commitDelete(child.accessor, effect.accessor);
      });
      effect.deletions = null;
      effect.flag = null;
    }
    if (effect.flag === "CREATE") {
      // console.log("commit create!", effect);
      // console.log("commit create!", effect.accessor);
      // console.log("commit create!", effect.return);
      commitRoot(effect.accessor, effect.return.accessor);
      effect.flag = "UPDATE";
    }
    if (effect.flag === "UPDATE") {
      // console.log("commit update!", effect);
      commitUpdate(effect);
      effect.flag = null;
    }
    if (effect.children) {
      // console.log("down");
      commitEffects(effect.children);
    } else {
      // console.log("up");
    }
  });
}

function commitUpdate(effect) {
  switch (effect.type) {
    case "component": {
      return null;
    }
    case "htmlNode": {
      console.log("commitUpdate", effect);
      // populate props
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
      console.log("commitUpdate", effect);
      effect.props &&
        Object.keys(effect.props).forEach((prop) => {
          effect.accessor[prop] = effect.props[prop];
        });
      return;
    }
  }
}

// RERENDER diff
function diff(newArray, oldArray) {
  newArray.forEach((newEffect, index) => {
    // console.log("---");
    // console.log("old:", oldArray && oldArray[index]);
    const oldEffect = oldArray && oldArray[index];
    // console.log("newEffect", newEffect);
    if (newEffect.children) {
      // console.log("down");
      reconcileChildren(newEffect.children, oldEffect.children, newEffect);
      // console.log("children", newEffect.children);

      // console.log("processed wip has children");
      diff(newEffect.children, oldArray[index].children);
    } else {
      // console.log("up");
    }
  });
}

function deleteChild(childToDelete, parent) {
  const deletions = parent.deletions;
  if (deletions == null) {
    parent.deletions = [childToDelete];
    parent.flag = "DELETECHILD";
  } else {
    deletions.push(childToDelete);
  }
}

function iterateOverSubtree(effectArray) {
  for (const effect of effectArray) {
    convertToDOMNode(effect);
    console.log("subtree effect", effect);
    console.log("subtree", effect.accessor, effect.return.accessor);
    appendToParent(effect.accessor, effect.return.accessor);
    if (effect.children) {
      iterateOverSubtree(effect.children);
    }
  }
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
      break;
    }
    case "svgNode": {
      let node = document.createElementNS(
        "http://www.w3.org/2000/svg",
        effect.domType
      );
      effect.accessor = node;
      break;
    }
    case "textNode": {
      let node = document.createTextNode("");
      console.dir("effect accessor", node);
      effect.accessor = node;
      effect.props &&
        Object.keys(effect.props).forEach((prop) => {
          effect.accessor[prop] = effect.props[prop];
        });
      console.dir("effect accessor", effect.accessor);
      break;
    }
  }
  if (effect.children) {
    console.log("PROCESS SUBTREE!");
    iterateOverSubtree(effect.children);
  }
}

export function reconcileChildren(newChildren, oldChildren, newParent) {
  let idx = 0;
  // console.log("newChildren", newChildren);
  // console.log("oldChildren", oldChildren);
  for (; oldChildren && oldChildren[idx] && idx < newChildren.length; idx++) {
    if (newChildren[idx].domType === oldChildren[idx].domType) {
      // update
      newChildren[idx].accessor = oldChildren[idx].accessor;
      if (
        JSON.stringify(newChildren[idx].props) !==
        JSON.stringify(oldChildren[idx].props)
      ) {
        newChildren[idx].flag = "UPDATE";
        // console.log("UPDATE!", newChildren[idx]);
      }
    } else {
      // delete and create
      deleteChild(oldChildren[idx], newParent);
      convertToDOMNode(newChildren[idx]);
      newChildren[idx].flag = "CREATE";
      console.log(newChildren[idx]);
    }
  }
  // console.log("end of old children", idx, oldChildren && oldChildren[idx]);
  if (oldChildren && oldChildren[idx] && idx === newChildren.length) {
    // new children array has less elements
    for (; idx < oldChildren.length; idx++) {
      console.log("delete remaining old children");
      deleteChild(oldChildren[idx], newParent);
    }
    return;
  }
  if (oldChildren && oldChildren[idx] == undefined && newChildren[idx]) {
    // new children array has more elements
    for (; idx < newChildren.length; idx++) {
      // create tag
      // console.log("create new children");
      newChildren[idx].flag = "CREATE";
      // console.log("CREATE!");
    }
  }
  return newChildren;
}

// MOUNT
// COMMIT ROOT
function commitToRoot(effect) {
  let node = findAccessor(effect);
  _currentRoot.appendChild(node);
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

// CREATE ACCESSORS
function createDOMNodes(effect) {
  const effectArray = [effect];
  iterateOver(effectArray);
}

function iterateOver(effectArray) {
  for (const effect of effectArray) {
    processEffect(effect);
    if (effect.children) {
      iterateOver(effect.children);
    }
  }
}

function appendToParent(child, parent) {
  parent.appendChild(child);
}

function processEffect(effect) {
  const accessor = convertToDOMNodeWithProps(effect);
  const parent = effect.return.accessor;
  effect.accessor = accessor;

  if (accessor && parent) {
    appendToParent(accessor, parent);
  } else if (parent === _currentRoot || !accessor) {
    // noop
  } else if (accessor && !parent) {
    const parentContainer = searchForHostParentAccessor(effect);
    if (parentContainer !== _currentRoot)
      appendToParent(accessor, parentContainer);
  }
  return effect;
}

function searchForHostParentAccessor(effect) {
  const childEffect = effect;
  const parent = effect.return;
  const parentContainer = parent.return;
  return parentContainer;
}

function convertToDOMNodeWithProps(effect) {
  switch (effect.type) {
    case "component": {
      return null;
    }
    case "htmlNode": {
      let node = document.createElement(effect.domType);

      // populate props
      effect.props &&
        Object.keys(effect.props).forEach((prop) => {
          node[prop] = effect.props[prop];
        });

      // populate event handlers
      effect.handlers &&
        Object.keys(effect.handlers).forEach((handle) => {
          const eventType = handle.toLocaleLowerCase().substring(2);
          node.addEventListener(eventType, effect.handlers[handle]);
        });

      return node;
    }
    case "svgNode": {
      let node = document.createElementNS(
        "http://www.w3.org/2000/svg",
        effect.domType
      );
      effect.props &&
        Object.keys(effect.props).forEach((prop) => {
          node.setAttribute(prop, effect.props[prop]);
        });
      return node;
    }
    case "textNode": {
      let node = document.createTextNode("");
      effect.props &&
        Object.keys(effect.props).forEach((prop) => {
          node[prop] = effect.props[prop];
        });
      return node;
    }
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

function context(element) {
  return element === "svg" || element === "rect" || element === "text";
}

function setFocus() {
  if (accessors) {
    focusables.map((f) => {
      document.activeElement == document.querySelector(`input#${f.type}`)
        ? (f.focused = true)
        : (f.focused = false);
    });
  }
}
function keepFocus() {
  if (accessors) {
    let focused = focusables.filter((f) => f.focused === true);
    if (focused.type) {
      let activeInput = document.querySelector(`input#${focused.type}`);
      accessors && focused && activeInput.focus();
    }
  }
}

// RUN
const root = document.querySelector("#root");
render(App, root);

// ACCESSORS + EFFECTS
// const createDOMNodes = (effect) => {
//   if (effect.children instanceof Array) {
//     const children = effect.children.map((el) => {
//       return createDOMNodes(el);
//     });
//     const accessor = convertToDOM(effect);
//     return { ...effect, children, accessor };
//   } else {
//     const accessor = convertToDOM(effect);
//     return { ...effect, accessor };
//   }
// };

// const createDOMNodes = (effect) => {
//   const accessor = convertToDOMNode(effect);
//   if (effect.children instanceof Array) {
//     const children = effect.children.map((el) => {
//       return createDOMNodes(el);
//     });
//     return { ...effect, accessor, children };
//   }
//   return { ...effect, accessor };
// };

// ----------
// data organization in memory
// data organization for practical use - when i need to know index..

// iterations over/walking through various data structures
// for i++ i
// forEach i
// for ... of sth x
// for ... in sth x
// while x
// map i
// iterator
// generator

const effect = {
  type: "A",
  accessor: "x",
  props: { a: "a", b: "b" },
  children: [
    {
      type: "AA",
      accessor: null,
      props: { c: "c" },
      children: [
        {
          type: "AAA",
          accessor: "x",
          props: { a: "a", b: "b" },
          children: [
            {
              type: "AAAA",
              accessor: "x",
              props: null,
              children: null,
            },
          ],
        },
        {
          type: "AAB",
          accessor: "x",
          props: { a: "a", b: "b" },
          children: null,
        },
      ],
    },
    {
      type: "AB",
      accessor: null,
      props: { c: "c" },
      children: [
        {
          type: "ABA",
          accessor: "x",
          props: { a: "a", b: "b" },
          children: null,
        },
      ],
    },
  ],
};

const effectArray = [effect];
// iterateOver(effectArray);

// ----
// react - breadth first expansion of fiber tree

// ----
// iterate over the data structure separately from processing it

// effect -> convert to dom node -> accessor
// accessor, parent -> append to parent container -> void
//          -> if there is no accessor - this is functional component -> noop
//          -> if there is no parent - this is host child of functional component -> search for host parent accessor
//          -> if the parent is the root -> noop
// return expanded effect with its accessor, which makes it a mounted effect, aka fiber

// recursive version
// const createDOMNodes = (effect, container) => {
//   const accessor = convertToDOMNode(effect);
//   if (effect.children instanceof Array) {
//     const children = effect.children.map((child) => {
//       return createDOMNodes(child, accessor);
//     });
//     if (!container) {
//       const parentContainer = searchForHostParentAccessor(effect);
//       if (parentContainer === _currentRoot) {
//         return { ...effect, accessor, children };
//       } else {
//         return appendToParent(accessor, parentContainer);
//       }
//     }
//     if (accessor) {
//       appendToParent(accessor, container);
//     }
//     return { ...effect, accessor, children };
//   }
//   appendToParent(accessor, container);
//   return { ...effect, accessor };
// };

// let nextTask;
// while (nextTask) {
//   nextTask = doSomething(nextTask);
// }
// if (!nextTask) {
//   // nextTask = newTask;
// }

// iterate over new vdom
// somehow take the comparable element from the old vdom
// have to know the position of a node in the new vdom

// function iterateOver(effectArray) {
//   for (const effect of effectArray) {
//     processEffect(effect);
//     if (effect.children) {
//       iterateOver(effect.children);
//     }
//   }
// }

// oldArray[index].children[index].children[index]
// root
// effect === oldArray[i1]
// depth 1
// effect === oldArray[i1].children[i2]
// depth 2
// effect === oldArray[i1].children[i2].children[i3]

// tag
// create unattached dom node

// process tags in commit
// delete
// append - place
//

// EFFECT
// perform mutation effects
// process deletions of the old
// process creation - place under parent node
// process updates - change props

// DIFF
// just calculation to gather changes to do
// - iterate over wip dom - first layer, second layer in first child ...
// - grab comparable node from the old vdom
// - element type the same and props the same - copy pointer to existing dom node
// - element the same, props changed - update mark - copy pointer to existing node and update the props, mark update
// - if domType doesn't match - delete array for old one and create node mark for the new one
// - if element is extra in the new array - null in old vdom - create mark
// - if element is missing in the new array, but there is one in the old - delete array for old one, delete mark
