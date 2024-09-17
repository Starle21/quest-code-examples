import { Square } from "../08.whole";

describe("Square", () => {
  test("gets created", () => {
    // expected rect accessor, not appended, but created in JS memory and in DOM C++ memory
    const element = new Square({ x: 5, y: 10, side: 50 }).el;
    expect(element).toBeInstanceOf(SVGElement);
    expect(element.tagName).toBe("rect");
  });
});
