// procedural version - coding state transitions, using event delegation for inputs
// -----------------
const data = {
  xCoord: undefined,
  yCoord: undefined,
  side: undefined,
};
const domInputs = document.querySelector(".squareInputs");
const domSvg = document.querySelector("svg");
let domText = document.querySelector("text");
let domSquare = undefined;
const domCoordinates = document.querySelector(".coordinates");
let domPoint = undefined;

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
function renderSvg(e) {
  // get user input, update data
  data[e.target.id] = e.target.value;

  console.log("state", data);

  // render square
  renderSquare();
}

domInputs.oninput = renderSvg;

// -------
// render logic
// state transformations
function renderSquare() {
  if (isSquare()) {
    updateSquare({ x: data.xCoord, y: data.yCoord, side: data.side });
  }
  if (gotFilledOut()) {
    removeText();
    domSquare = createSquare({
      x: data.xCoord,
      y: data.yCoord,
      side: data.side,
    });
    domSvg.appendChild(domSquare);
  }
  if (gotDeleted()) {
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
