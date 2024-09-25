// NOT WORKING, NEED TO MOCK DOM NODES, NEED TO MOCK GLOBAL VARIABLES (CURRENTVDOM)
import { diff } from "../14.reactAtoms.6";

describe.skip("diff", () => {
  test("new vdom has more children", () => {
    const oldVDOM = {
      type: "htmlNode",
      domType: "div",
      props: null,
      children: [
        {
          type: "htmlNode",
          domType: "input",
          props: { value: "10" },
          children: null,
          accessor: "oldAccessor",
        },
      ],
    };
    const newVDOM = {
      type: "htmlNode",
      domType: "div",
      props: null,
      children: [
        {
          type: "htmlNode",
          domType: "input",
          props: { value: "30" },
          children: null,
        },
        {
          type: "htmlNode",
          domType: "button",
          props: null,
          children: [
            {
              type: "htmlNode",
              domType: "text",
              props: { nodeValue: "click me" },
              children: null,
            },
          ],
        },
        {
          type: "htmlNode",
          domType: "input",
          props: { value: "40" },
          children: null,
        },
      ],
    };
    const calculatedFiber = {
      type: "htmlNode",
      domType: "div",
      props: null,
      children: [
        {
          type: "htmlNode",
          domType: "input",
          props: { value: "30" },
          children: null,
          flag: "UPDATE",
          accessor: "oldAccessor",
        },
        {
          type: "htmlNode",
          domType: "button",
          props: null,
          flag: "CREATE",
          children: [
            {
              type: "htmlNode",
              domType: "text",
              props: { nodeValue: "click me" },
              children: null,
            },
          ],
        },
        {
          type: "htmlNode",
          domType: "input",
          props: { value: "40" },
          children: null,
          flag: "CREATE",
        },
      ],
    };

    // const result = reconcileChildren(newVDOM.children, oldVDOM.children);
    expect(reconcileChildren(newVDOM.children, oldVDOM.children)).toStrictEqual(
      calculatedFiber.children
    );
  });
});

describe("diff", () => {
  test("puts deletion flags and creates deletion array", () => {
    const oldTree = {
      accessor: "acc",
      type: "div",
      domType: null,
      props: null,
      children: [
        {
          accessor: "acc",
          type: "htmlNode",
          domType: "input",
          props: { value: "58" },
          children: null,
        },
        {
          accessor: "acc",
          type: "htmlNode",
          domType: "input",
          props: { value: "19" },
          children: null,
        },
      ],
    };

    const newTree = {
      accessor: "acc",
      type: "div",
      domType: null,
      props: null,
      children: [
        {
          accessor: "acc",
          type: "htmlNode",
          domType: "input",
          props: { value: "58" },
          children: null,
        },
      ],
    };
    const processedTree = {
      accessor: "acc",
      type: "div",
      domType: null,
      props: null,
      deletions: [
        {
          accessor: "acc",
          type: "htmlNode",
          domType: "input",
          props: { value: "19" },
          children: null,
        },
      ],
      flag: "DELETECHILD",
      children: [
        {
          accessor: "acc",
          type: "htmlNode",
          domType: "input",
          props: { value: "58" },
          children: null,
        },
      ],
    };

    diff([newTree], [oldTree], oldTree);
    expect(newTree).toStrictEqual(processedTree);
  });
  test("tags new elements", () => {
    const newTree = {
      accessor: "acc",
      type: "htmlNode",
      domType: "div",
      props: null,
      children: [
        {
          accessor: "acc",
          type: "htmlNode",
          domType: "input",
          props: { value: "58" },
          children: null,
          return: newTree,
        },
        {
          accessor: "acc",
          type: "htmlNode",
          domType: "input",
          props: { value: "19" },
          children: null,
          return: newTree,
        },
      ],
    };

    const oldTree = {
      accessor: "acc",
      type: "htmlNode",
      domType: "div",
      props: null,
      children: [
        {
          accessor: "acc",
          type: "htmlNode",
          domType: "input",
          props: { value: "58" },
          children: null,
          return: oldTree,
        },
      ],
    };
    const processedTree = {
      accessor: "acc",
      type: "htmlNode",
      domType: "div",
      props: null,
      children: [
        {
          accessor: "acc",
          type: "htmlNode",
          domType: "input",
          props: { value: "58" },
          children: null,
          return: processedTree,
        },
        {
          accessor: "acc",
          type: "htmlNode",
          domType: "input",
          props: { value: "19" },
          children: null,
          tag: "CREATE",
          return: processedTree,
        },
      ],
    };

    diff([newTree], [oldTree], oldTree);
    expect(newTree).toStrictEqual(processedTree);
  });
});

// describe("diff", () => {
//   test("puts deletion flags and creates deletion array", () => {
//     const oldTree = {
//       type: "component",
//       domType: null,
//       props: null,
//       children: [
//         {
//           type: "htmlNode",
//           domType: "div",
//           props: null,
//           children: [],
//         },
//         {
//           type: "htmlNode",
//           domType: "div",
//           props: null,
//           children: [
//             {
//               type: "htmlNode",
//               domType: "input",
//             },
//           ],
//         },
//       ],
//     };
//   });
// });

// test("new vdom has more children", () => {
//     const oldVDOM = {
//       type: "htmlNode",
//       domType: "div",
//       props: null,
//       children: [
//         {
//           type: "htmlNode",
//           domType: "input",
//           props: { value: "10" },
//           children: null,
//         },
//         {
//           type: "htmlNode",
//           domType: "button",
//           props: null,
//           children: null,
//         },
//       ],
//     };
//     const newVDOM = {
//       type: "htmlNode",
//       domType: "div",
//       props: null,
//       children: [
//         {
//           type: "htmlNode",
//           domType: "input",
//           props: { value: "30" },
//           children: null,
//         },
//         {
//           type: "htmlNode",
//           domType: "button",
//           props: null,
//           children: [
//             {
//               type: "htmlNode",
//               domType: "text",
//               props: { nodeValue: "click me" },
//               children: null,
//             },
//           ],
//         },
//         {
//           type: "htmlNode",
//           domType: "input",
//           props: { value: "40" },
//           children: null,
//         },
//         {
//           type: "htmlNode",
//           domType: "input",
//           props: { value: "50" },
//           children: null,
//         },
//       ],
//     };
//     const calculatedFiber = {
//       type: "htmlNode",
//       domType: "div",
//       props: null,
//       children: [
//         {
//           type: "htmlNode",
//           domType: "input",
//           props: { value: "30" },
//           children: null,
//         },
//         {
//           type: "htmlNode",
//           domType: "button",
//           props: null,
//           children: [
//             {
//               type: "htmlNode",
//               domType: "text",
//               props: { nodeValue: "click me" },
//               children: null,
//             },
//           ],
//         },
//         {
//           type: "htmlNode",
//           domType: "input",
//           props: { value: "40" },
//           children: null,
//         },
//         {
//           type: "htmlNode",
//           domType: "input",
//           props: { value: "50" },
//           children: null,
//         },
//       ],
//     };
//     reconcileChildren(newVDOM.children, oldVDOM.children);
//     const result = reconcileChildren(newVDOM.children, oldVDOM.children);
//     expect(result).toStrictEqual(calculatedFiber);
//   });
