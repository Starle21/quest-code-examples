// procedural version - coding state transitions, without classes
// initial state defined in html
// state and variables (fields) moved closer to elements

// -----------------
// DATA

const data = {
  xCoord: undefined,
  yCoord: undefined,
  side: undefined,
  on: false,
};

// CONTROLLER
function drawSquareWithProperties() {
  renderSvg();
  renderCoordinatesDiv();
}

// -------
// -------
// ELEMENTS

// -------
// INPUTS DIV
const domInputs = document.querySelector(".squareInputs");

function addControllerToInputs(controller) {
  domInputs.oninput = (e) => {
    data[e.target.id] = e.target.value;
    controller();
  };
}

// -------
// SVG ELEMENT

const domSvg = document.querySelector("svg");
let domText = document.querySelector("text");
let domSquare = undefined;

const addControllerToSvg = (controller) => {
  domSvg.addEventListener("click", (e) => {
    if (e.target === domSvg) {
      data.on = false;
      controller();
    }
  });
};

let isText = () => {};
let gotAllInputsFilledOut = () =>
  data.xCoord && data.yCoord && data.side && !domSquare;
let gotMissingInput = () =>
  (!data.xCoord || !data.yCoord || !data.side) && domSquare;
let isSquare = () => data.xCoord && data.yCoord && data.side && !domText;

let isBoundingBox = () => data.on && domSquare;
let isNoBoundingBox = () => !data.on && domSquare;

function renderSvg() {
  if (isSquare()) {
    console.log("update square");
    updateSquare({ x: data.xCoord, y: data.yCoord, side: data.side });
  }
  if (gotAllInputsFilledOut()) {
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
  if (gotMissingInput()) {
    console.log("remove square");
    console.log("create text");

    removeSquare();
    domText = createText();
    domSvg.appendChild(domText);
  }
  if (isBoundingBox()) {
    createBoundingBox();
  }
  if (isNoBoundingBox()) {
    deleteBoundingBox();
  }
}

// -------
// SQUARE
function createSquare({ x, y, side }) {
  const domSquare = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  domSquare.setAttribute("x", x);
  domSquare.setAttribute("y", y);
  domSquare.setAttribute("width", side);
  domSquare.setAttribute("height", side);
  domSquare.onclick = () => {
    data.on = true;
    drawSquareWithProperties();
  };
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
// TEXT
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

// -------
// BOUNDING BOX - should ideally be separate component
function createBoundingBox() {
  domSquare.style.stroke = "red";
  domSquare.style.strokeWidth = "2";
}

function deleteBoundingBox() {
  domSquare.style.stroke = "none";
  domSquare.style.strokeWidth = undefined;
}

// -------
// COORDINATES

const domCoordinates = document.querySelector(".coordinates");
let domStartPoint = undefined;
let domStartLabel = undefined;
let domMiddlePoint = undefined;
let domMiddleLabel = undefined;

// derived data
function calculateMiddlePoint(coord, side) {
  return Number(coord) + Number(side) / 2;
}
function formatMiddlePoint() {
  const middlePointX = calculateMiddlePoint(data.xCoord, data.side);
  const middlePointY = calculateMiddlePoint(data.yCoord, data.side);

  return `[${middlePointX}, ${middlePointY}]`;
}

function calculateDerivedValues() {
  const startPoint = `[${data.xCoord}, ${data.yCoord}]`;
  const middlePoint = formatMiddlePoint();
  return { startPoint, middlePoint };
}

let gotInView = () => !domStartPoint && data.on;
let showCoordinates = () => domStartPoint;
let hideCoordinates = () => domStartPoint && !data.on;
let hideCoordinatesToInitialState = () =>
  (!data.xCoord || !data.yCoord || !data.side) && domStartPoint;
function gotSelectedFromEmpty() {}

function renderCoordinatesDiv() {
  if (showCoordinates()) {
    console.log("square is selected and updated");
    const { startPoint, middlePoint } = calculateDerivedValues();
    updateDiv(domStartPoint, startPoint);
    updateDiv(domMiddlePoint, middlePoint);
  }
  if (hideCoordinates()) {
    console.log("to square from selected");
    removeCoordinates();
    console.log(data);
  }

  if (gotInView()) {
    console.log("square got selected");

    const { startPoint, middlePoint } = calculateDerivedValues();

    domStartLabel = createLabel("start point:");
    domStartPoint = createDiv(startPoint);

    domMiddleLabel = createLabel("middle point:");
    domMiddlePoint = createDiv(middlePoint);

    domCoordinates.append(
      domStartLabel,
      domStartPoint,
      domMiddleLabel,
      domMiddlePoint
    );
  }

  if (hideCoordinatesToInitialState()) {
    console.log("to initial from selected");
    removeCoordinates();
    data.on = false;
  }
}

function removeCoordinates() {
  console.log("removing coordinates");
  domStartLabel.remove();
  domStartPoint.remove();
  domMiddlePoint.remove();
  domMiddleLabel.remove();
  domStartLabel = undefined;
  domStartPoint = undefined;
  domMiddlePoint = undefined;
  domMiddleLabel = undefined;
}

// -------
// DIV
function createDiv(textContent) {
  const domDiv = document.createElement("div");
  domDiv.textContent = textContent;
  return domDiv;
}

function updateDiv(domNode, textContent) {
  domNode.textContent = textContent;
}

// -------
// LABEL
function createLabel(textContent) {
  const domLabel = document.createElement("label");
  domLabel.textContent = textContent;
  return domLabel;
}

// ------------
// INIT
addControllerToInputs(drawSquareWithProperties);
addControllerToSvg(drawSquareWithProperties);
