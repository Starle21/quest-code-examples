let _Component = null;
let _root = null;
let _hooks = null;

export let render =
  (hooks) =>
  (Component = _Component, root = _root) => {
    // if hooks are not changed, then do not render at all
    if (JSON.stringify(hooks) === _hooks) {
      return; // shitty memoization!
    } else {
      _hooks = JSON.stringify(hooks);
    }
    // nuke the existing rendered elements
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    console.log("component", Component);
    const Comp = reconcile(Component, root);
    _Component = Component;
    _root = root;
    console.log("comp", Comp);
    const dom = createDom(Comp);
    // mount the new ones
    root.appendChild(dom);
  };

// recursive funciton
// just goes through the component tree
// and calls functional components
// to get the element definitions
export function reconcile(Component, root) {
  const type = Component.type;
  console.log("type", type);
  if (Array.isArray(Component)) {
    return Component.map((child) => reconcile(child, root));
  }
  // if it is host component, just take the definition
  // if its a functional component, run it
  const Comp = typeof type === "string" ? Component : type();
  console.log("Comp", Comp);
  if (Comp.props && Comp.props.children) {
    Comp.props.children.forEach((child, idx) => {
      if (typeof child.type !== "string") {
        // recursive call for children
        Comp.props.children[idx] = reconcile(Comp.props.children[idx], root);
      }
    });
  }
  return Comp;
}

export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// recursive
export function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  const props = fiber.props || {};
  updateDom(dom, {}, props);
  if (props.children) {
    props.children.forEach((child) => {
      // recursion
      if (Array.isArray(child)) {
        child.forEach((x) => {
          dom.appendChild(createDom(x));
        });
      } else {
        dom.appendChild(createDom(child));
      }
    });
  }
  console.log(dom);
  return dom;
}
const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
function updateDom(dom, prevProps, nextProps) {
  console.log(prevProps);
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });
  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });
  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });
  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

const React = (() => {
  let hooks = [];
  let idx = 0;
  function workLoop() {
    idx = 0;
    render(hooks)();
    setTimeout(workLoop, 300);
  }
  setTimeout(workLoop, 300);
  function useState(initVal) {
    let state = hooks[idx] || initVal;
    let _idx = idx;
    let setState = (newVal) => {
      hooks[_idx] = newVal;
    };
    idx++;
    return [state, setState];
  }
  function useRef(val) {
    return useState({ current: val })[0];
  }
  function useEffect(cb, depArray) {
    const oldDeps = hooks[idx];
    let hasChanged = true;
    if (oldDeps) {
      hasChanged = depArray.some((dep, i) => !Object.is(dep, oldDeps[i]));
    }
    if (hasChanged) cb();
    hooks[idx] = depArray;
  }
  return {
    useState,
    render: render(hooks),
    useEffect,
    useRef,
    createElement,
  };
})();

function Component() {
  const [count, setCount] = React.useState(1);
  const list = useDogs(count);

  return (
    <main>
      <h1>
        {" "}
        This is <i>Not</i> React{" "}
      </h1>
      <button onClick={() => setCount(count + 1)}>Click me!!!! {count}</button>
      {list.map((item) => (
        <div>{item.text}</div>
      ))}
    </main>
  );
}

const gen = generateList();
function* generateList() {
  let index = 1;
  let array = [];
  while (index < 6) {
    array.push({ text: index });
    yield array;
    index++;
  }
}

function useDogs(count) {
  const [list, setList] = React.useState([]);
  React.useEffect(() => {
    // fetch("https://forkify-api.herokuapp.com/api/search?q=pizza" + count)
    // fetch("https://forkify-api.herokuapp.com/api/search?q=pizza")
    //   .then((x) => {
    //     console.log(x);
    //     return x.json();
    //   })
    //   .then((x) => {
    //     console.log(x);
    //     setList(x.recipes);
    //   });

    (async () => {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(setList(gen.next().value));
        }, 1000);
      });
    })();
  }, [count]);

  return list;
}

const rootElement = document.getElementById("root");
React.render(<Component />, rootElement);
