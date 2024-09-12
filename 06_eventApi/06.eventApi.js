let xCoord;
const domInput = document.querySelector("input");
const domRect = document.querySelector("rect");

function handleInput() {
  // updating JS from DOM
  xCoord = domInput.value;

  domRect.x.baseVal.value = xCoord;
}

domInput.oninput = handleInput;

// ------------------
// using setInterval to pull/push values between JS/DOM constantly
// without event API

// let value;
// const domInput = document.querySelector("input");
// const domRect = document.querySelector("rect");

// function updateRect() {
//   value = domInput.value;
//   domRect.x.baseVal.value = value;
// }

// setInterval(updateRect, 1000);
