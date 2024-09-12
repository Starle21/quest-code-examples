// adding new selected state
// -----------------
const data = {
  xCoord: undefined,
  yCoord: undefined,
  side: undefined,
  squareSelected: false,
};
// -------
// ELEMENTS
// -------
// SVG WITH COORDINATES PAGE
function drawSquareWithProperties() {
  renderSvg();
  renderCoordinatesDiv();
}
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
      data.squareSelected = false;
      controller();
    }
  });
};
function renderSvg(e) {
  renderSquare();
  renderText();
}
// -------
// Square
let stateSquare = "IS_HIDDEN";
function renderSquare() {
  switch (stateSquare) {
    case "IS_HIDDEN": {
      if (data.xCoord && data.yCoord && data.side) {
        stateSquare = "IS_VISIBLE";
        domSquare = createSquare({
          x: data.xCoord,
          y: data.yCoord,
          side: data.side,
        });
        domSvg.appendChild(domSquare);
        break;
      }
      break;
    }
    case "IS_VISIBLE": {
      if (!data.xCoord || !data.yCoord || !data.side) {
        stateSquare = "IS_HIDDEN";
        removeSquare();
        break;
      }
      if (data.squareSelected) {
        stateSquare = "IS_SELECTED";
        createBoundingBox();
        break;
      }
      updateSquare({ x: data.xCoord, y: data.yCoord, side: data.side });
      break;
    }
    case "IS_SELECTED": {
      if (!data.squareSelected) {
        stateSquare = "IS_VISIBLE";
        deleteBoundingBox();
        break;
      }
      if (!data.xCoord || !data.yCoord || !data.side) {
        stateSquare = "IS_HIDDEN";
        data.squareSelected = false;
        removeSquare();
        break;
      }
      updateSquare({ x: data.xCoord, y: data.yCoord, side: data.side });
      break;
    }
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
    data.squareSelected = true;
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
// Text
let stateText = "IS_VISIBLE";
function renderText() {
  switch (stateText) {
    case "IS_VISIBLE": {
      if (data.xCoord && data.yCoord && data.side) {
        stateText = "IS_HIDDEN";
        removeText();
        break;
      }
      break;
    }
    case "IS_HIDDEN": {
      if (!data.xCoord || !data.yCoord || !data.side) {
        stateText = "IS_VISIBLE";
        domText = createText();
        domSvg.appendChild(domText);
        break;
      }
      break;
    }
  }
}
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
let stateCoordinates = "IS_HIDDEN";
function renderCoordinatesDiv() {
  switch (stateCoordinates) {
    case "IS_HIDDEN": {
      if (data.squareSelected) {
        stateCoordinates = "IS_VISIBLE";

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
        break;
      }
      break;
    }
    case "IS_VISIBLE": {
      if (!data.squareSelected) {
        stateCoordinates = "IS_HIDDEN";
        removeCoordinates();
        break;
      }
      if (!data.xCoord || !data.yCoord || !data.side) {
        stateCoordinates = "IS_HIDDEN";
        removeCoordinates();
        data.squareSelected = false;
        break;
      }
      const { startPoint, middlePoint } = calculateDerivedValues();
      updateDiv(domStartPoint, startPoint);
      updateDiv(domMiddlePoint, middlePoint);
      break;
    }
  }
}
function removeCoordinates() {
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
