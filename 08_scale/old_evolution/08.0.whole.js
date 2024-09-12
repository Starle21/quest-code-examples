// procedural version - coding state transitions, with classes
// -----------------
// const domRect = document.querySelector("rect");

// console.log(domRect);
// console.dir(domRect);

//-views
// -----------------
// page
class Page {
  //
}

// --points with coordinates
// <label>start point:</label>
// <div id="point"></div>
class Coordinates {
  //
}

// --svg
// -- --with rect
class Drawing {
  //
}

class SvgContainer {
  // States:
  // square not shown
  // square shown
  // square selected
  // square locked
  // square isDragged
  // square isPlaced
}

// <rect x="0" y="5" width="50" height="50"></rect>;
export class Square {
  #x;
  #y;
  #side;
  // create
  constructor({ x, y, side }) {
    this.#x = x;
    this.#y = y;
    this.#side = side;
    // accessor
    this.element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    this.element.setAttribute("x", this.#x);
    this.element.setAttribute("y", this.#y);
    this.element.setAttribute("width", this.#side);
    this.element.setAttribute("height", this.#side);
  }
  // update
  update() {
    //
  }
  // delete
  delete() {
    this.element.remove();
  }
}

// ------------------

class Text {
  element = document.querySelector("text");

  delete() {
    this.element.remove();
  }
}

// --inputs
// <div>x coordinate</div>
// <input id="x" />
class SquareInputs {
  //
}

// -----------------
const data = {
  xCoord: undefined,
  yCoord: undefined,
  side: undefined,
};
let domText = document.querySelector("text");
let domSquare = undefined;

const domXInput = document.getElementById("x");
const domYInput = document.getElementById("y");
const domSideInput = document.getElementById("side");
const domSvg = document.querySelector("svg");

// state
function isFilledOut() {
  return data.xCoord && data.yCoord && data.side && !domSquare;
}
function isNotFilledOut() {
  return (!data.xCoord || !data.yCoord || !data.side) && domSquare;
}
function isSquare() {
  return data.xCoord && data.yCoord && data.side && domSquare;
}

// handlers
// make it better with event delegation
function handleXInput() {
  data.xCoord = domXInput.value;
  console.log("state", data);
  renderSquare();
}
function handleYInput() {
  data.yCoord = domYInput.value;
  console.log("state", data);
  renderSquare();
}
function handleSideInput() {
  data.side = domSideInput.value;
  console.log("state", data);
  renderSquare();
}
function handleSquareClick() {
  console.log("square clicked!");
  // show coordinates
  // draw red border
}

domXInput.oninput = handleXInput;
domYInput.oninput = handleYInput;
domSideInput.oninput = handleSideInput;

// controller logic
// state transformations
function renderSquare() {
  if (isSquare()) {
    console.log("update square");
    updateSquare({ x: data.xCoord, y: data.yCoord, side: data.side });
  }
  if (isFilledOut()) {
    console.log("remove text");
    console.log("create square");
    removeText();

    domSquare = createSquare({
      x: data.xCoord,
      y: data.yCoord,
      side: data.side,
    });

    domSvg.appendChild(domSquare);
  }
  if (isNotFilledOut()) {
    console.log("remove square");
    console.log("create text");
    removeSquare();
    domText = createText();
    domSvg.appendChild(domText);
  }
}

// Square
function createSquare({ x, y, side }) {
  const domSquare = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  domSquare.setAttribute("x", x);
  domSquare.setAttribute("y", y);
  domSquare.setAttribute("width", side);
  domSquare.setAttribute("height", side);
  domSquare.onclick = handleSquareClick;
  return domSquare;
}

function removeSquare() {
  domSquare.remove();
  domSquare = undefined;
}

function updateSquare({ x, y, side }) {
  domSquare.setAttribute("x", x);
  domSquare.setAttribute("y", y);
  domSquare.setAttribute("width", side);
  domSquare.setAttribute("height", side);
}

// Text
function createText() {
  const domText = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  domText.setAttribute("x", 0);
  domText.setAttribute("y", 40);
  domText.classList.add("small");
  domText.textContent = "Fill out all inputs!";
  return domText;
}

function removeText() {
  domText.remove();
  domText = undefined;
}

// -------------------

// initial state in html
// coding transitions
// depending on previous actions the user did
// handlers for various users actions
// -- can directly affect view
// -- change some state flag
// -- will need to constantly check in which state element is
// checking states

//------------------
// ? rulers

// handlers and states

//------------------
//------------------
//-from
// -----------------
// view in html
// selecting nodes from DOM through accessors
// incomplete state in JS
// handler function to react based on user actions
// event api to register handler in DOM
// user can only change x input

//-get to
// -----------------
// data / state (model)
// objects, classes, components describing the (view) - html
// ? describe initial view in html
// hierarchically described views, nested
// user can input all square properties
// conditionally render text, if not all inputs provided
