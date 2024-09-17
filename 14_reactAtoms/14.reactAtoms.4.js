// description of an result element {type:'', props:{}, children:[ Fce, Fce]}, handler: Fce}
// BETTER CREATEVDOM, BETTER CONVERT, BETTER DIFF, BETTER HANDLING OF UPDATE AND DELETE
// passing top root element, calling component fce inside create VDOM
// ---
let vDOM;
let prevVDOM;
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

const NetworkButton = ({ setXCoord, setYCoord }) => {
  return {
    type: "htmlNode",
    domType: "button",
    props: null,
    children: "request remote data",
    handler: () => {
      makeNetworkRequest(({ x, y }) => {
        setXCoord(x);
        setYCoord(y);
        console.log("local data updated from remote source");
      });
    },
  };
};
const Label = ({ name }) => {
  return {
    type: "htmlNode",
    domType: "div",
    props: null,
    children: `${name} coordinate:`,
  };
};
const Input = ({ name, coord, setCoord }) => {
  return {
    type: "htmlNode",
    domType: "input",
    props: { id: name },
    children: coord,
    handler: (e) => {
      setCoord(e.target.value);
    },
  };
};
export const Svg = ({ x, y }) => {
  const element = x && y ? () => Square({ x, y }) : () => Text();
  return {
    type: "svgNode",
    domType: "svg",
    props: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
    children: [element],
  };
};

const Text = () => {
  return {
    type: "svgNode",
    domType: "text",
    props: { x: "0", y: "40", className: "small" },
    children: "Fill out all inputs!",
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
    children: `${name} coordinate is: ${coord}`,
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

// GATHER COMPONENTS TOGETHER
// component: fce
export const createVDOM = (component) => {
  const effect = component();
  if (effect.children instanceof Array) {
    const children = effect.children.map((el) => {
      return createVDOM(el);
    });
    return { ...effect, children };
  }
  return effect;
};

// TOP LEVEL API
let _Component;
let _DOMroot;
function render(Component, DOMRoot) {
  setFocus();

  // initialization
  if (Component) _Component = Component;
  if (root) _DOMroot = DOMRoot;
  pointer = 0;

  // MOUNT
  if (!accessors) {
    vDOM = createVDOM(_Component);
    console.log(vDOM);
    accessors = [vDOM].map(convert);
    // document.body.replaceChildren(...accessors);
  }
  // RERENDER
  else {
    prevVDOM = vDOM;
    vDOM = createVDOM(_Component);
    findDiff(prevVDOM, vDOM);
  }

  // keepFocus();
}

// CREATE ACCESSORS, RENDER TO DOM
export function convert(element) {
  console.log(element);
  switch (element.type) {
    case "component": {
      console.log("this is fce component", element);
      const children = element.children.map((el) => convert(el));
      break;
    }
    case "button": {
    }
  }
}
// // CREATE ACCESSORS, RENDER TO DOM
// function convert(element) {
//   let node = document.createElement(element[0]);
//   if (context(element[0]))
//     node = document.createElementNS("http://www.w3.org/2000/svg", element[0]);
//   if (element[1]?.xmlns) node.setAttribute("xmlns", element[1].xmlns);
//   if (element[1]?.viewBox) node.setAttribute("viewBox", element[1].viewBox);
//   if (element[2] instanceof Array) {
//     const childAccessor = element[2].map(convert);
//     node.append(...childAccessor);
//   } else {
//     if (element[1]?.x) node.setAttribute("x", element[1].x);
//     if (element[1]?.y) node.setAttribute("y", element[1].y);
//     if (element[1]?.width) node.setAttribute("width", element[1].width);
//     if (element[1]?.height) node.setAttribute("height", element[1].height);
//     if (element[1]?.className) node.classList.add(element[1].className);
//     if (element[1]?.id) node.id = element[1].id;
//     node.textContent = element[2];
//     node.value = element[2];
//   }
//   node.onclick = element[3];
//   node.oninput = element[3];
//   return node;
// }

// FIND DIFF ON UPDATE
function findDiff(prevVDOM, currentVDOM) {
  for (let i = 0; i < currentVDOM.length; i++) {
    if (JSON.stringify(prevVDOM[i]) !== JSON.stringify(currentVDOM[i])) {
      if (currentVDOM[i][2] instanceof Array) {
        const childAccessors = currentVDOM[i][2].map(convert);
        accessors[i].replaceChildren(...childAccessors);
      } else {
        accessors[i].value = currentVDOM[i][2];
        accessors[i].textContent = currentVDOM[i][2];
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
