import { reconcileChildren } from "../14.reactAtoms.4";

describe("diff", () => {
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
