// procedural version - coding state transitions, without classes
// initial state defined in html
// states encapsulates its whole behavior - including on enter and on exit
// - square states are created in an object
//  - onEnter and onExit depend which previous state we are coming from though..
//    or they are onExit destroying what onEnter they created - effectively undoing whatever changes they did and putting it into initial state..
// -----------------
// DATA

const data = {
  xCoord: undefined,
  yCoord: undefined,
  side: undefined,
  squareSelected: false,
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
      data.squareSelected = false;
      controller();
    }
  });
};

function renderSvg() {
  renderSquare();
  renderText();
}

// -------
// SQUARE
const squareStates = [
  {
    stateType: "IS_HIDDEN",
    onStateChange: () => {
      if (data.xCoord && data.yCoord && data.side) {
        return "IS_VISIBLE";
      }
      return null;
    },
    onEnter: () => {
      if (domSquare) removeSquare();
    },
    onExit: () => {
      // nop
    },
  },
  {
    stateType: "IS_VISIBLE",
    onStateChange: () => {
      if (!data.xCoord || !data.yCoord || !data.side) {
        return "IS_HIDDEN";
      }
      if (data.squareSelected) {
        return "IS_SELECTED";
      }
      updateSquare({ x: data.xCoord, y: data.yCoord, side: data.side });
      return null;
    },
    onEnter: () => {
      domSquare = new Square({
        x: data.xCoord,
        y: data.yCoord,
        side: data.side,
      }).element;
      domSvg.appendChild(domSquare);
    },
    onExit: () => {
      removeSquare();
    },
  },
  {
    stateType: "IS_SELECTED",
    onStateChange: () => {
      if (!data.squareSelected) {
        return "IS_VISIBLE";
      }
      if (!data.xCoord || !data.yCoord || !data.side) {
        return "IS_HIDDEN";
      }
      updateSquare({ x: data.xCoord, y: data.yCoord, side: data.side });
      return null;
    },
    onEnter: () => {
      // domSquare = new Square({
      //   x: data.xCoord,
      //   y: data.yCoord,
      //   side: data.side,
      // }).element;
      // domSvg.appendChild(domSquare);
      createBoundingBox();
    },
    onExit: () => {
      deleteBoundingBox();
      removeSquare();
    },
  },
];

let stateSquare = "IS_HIDDEN";
function renderSquare() {
  const currentState = squareStates.find((s) => s.stateType === stateSquare);
  const newStateType = currentState.onStateChange();
  if (newStateType) {
    currentState.onExit();
    stateSquare = newStateType;
    const newState = squareStates.find((s) => s.stateType === newStateType);
    newState.onEnter();
  }
}

class Square {
  constructor({ x, y, side }) {
    // accessor
    this.element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    this.element.setAttribute("x", x);
    this.element.setAttribute("y", y);
    this.element.setAttribute("width", side);
    this.element.setAttribute("height", side);
    this.element.onclick = () => {
      data.squareSelected = true;
      drawSquareWithProperties();
    };
  }
}

function updateSquare({ x, y, side }) {
  domSquare.setAttribute("x", x);
  domSquare.setAttribute("y", y);
  domSquare.setAttribute("width", side);
  domSquare.setAttribute("height", side);
}

function removeSquare() {
  domSquare.remove();
  domSquare = undefined;
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
// TEXT

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
// state transitions
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

// switching on the whole state of SVG, not individual elements
// - text has only 2 states, square has 3
// switch (data.stateSvg) {
//   case "IS_TEXT": {
//     if (data.xCoord && data.yCoord && data.side) {
//       data.stateSvg = "IS_SQUARE";
//       removeText();
//       domSquare = new Square({
//         x: data.xCoord,
//         y: data.yCoord,
//         side: data.side,
//       }).element;
//       domSvg.appendChild(domSquare);
//       break;
//     }
//     break;
//   }
//   case "IS_SQUARE": {
//     if (!data.xCoord || !data.yCoord || !data.side) {
//       data.stateSvg = "IS_TEXT";
//       removeSquare();
//       domText = createText();
//       domSvg.appendChild(domText);
//       break;
//     }
//     if (data.on) {
//       data.stateSvg = "IS_SELECTED";
//       createBoundingBox();
//       break;
//     }
//     updateSquare({ x: data.xCoord, y: data.yCoord, side: data.side });
//     break;
//   }
//   case "IS_SELECTED": {
//     if (!data.on) {
//       data.stateSvg = "IS_SQUARE";
//       deleteBoundingBox();
//       break;
//     }
//     if (!data.xCoord || !data.yCoord || !data.side) {
//       data.stateSvg = "IS_TEXT";
//       removeSquare();
//       domText = createText();
//       domSvg.appendChild(domText);
//       break;
//     }
//     updateSquare({ x: data.xCoord, y: data.yCoord, side: data.side });
//     break;
//   }
// }
