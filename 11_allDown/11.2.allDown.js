// describe what we want
// description of an result element [type, props, contents(children), handler, directive]
// ----------
// runs in task
const domSvg = document.querySelector("svg");
const domInput = document.querySelector("input");
domInput.oninput = handleInput;
function handleInput() {
  xCoord = domInput.value;
}

// DATA
let xCoord = undefined;

// ----------
// runs in request ani frame

// ELEMENTS
const jsxSquare = ({ x }) => {
  return {
    domType: "rect",
    props: { x, y: "20", width: "30", height: "30", children: null },
  };
};

const jsxAlert = () => {
  return {
    domType: "text",
    props: {
      x: "0",
      y: "40",
      class: "small",
      children: "Fill out all inputs!",
    },
  };
};

// TOP LEVEL API
function dataToDOM() {
  const description = xCoord ? jsxSquare({ x: xCoord }) : jsxAlert();
  const accessor = convertToDOMNode(description);
  domSvg.replaceChildren(accessor);
}

// CREATE ACCESSORS, RENDER TO DOM
function convertToDOMNode(element) {
  const node = document.createElementNS(
    "http://www.w3.org/2000/svg",
    element.domType
  );
  Object.keys(element.props)
    .filter((key) => key !== "children")
    .map((key) => {
      node.setAttribute(key, element.props[key]);
    });
  node.textContent = element.props.children;
  return node;
}

// RUN
const render = () => {
  dataToDOM();
  requestAnimationFrame(render);
};
// requestAnimationFrame(render);
