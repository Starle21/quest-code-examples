// notify of change in svg
//  - place a handler into queue - with setTimeout 0 delay
//  - call a handler synchronously - with dispatchEvent or custom listeners
// -----------------
// TODO: context 0
// MODULE STORE
const data = {
  xCoord: undefined,
  yCoord: undefined,
  side: undefined,
  squareSelected: false,
};

// listeners
const storeListeners = [];
function observeStore(listener) {
  storeListeners.push(listener);
}

function controlStore(value, source) {
  console.log("5 store control", value, source);
  // update store data
  const { xCoord, yCoord, side, squareSelected } = value;
  if (xCoord != undefined) data.xCoord = xCoord;
  if (yCoord != undefined) data.yCoord = yCoord;
  if (side != undefined) data.side = side;
  if (squareSelected != undefined) data.squareSelected = squareSelected;
  console.log("6 data store", data);
  // notify listeners
  for (const listener of storeListeners) {
    if (listener.component !== source) {
      console.log("7 notify store listener", listener);
      listener.handler(data, "store");
    }
  }
}

// -----
// NETWORK
const buttonNetwork = document.querySelector("button");
buttonNetwork.onclick = () => {
  // notify data pending
  console.log("new request pending");
  makeNetworkRequest(controlStore);
};

function makeNetworkRequest(handler) {
  setTimeout(() => {
    handler(
      { xCoord: "100", yCoord: "30", side: "40", squareSelected: true },
      "network"
    );
  }, 2000);
}

// -------
// ELEMENTS
// -------
// -------
// TODO: context 1
// MODULE SVG
// SVG WITH COORDINATES PAGE
const dataSvg = {
  xCoord: undefined,
  yCoord: undefined,
  side: undefined,
  squareSelected: false,
};
// INPUTS DIV
const domInputs = document.querySelector(".squareInputs");
// add later so data is not owned by DOM
const domInputXCoord = document.querySelector(".squareInputs #xCoord");
const domInputYCoord = document.querySelector(".squareInputs #yCoord");
const domInputSide = document.querySelector(".squareInputs #side");
domInputs.oninput = (e) => {
  console.log("1 input");
  controlSvg({ [e.target.id]: e.target.value }, "input");
};
// add later so data is not owned by DOM
function renderInput() {
  domInputXCoord.value = dataSvg.xCoord;
  domInputYCoord.value = dataSvg.yCoord;
  domInputSide.value = dataSvg.side;
}
// -------
// SVG ELEMENT
const domSvg = document.querySelector("svg");
let domText = document.querySelector("text");
let domSquare = undefined;

const svgListeners = [];
function observeSvg(listener) {
  svgListeners.push(listener);
}

