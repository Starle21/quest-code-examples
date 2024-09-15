// description of an result element [type, props, contents(children), handler, directive]
// passing arguments/props as parameters to component functions
// DIFF ALGORITHM
// ---
let vDOM;
let prevVDOM;
let accessors;
let isFocusX = false;
let isFocusY = false;

// DATA - WRITE - HOOK
let _values = [];
let pointer = 0;
function useState(initial) {
  state = _values[pointer] || initial;
  let _pointer = pointer;
  const setValue = (newValue) => {
    _values[_pointer] = newValue;
    render();
  };
  pointer++;
  return [state, setValue];
}

// ELEMENTS / COMPONENTS
const App = () => {
  const [xCoord, setXCoord] = useState("");
  const [yCoord, setYCoord] = useState("");
  return [
    NetworkButton({ setXCoord, setYCoord }),
    Label({ name: "x" }),
    Input({ name: "x", coord: xCoord, setCoord: setXCoord }),
    Label({ name: "y" }),
    Input({ name: "y", coord: yCoord, setCoord: setYCoord }),
    Svg({ x: xCoord, y: yCoord }),
    Coordinate({ coord: xCoord, name: "x" }),
    Coordinate({ coord: yCoord, name: "y" }),
  ];
};

const NetworkButton = ({ setXCoord, setYCoord }) => [
  "button",
  null,
  "request remote data",
  () => {
    makeNetworkRequest(({ x, y }) => {
      setXCoord(x);
      setYCoord(y);
      console.log("local data updated from remote source");
    });
  },
];
const Label = ({ name }) => ["div", null, `${name} coordinate:`];
const Input = ({ name, coord, setCoord }) => [
  "input",
  { id: name },
  coord,
  (e) => {
    setCoord(e.target.value);
  },
];
const Svg = ({ x, y }) => [
  "svg",
  { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
  [x && y ? Square({ x, y }) : Text()],
];
const Text = () => [
  "text",
  { x: "0", y: "40", className: "small" },
  "Fill out all inputs!",
];
const Square = ({ x, y }) => ["rect", { x, y, width: "30", height: "30" }];
const Coordinate = ({ coord, name }) => [
  "div",
  null,
  `${name} coordinate is: ${coord}`,
];

// GATHER COMPONENTS TOGETHER
// pass data as prop
function createVDOM(Component) {
  return Component();
}

// TOP LEVEL API
let _Component;
function render(Component) {
  activeElement();

  if (Component) _Component = Component;
  pointer = 0;

  if (!accessors) {
    vDOM = createVDOM(_Component);
    accessors = vDOM.map(convert);
    document.body.replaceChildren(...accessors);
    // console.log(accessors);
  } else {
    prevVDOM = vDOM;
    vDOM = createVDOM(_Component);
    findDiff(prevVDOM, vDOM);
  }

  setFocus();
}

// CREATE ACCESSORS, RENDER TO DOM
function convert(element) {
  let node = document.createElement(element[0]);
  if (context(element[0]))
    node = document.createElementNS("http://www.w3.org/2000/svg", element[0]);
  if (element[1]?.xmlns) node.setAttribute("xmlns", element[1].xmlns);
  if (element[1]?.viewBox) node.setAttribute("viewBox", element[1].viewBox);
  if (element[2] instanceof Array) {
    const childAccessor = element[2].map(convert);
    node.append(...childAccessor);
  } else {
    if (element[1]?.x) node.setAttribute("x", element[1].x);
    if (element[1]?.y) node.setAttribute("y", element[1].y);
    if (element[1]?.width) node.setAttribute("width", element[1].width);
    if (element[1]?.height) node.setAttribute("height", element[1].height);
    if (element[1]?.className) node.classList.add(element[1].className);
    if (element[1]?.id) node.id = element[1].id;
    node.textContent = element[2];
    node.value = element[2];
  }
  node.onclick = element[3];
  node.oninput = element[3];
  return node;
}

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
      y: Math.ceil(Math.random() * 60),
    });
  }, 2000);
}

function context(element) {
  return element === "svg" || element === "rect" || element === "text";
}
function activeElement() {
  if (accessors) {
    document.activeElement == document.querySelector("input#x")
      ? (isFocusX = true)
      : (isFocusX = false);
    document.activeElement == document.querySelector("input#y")
      ? (isFocusY = true)
      : (isFocusY = false);
  }
}
function setFocus() {
  let activeInputX = document.querySelector("input#x");
  let activeInputY = document.querySelector("input#y");
  accessors && isFocusX && activeInputX.focus();
  accessors && isFocusY && activeInputY.focus();
}

// RUN
render(App);
