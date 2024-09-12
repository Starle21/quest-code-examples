// procedural version - coding state transitions, without classes
// initial state defined in html
// using event delegation for inputs
// -----------------
const data = {
  xCoord: undefined,
  yCoord: undefined,
  side: undefined,
};
let domText = document.querySelector("text");
let domSquare = undefined;
let domPoint = undefined;

const domInputs = document.querySelector(".squareInputs");
// const domXInput = document.getElementById("xCoord");
// const domYInput = document.getElementById("yCoord");
// const domSideInput = document.getElementById("side");
const domSvg = document.querySelector("svg");
const domCoordinates = document.querySelector(".coordinates");

// -------
// state 2*2=4
function gotFilledOut() {
  return data.xCoord && data.yCoord && data.side && !domSquare;
}
function gotDeleted() {
  return (!data.xCoord || !data.yCoord || !data.side) && domSquare;
}
function isSquare() {
  return !domText;
}
function isText() {}

// -------
// handler/controller, set on parent div
function drawSquare(e) {
  // get user input, update data
  data[e.target.id] = e.target.value;

  console.log("state", data);

  // render square
  renderSquare();
}

domInputs.oninput = drawSquare;

// -------
// render logic
// state transformations
function renderSquare() {
  if (isSquare()) {
    console.log("update square");
    updateSquare({ x: data.xCoord, y: data.yCoord, side: data.side });
  }
  if (gotFilledOut()) {
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
  if (gotDeleted()) {
    console.log("remove square");
    console.log("create text");
    removeSquare();
    domText = createText();
    domSvg.appendChild(domText);
  }
}

// ELEMENTS
// -------
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

// -------
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
// A
// user event
// -- state
// -- -- behavior

// B
// state
// -- user event
// -- -- behavior

// -------------------
// dependency injection - injecting controller into handler - compare with bespoyasov
// in view element
function addHandler(handler) {
  // grab parent element
  // create listener
  // attach handler
}
