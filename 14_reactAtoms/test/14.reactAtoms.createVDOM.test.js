import {
  Coordinate,
  Svg,
  SvgMultiple,
  createVDOM,
  Deep,
  App,
} from "../14.reactAtoms.3";

describe.skip("effect", () => {
  test("effect for host element gets created", () => {
    const element = () => Coordinate({ coord: 10, name: "x" });
    const effect = {
      type: "htmlNode",
      domType: "div",
      props: null,
      children: "x coordinate is: 10",
    };
    const result = createVDOM(element);
    expect(result).toStrictEqual(effect);
  });
  test("effect for host element with children gets created", () => {
    const element = () => Svg({ x: 10, y: 5 });
    const effect = {
      type: "svgNode",
      domType: "svg",
      props: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
      children: [
        {
          type: "svgNode",
          domType: "rect",
          props: { x: 10, y: 5, width: "30", height: "30" },
        },
      ],
    };
    const result = createVDOM(element);
    expect(result).toStrictEqual(effect);
  });
  test("effect for host element with multiple children gets created", () => {
    const element = () => SvgMultiple({ x: 10, y: 5 });
    const effect = {
      type: "svgNode",
      domType: "svg",
      props: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
      children: [
        {
          type: "svgNode",
          domType: "rect",
          props: { x: 10, y: 5, width: "30", height: "30" },
        },
        {
          type: "svgNode",
          domType: "rect",
          props: { x: 10, y: 5, width: "30", height: "30" },
        },
      ],
    };
    const result = createVDOM(element);
    expect(result).toStrictEqual(effect);
  });
  test("effect for host element with deeply nested children gets created", () => {
    const element = () => Deep({ coord: 10, name: "zz" });
    const effect = {
      type: "htmlNode",
      domType: "div",
      props: null,
      children: [
        {
          type: "htmlNode",
          domType: "div",
          props: null,
          children: [
            {
              type: "htmlNode",
              domType: "div",
              props: null,
              children: "zz coordinate is: 10",
            },
            {
              type: "htmlNode",
              domType: "div",
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
      domType: null,
      props: null,
      children: [
        {
          type: "htmlNode",
          domType: "button",
          props: null,
          children: "request remote data",
          handlers: {
            onClick: () => {
              makeNetworkRequest(({ x, y }) => {
                setXCoord(x);
                setYCoord(y);
                console.log("local data updated from remote source");
              });
            },
          },
        },
        {
          type: "htmlNode",
          domType: "div",
          props: null,
          children: "x coordinate:",
        },
        {
          type: "htmlNode",
          domType: "input",
          props: { id: "x" },
          children: "",
          handlers: {
            onInput: (e) => {
              setXCoord(e.target.value);
            },
          },
        },
        {
          type: "htmlNode",
          domType: "div",
          props: null,
          children: "y coordinate:",
        },
        {
          type: "htmlNode",
          domType: "input",
          props: { id: "y" },
          children: "",
          handlers: {
            onInput: (e) => {
              setYCoord(e.target.value);
            },
          },
        },
        {
          type: "svgNode",
          domType: "svg",
          props: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 200 80" },
          children: [
            {
              type: "svgNode",
              domType: "text",
              props: { x: "0", y: "40", className: "small" },
              children: "Fill out all inputs!",
            },
          ],
        },
        {
          type: "htmlNode",
          domType: "div",
          props: null,
          children: "x coordinate is: ",
        },
        {
          type: "htmlNode",
          domType: "div",
          props: null,
          children: "y coordinate is: ",
        },
      ],
    };
    const result = createVDOM(element);
    // issue with deep equality of functions
    // expect(JSON.parse(JSON.stringify(result))).toEqual(effect);
    expect(JSON.stringify(result)).toEqual(JSON.stringify(effect));
  });
});