domSvg.addEventListener("click", (e) => {
  if (e.target === domSvg) {
    controlSvg({ squareSelected: false }, "svg");
  }
});
function controlSvg(value, source) {
  console.log("2 controlSvg", value, source);
  // update svg data
  const { xCoord, yCoord, side, squareSelected } = value;
  if (xCoord != undefined) dataSvg.xCoord = xCoord;
  if (yCoord != undefined) dataSvg.yCoord = yCoord;
  if (side != undefined) dataSvg.side = side;
  if (squareSelected != undefined) dataSvg.squareSelected = squareSelected;
  console.log("3 data svg", dataSvg);
  // render svg
  renderSvg();
  // notify listeners
  for (const listener of [...svgListeners]) {
    if (listener.component !== source) {
      console.log("4 notify svg listeners", listener);
      listener.handler(dataSvg, "svg");
    }
  }
}
function renderSvg() {
  console.log("render svg");
  renderSquare();
  renderText();
  // so data is not owned by DOM
  renderInput();
}
// -------
// Square
let stateSquare = "IS_HIDDEN";
function renderSquare() {
  console.log(stateSquare);
  switch (stateSquare) {
    case "IS_HIDDEN": {
      if (
        dataSvg.xCoord &&
        dataSvg.yCoord &&
        dataSvg.side &&
        !dataSvg.squareSelected
      ) {
        stateSquare = "IS_VISIBLE";
        domSquare = createSquare({
          x: dataSvg.xCoord,
          y: dataSvg.yCoord,
          side: dataSvg.side,
        });
        domSvg.appendChild(domSquare);
        break;
      }
      if (dataSvg.squareSelected) {
        stateSquare = "IS_SELECTED";
        console.log(stateSquare);
        domSquare = createSquare({
          x: dataSvg.xCoord,
          y: dataSvg.yCoord,
          side: dataSvg.side,
        });
        domSvg.appendChild(domSquare);
        createBoundingBox();
        break;
      }
      break;
    }
    case "IS_VISIBLE": {
      if (!dataSvg.xCoord || !dataSvg.yCoord || !dataSvg.side) {
        stateSquare = "IS_HIDDEN";
        removeSquare();
        break;
      }
      if (dataSvg.squareSelected) {
        stateSquare = "IS_SELECTED";
        createBoundingBox();
        updateSquare({
          x: dataSvg.xCoord,
          y: dataSvg.yCoord,
          side: dataSvg.side,
        });
        break;
      }
      updateSquare({
        x: dataSvg.xCoord,
        y: dataSvg.yCoord,
        side: dataSvg.side,
      });
      break;
    }
    case "IS_SELECTED": {
      if (!dataSvg.squareSelected) {
        stateSquare = "IS_VISIBLE";
        deleteBoundingBox();
        updateSquare({
          x: dataSvg.xCoord,
          y: dataSvg.yCoord,
          side: dataSvg.side,
        });
        console.log(stateSquare);
        break;
      }
      if (!dataSvg.xCoord || !dataSvg.yCoord || !dataSvg.side) {
        stateSquare = "IS_HIDDEN";
        dataSvg.squareSelected = false;
        removeSquare();
        break;
      }
      console.log("update square");
      updateSquare({
        x: dataSvg.xCoord,
        y: dataSvg.yCoord,
        side: dataSvg.side,
      });
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
    controlSvg({ squareSelected: true }, "square");
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
      if (dataSvg.xCoord && dataSvg.yCoord && dataSvg.side) {
        stateText = "IS_HIDDEN";
        removeText();
        break;
      }
      break;
    }
    case "IS_HIDDEN": {
      if (!dataSvg.xCoord || !dataSvg.yCoord || !dataSvg.side) {
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
// TODO: context 2
// COORDINATES
const dataCoord = {
  xCoord: undefined,
  yCoord: undefined,
  side: undefined,
  squareSelected: false,
};
const domCoordinates = document.querySelector(".coordinates");
let domStartPoint = undefined;
let domStartLabel = undefined;
let domMiddlePoint = undefined;
let domMiddleLabel = undefined;
// derived dataCoord
function calculateMiddlePoint(coord, side) {
  return Number(coord) + Number(side) / 2;
}
function formatMiddlePoint() {
  const middlePointX = calculateMiddlePoint(dataCoord.xCoord, dataCoord.side);
  const middlePointY = calculateMiddlePoint(dataCoord.yCoord, dataCoord.side);

  return `[${middlePointX}, ${middlePointY}]`;
}
function calculateDerivedValues() {
  const startPoint = `[${dataCoord.xCoord}, ${dataCoord.yCoord}]`;
  const middlePoint = formatMiddlePoint();
  return { startPoint, middlePoint };
}
function controlCoord(value, source) {
  // update dataCoord
  const { xCoord, yCoord, side, squareSelected } = value;
  if (xCoord != undefined) dataCoord.xCoord = xCoord;
  if (yCoord != undefined) dataCoord.yCoord = yCoord;
  if (side != undefined) dataCoord.side = side;
  if (squareSelected != undefined) dataCoord.squareSelected = squareSelected;
  console.log("8 data coord", dataCoord);
  // renderCoordinatesDiv
  renderCoordinatesDiv();
}

let stateCoordinates = "IS_HIDDEN";
function renderCoordinatesDiv() {
  switch (stateCoordinates) {
    case "IS_HIDDEN": {
      if (dataCoord.squareSelected) {
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
      if (!dataCoord.squareSelected) {
        stateCoordinates = "IS_HIDDEN";
        removeCoordinates();
        break;
      }
      if (!dataCoord.xCoord || !dataCoord.yCoord || !dataCoord.side) {
        stateCoordinates = "IS_HIDDEN";
        removeCoordinates();
        dataCoord.squareSelected = false;
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

// -------------
// INIT
observeSvg({ component: "store", handler: controlStore });
observeStore({ component: "svg", handler: controlSvg });
observeStore({ component: "coord", handler: controlCoord });
