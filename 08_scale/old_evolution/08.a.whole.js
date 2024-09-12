// procedural version - coding state transitions, without classes
// initial state defined in html
// -----------------
const data = {
  xCoord: undefined,
  yCoord: undefined,
  side: undefined,
};
let domText = document.querySelector("text");
let domSquare = undefined;

const domXInput = document.getElementById("xCoord");
const domYInput = document.getElementById("yCoord");
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
// <rect x="0" y="5" width="50" height="50"></rect>;
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
