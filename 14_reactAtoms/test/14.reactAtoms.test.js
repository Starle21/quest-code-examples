import {
  Coordinate,
  Svg,
  SvgMultiple,
  createVDOM,
  Deep,
  App,
} from "../14.reactAtoms.4";

describe("effect", () => {
  test("effect for host element gets created", () => {
    const element = () => Coordinate({ coord: 10, name: "x" });
    const effect = {
      type: "div",
      props: null,
      children: "x coordinate is: 10",
    };
    const result = createVDOM(element);
    expect(result).toStrictEqual(effect);
  });
  test("effect for host element with children gets created", () => {
    const element = () => Svg({ x: 10, y: 5 });
    const effect = {
      type: "svg",
      props: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
      children: [
        { type: "rect", props: { x: 10, y: 5, width: "30", height: "30" } },
      ],
    };
    const result = createVDOM(element);
    expect(result).toStrictEqual(effect);
  });
  test("effect for host element with multiple children gets created", () => {
    const element = () => SvgMultiple({ x: 10, y: 5 });
    const effect = {
      type: "svg",
      props: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
      children: [
        { type: "rect", props: { x: 10, y: 5, width: "30", height: "30" } },
        { type: "rect", props: { x: 10, y: 5, width: "30", height: "30" } },
      ],
    };
    const result = createVDOM(element);
    expect(result).toStrictEqual(effect);
  });
  test("effect for host element with deeply nested children gets created", () => {
    const element = () => Deep({ coord: 10, name: "zz" });
    const effect = {
      type: "div",
      props: null,
      children: [
        {
          type: "div",
          props: null,
          children: [
            {
              type: "div",
              props: null,
              children: "zz coordinate is: 10",
            },
            {
              type: "div",
              props: null,
              children: "zz coordinate is: 10",
            },
          ],
        },
      ],
    };
    const result = createVDOM(element);
    expect(result).toStrictEqual(effect);
  });
  test("whole App effects get created", () => {
    const element = App;
    const effect = {
      type: "component",
      props: null,
      children: [
        {
          type: "button",
          props: null,
          children: "request remote data",
          handler: () => {
            makeNetworkRequest(({ x, y }) => {
              setXCoord(x);
              setYCoord(y);
              console.log("local data updated from remote source");
            });
          },
        },
        { type: "div", props: null, children: "x coordinate:" },
        {
          type: "input",
          props: { id: "x" },
          children: "",
          handler: (e) => {
            setXCoord(e.target.value);
          },
        },
        { type: "div", props: null, children: "y coordinate:" },
        {
          type: "input",
          props: { id: "y" },
          children: "",
          handler: (e) => {
            setYCoord(e.target.value);
          },
        },
        {
          type: "svg",
          props: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
          children: [
            {
              type: "text",
              props: { x: "0", y: "40", className: "small" },
              children: "Fill out all inputs!",
            },
          ],
        },
        {
          type: "div",
          props: null,
          children: "x coordinate is: ",
        },
        {
          type: "div",
          props: null,
          children: "y coordinate is: ",
        },
      ],
    };
    const result = createVDOM(element);
    // issue with deep equality of functions
    expect(JSON.parse(JSON.stringify(result))).toStrictEqual(effect);
  });
});
