import React, { useState } from "react";

const App = () => {
  // x input
  // y input
  // side length
  //--> show rectangle
  //--> show coordinates of all edges

  //--> show cursor coordinates

  //--> show rulers on the edges of svg area
  // ? ability to change scale of rulers

  // animation
  // play transition
  // move transition manually
  // range input
  // choose shape
  // --> move transition
  // --> morph into a different shape

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [side, setSide] = useState(0);

  const handleX = (e) => {
    setX(e.target.value);
  };
  const handleY = (e) => {
    setY(e.target.value);
  };

  const handleSide = (e) => {
    setSide(e.target.value);
  };

  // input user values
  // derived values
  // calculate coordinates of all edges
  // multiple places showing different versions of the same data
  // -- coordinates of all edges next to the points in the svg?
  // -- detail of a rectangle after clicking on it - showing coordinates of its egdes, central point

  return (
    <div>
      <div>Give me</div>
      <div>x coordinate</div>
      <input onInput={handleX} />
      <div>y coordinate</div>
      <input onInput={handleY} />
      <div>side length</div>
      <input onInput={handleSide} />
      <div>and I'll draw a rectangle for you</div>
      <svg
        viewBox="0 0 200 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ background: "gray" }}
      >
        {!x || !y || !side ? (
          <text x={20} y={20}>
            fill all inputs
          </text>
        ) : (
          <rect x={x} y={y} width={side} height={side}></rect>
        )}
      </svg>
    </div>
  );
};
export { App };
