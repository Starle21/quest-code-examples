// implementing event source
// subclassing event target
const domRect = document.querySelector("rect");
const domDiv = document.getElementById("point");

class SquareValues extends EventTarget {
  _y = null;
  constructor() {
    super();
  }
  get y() {
    return this._y;
  }
  update(value) {
    this._y = value;
    this.dispatchEvent(
      new CustomEvent("yChanged", {
        coordinate: "y",
        value,
      })
    );
  }
}
const squareValues = new SquareValues();

// updating DOM from JS
squareValues.addEventListener("yChanged", (e) => {
  domRect.y.baseVal.value = squareValues.y;
  domDiv.textContent = squareValues.y;
});

const handleNetwork = (value) => {
  squareValues.update(value);
  console.log("y coordinate changed");
};

makeNetworkRequest(handleNetwork);

// ---
function makeNetworkRequest(handler) {
  setTimeout(() => {
    handler(20);
  }, 2000);
}
