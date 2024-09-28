// NOT WORKING, NEED TO MOCK DOM NODES, NEED TO MOCK GLOBAL VARIABLES (CURRENTVDOM)
// import { createEffects } from "../14.reactAtoms.8";

describe.skip("child effect", () => {
  test("gets created from functional component", () => {
    const AppTrue = () => {
      return () => Container();
    };

    const Container = () => {
      return {
        type: "htmlNode",
        domType: "div",
        props: null,
        children: null,
      };
    };

    const element = {
      type: "component",
      domType: null,
      props: null,
      children: null,
      function: AppTrue,
    };

    const result = {
      type: "htmlNode",
      domType: "div",
      props: null,
      children: null,
    };

    expect(createEffects(element)).toEqual(result);
  });
  test("gets created from host element", () => {
    const childElement = jest.fn(() =>
      Text({ nodeValue: "Fill out all inputs!" })
    );

    const jsxContainer = () => {
      return {
        type: "htmlNode",
        domType: "div",
        props: null,
        children: [childElement],
      };
    };

    function Text({ nodeValue }) {
      return {
        type: "textNode",
        domType: "text",
        props: { nodeValue },
        children: null,
      };
    }

    const result = {
      type: "htmlNode",
      domType: "div",
      props: null,
      children: [childElement],
    };

    expect(createEffects(jsxContainer)).toStrictEqual(result);
  });
});
