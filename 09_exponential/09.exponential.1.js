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
let domPoint = undefined;

// -------
function renderSvg(e) {
  // get user input, update data
  data[e.target.id] = e.target.value;

  // render square
  renderSquare();
  renderText();
}

domInputs.oninput = renderSvg;

// -------
// ELEMENTS
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
      updateSquare({ x: data.xCoord, y: data.yCoord, side: data.side });
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
