// use network request and its returning data changing yCoord as an example
const domRect = document.querySelector("rect");
const domDiv = document.getElementById("point");

let yCoord = domRect.y.baseVal.value;
console.log("y coordinate:", yCoord);

// accessor setter to show value
domDiv.textContent = yCoord;

const handleNetwork = (value) => {
  yCoord = value;
  console.log("y coordinate:", yCoord);
  domRect.y.baseVal.value = yCoord;
  domDiv.textContent = yCoord;
};

makeNetworkRequest(handleNetwork);

// -----------
function makeNetworkRequest(handler) {
  setTimeout(() => {
    handler(20);
  }, 2000);
}

// // use Point[xCoord,yCoord] as an example
// // accessors
// const domXInput = document.getElementById("x");
// const domRect = document.querySelector("rect");
// const domDiv = document.getElementById("point");

// // data
// // reading values from html/dom
// let xCoord = domRect.x.baseVal.value;
// let yCoord = domRect.y.baseVal.value;

// // derived data
// let startPoint = `[${xCoord},${yCoord}]`;

// // handler
// function updateRect() {
//   xCoord = domXInput.value;
//   domRect.x.baseVal.value = xCoord;
// }
// domXInput.oninput = updateRect;

// // accessor setter to show value
// domDiv.textContent = startPoint;
