// description of an result element [type, props, contents(children), handler, directive]

let vDOM;
let accessors;
let isFocus = false;

// DATA - WRITE
let xCoord = "";

// ELEMENTS
const NetworkButton = () => [
  "button",
  null,
  "request remote data",
  () => {
    makeNetworkRequest((newValue) => {
      xCoord = newValue;
      console.log("new data!", xCoord);
    });
  },
];
const Label = () => ["div", null, "x coordinate"];
const Input = () => [
  "input",
  null,
  xCoord,
  (e) => {
    xCoord = e.target.value;
  },
];
const Svg = () => [
  "svg",
  { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
  [xCoord ? Square() : Text()],
];
const Text = () => [
  "text",
  { x: "0", y: "40", className: "small" },
  "Fill out all inputs!",
];
const Square = () => [
  "rect",
  { x: xCoord, y: "20", width: "30", height: "30" },
];
const Coordinate = () => ["div", null, xCoord];

// KEEP MEMOIZED DATA STRUCTURE OVER COMPONENTS' LIFETIME
function createVDOM() {
  return [NetworkButton(), Label(), Input(), Svg(), Coordinate()];
}

// TOP LEVEL API
function render() {
  accessors && document.activeElement == accessors[2]
    ? (isFocus = true)
    : (isFocus = false); // keep this code

  vDOM = createVDOM();
  accessors = vDOM.map(convert);
  document.body.replaceChildren(...accessors);

  accessors && isFocus && accessors[2].focus(); //keep this code
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
    if (node.value) node.value = element[2];
  }
  node.onclick = element[3];
  node.oninput = element[3];
  return node;
}

// HELPERS
function makeNetworkRequest(handler) {
  console.log("request pending");
  setTimeout(() => {
    handler(Math.ceil(Math.random() * 100));
  }, 2000);
}

function context(element) {
  return element === "svg" || element === "rect" || element === "text";
}

// RUN
render();
// setInterval(render, 100);
