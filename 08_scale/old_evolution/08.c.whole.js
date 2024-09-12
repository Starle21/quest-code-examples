// procedural version - coding state transitions, without classes
// initial state defined in html
// adding new state / new data / new properties
// STATE TRANSITION CODE IS VERY BRITTLE - not sure, if it can't get to a wrong state!
// -----------------

// data
// states
// user events
// handler / controller
// element
// - in render:
// - create
// - update (when its properties/state changed)
// - delete

// -------------
// data

// controller

// element
// data
// state - creating, updating, deleting
// behavior
// handler

// -------------
// data
const data = {
  xCoord: undefined,
  yCoord: undefined,
  side: undefined,
  on: false,
};
let domText = document.querySelector("text");
let domSquare = undefined;
let domStartPoint = undefined;
let domStartLabel = undefined;
let domMiddlePoint = undefined;
let domMiddleLabel = undefined;

const domInputs = document.querySelector(".squareInputs");
const domSvg = document.querySelector("svg");
const domCoordinates = document.querySelector(".coordinates");

// -------
// initial state transitions, 2 * 2 = 4
function gotAllInputsFilledOut() {
  return data.xCoord && data.yCoord && data.side && !domSquare;
}
function gotMissingInput() {
  return (!data.xCoord || !data.yCoord || !data.side) && domSquare;
}
function isText() {}
function isSquare() {
  return !domText;
}

// ----------
// new state transitions +5, 3 * 3 = 9
function gotSelected() {
  return !domStartPoint && data.on;
}
function gotUnselected() {
  return domStartPoint && !data.on;
}
function isSelected() {
  return domStartPoint;
}
function gotToTextFromSelected() {
  return (!data.xCoord || !data.yCoord || !data.side) && domStartPoint;
}
function gotSelectedFromEmpty() {}

// -------
// -------
// CONTROLLER / handler

// ONINPUT inputs
function drawSquare(e) {
  // on every input change

  // get new data from user
  data[e.target.id] = e.target.value;

  console.log("state", data);

  // render or update or remove based on data
  renderSquare();
  renderCoordinates();
}

domInputs.oninput = drawSquare;

// ONCLICK square
function drawProperties() {
  // show coordinates
  renderCoordinates();

  // draw red border
  renderBoundingBox();
}

domSvg.addEventListener("click", (e) => {
  if (e.target === domSvg) {
    data.on = false;
    drawProperties();
  }
});

// -------
// -------
// ELEMENTS

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
// SQUARE ELEMENT
function renderSquare() {
  if (gotAllInputsFilledOut()) {
    removeText();

    domSquare = createSquare({
      x: data.xCoord,
      y: data.yCoord,
      side: data.side,
    });

    domSvg.appendChild(domSquare);
  }
  if (gotMissingInput()) {
    removeSquare();
    domText = createText();
    domSvg.appendChild(domText);
  }
  if (isSquare()) {
    updateSquare({ x: data.xCoord, y: data.yCoord, side: data.side });
  }
}

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
    drawProperties();
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
// BOUNDING BOX - should ideally be separate component

function renderBoundingBox() {
  if (data.on && domSquare) {
    domSquare.style.stroke = "red";
    domSquare.style.strokeWidth = "2";
  }
  if (!data.on && domSquare) {
    domSquare.style.stroke = "none";
    domSquare.style.strokeWidth = undefined;
  }
}

// -------
// COORDINATES
function renderCoordinates() {
  if (isSelected()) {
    console.log("square is selected and updated");
    const { startPoint, middlePoint } = calculateDerivedValues();
    updateDiv(domStartPoint, startPoint);
    updateDiv(domMiddlePoint, middlePoint);
  }
  if (gotUnselected()) {
    console.log("to square from selected");
    removeCoordinates();
    renderBoundingBox();
    console.log(data);
  }

  if (gotSelected()) {
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

  if (gotToTextFromSelected()) {
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

// -------------------
// DERIVED DATA

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
