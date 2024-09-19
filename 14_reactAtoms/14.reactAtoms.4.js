// description of an result element {type:'', props:{}, children:[ Fce, Fce]}, handler: Fce}
// BETTER CREATEVDOM, BETTER CONVERT, BETTER DIFF, BETTER HANDLING OF UPDATE AND DELETE
// passing top root element, calling component fce inside create VDOM
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
    currentVDOM = wipVDOM;
    wipVDOM = createVDOM(_Component, _currentRoot);

    console.log("current", currentVDOM);
    console.log("wip", wipVDOM);

    // find differences
    // just calculation to gather changes to do
    // performing side effects right away
    // - iterate over wip dom - first layer, second layer in first child ...
    // - element type the same and props the same - bail out, no mark
    // - element the same, props changed - update mark
    // - if domType doesn't match - delete and create mark
    // - if element is extra in the new array - create mark
    // - if element is missing in the new array, but there is one in the old - delete mark

    // EFFECT
    // perform mutation effects
    // process deletions of the old
    // process creation - place under parent node
    // process updates - change props
  }

  keepFocus();
}

// CREATE ACCESSORS
function createDOMNodes(effect, container) {
  const effectArray = [effect];
  iterateOver(effectArray);
}

function iterateOver(effectArray) {
  for (const effect of effectArray) {
    processEffect(effect);
  }
  for (const effect of effectArray) {
    if (effect.children) {
      iterateOver(effect.children);
    }
  }
}

function processEffect(effect) {
  const accessor = convertToDOMNode(effect);
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

function convertToDOMNode(effect) {
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

function appendToParent(child, parent) {
  parent.appendChild(child);
}

function commitToRoot(effects) {
  let node = findAccessor(effects);
  _currentRoot.appendChild(node);
}

function findAccessor(effects) {
  if (effects.accessor) {
    return effects.accessor;
  }
  let childEffect = effects.children.find((child) => child.accessor);
  if (!childEffect) {
    return findAccessor(effects.children);
  } else {
    return childEffect.accessor;
  }
}

// FIND DIFF ON UPDATE
function findDiff(currentVDOM, wipVDOM) {
  for (let i = 0; i < wipVDOM.length; i++) {
    if (JSON.stringify(currentVDOM[i]) !== JSON.stringify(wipVDOM[i])) {
      if (wipVDOM[i][2] instanceof Array) {
        const childAccessors = wipVDOM[i][2].map(convert);
        accessors[i].replaceChildren(...childAccessors);
      } else {
        accessors[i].value = wipVDOM[i][2];
        accessors[i].textContent = wipVDOM[i][2];
      }
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
// data organization for practical use

// iterations over/walking through various data structures
// for i++
// foreach
// for sth in sth
// while
// map
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
