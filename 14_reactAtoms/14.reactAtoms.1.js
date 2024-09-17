// description of an result element [type, props, contents(children), handler, directive]
// passing arguments/props as parameters to component functions
HOOK - defined topmost App component, which 'owns' the data, render only on change
let vDOM;
let accessors;
let isFocus = false;

// DATA - WRITE - HOOK
let _value;
function useState(initial) {
  const state = _value || initial;
  const setValue = (newValue) => {
    _value = newValue;
    render();
  };
  return [state, setValue];
}

// ELEMENTS / COMPONENTS
const App = () => {
  const [xCoord, setXCoord] = useState("");
  return [
    NetworkButton({ setXCoord }),
    Label(),
    Input({ x: xCoord, setXCoord }),
    Svg({ x: xCoord }),
    Coordinate({ x: xCoord }),
  ];
};

const NetworkButton = ({ setXCoord }) => [
  "button",
  null,
  "request remote data",
  () => {
    makeNetworkRequest((newValue) => {
      setXCoord(newValue);
      console.log("local data updated from remote source");
    });
  },
];
const Label = () => ["div", null, `x coordinate:`];
const Input = ({ x, setXCoord }) => [
  "input",
  null,
  x,
  (e) => {
    setXCoord(e.target.value);
  },
];
const Svg = ({ x }) => [
  "svg",
  { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
  [x ? Square({ x }) : Text()],
];
const Text = () => [
  "text",
  { x: "0", y: "40", className: "small" },
  "Fill out all inputs!",
];
const Square = ({ x }) => ["rect", { x, y: "20", width: "30", height: "30" }];
const Coordinate = ({ x }) => ["div", null, `x coordinate is: ${x}`];

// GATHER COMPONENTS TOGETHER
// pass data as prop
function createVDOM(Component) {
  return Component();
}

// TOP LEVEL API
function render(Component) {
  accessors && document.activeElement == document.querySelector("input")
    ? (isFocus = true)
    : (isFocus = false); // keep this code

  vDOM = Component ? createVDOM(Component) : createVDOM(App);
  accessors = vDOM.map(convert);
  document.body.replaceChildren(...accessors);

  accessors && isFocus && document.querySelector("input").focus(); //keep this code
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
    node.textContent = element[2];
    node.value = element[2];
  }
  node.onclick = element[3];
  node.oninput = element[3];
  return node;
}

// HELPERS
function makeNetworkRequest(handler) {
  console.log("request pending");
  setTimeout(() => {
    handler(Math.ceil(Math.random() * 160));
  }, 2000);
}

function context(element) {
  return element === "svg" || element === "rect" || element === "text";
}

// RUN
render(App);

// --------------
// DATA - WRITE
// store in the topmost component - this version does not work, recreating App and setValue on every render
// const App = () => {
//   let xCoord = "";
//   const setValue = (newValue) => {
//     xCoord = newValue;
//     return xCoord;
//   };

//   return [
//     NetworkButton(),
//     Label(),
//     Input({ x: xCoord, setValue }),
//     Svg({ x: xCoord }),
//     Coordinate({ x: xCoord }),
//   ];
// };
