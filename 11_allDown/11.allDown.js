// describe what we want
// description of an result element [type, props, contents(children), handler, directive]
// ----------
const domSvg = document.querySelector("svg");
const domInput = document.querySelector("input");
domInput.oninput = handleInput;
function handleInput() {
  xCoord = domInput.value;
}

// DATA
let xCoord = undefined;

// ELEMENTS
const Square = () => {
  return ["rect", { x: xCoord, y: "20", width: "30", height: "30" }];
};
const Text = () => {
  return [
    "text",
    { x: "0", y: "40", className: "small" },
    "Fill out all inputs!",
  ];
};
// TOP LEVEL API
function dataToDOM() {
  const accessor = xCoord ? convert(Square()) : convert(Text());
  domSvg.replaceChildren(accessor);
}
// CREATE ACCESSORS, RENDER TO DOM
function convert(element) {
  const node = document.createElementNS(
    "http://www.w3.org/2000/svg",
    element[0]
  );
  node.setAttribute("x", element[1].x);
  node.setAttribute("y", element[1].y);
  node.setAttribute("width", element[1].width);
  node.setAttribute("height", element[1].height);
  node.classList.add(element[1].className);
  node.textContent = element[2];
  node.onclick = element[3];
  return node;
}

// setInterval(dataToDOM, 100);
