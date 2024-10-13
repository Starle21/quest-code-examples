// creating
export function createHostNode(type, domType, props) {
  let node = null;
  switch (type) {
    case "htmlNode": {
      node = document.createElement(domType);
      break;
    }
    case "svgNode": {
      node = document.createElementNS("http://www.w3.org/2000/svg", domType);
      break;
    }
  }
  setInitialDOMProperties(type, node, props);
  return node;
}

export function createHostTextNode(text) {
  return document.createTextNode(text);
}

function setInitialDOMProperties(type, node, props) {
  let domPropsKeys = [];
  let handlerKeys = [];
  domPropsKeys =
    props &&
    Object.keys(props).filter(
      (key) => key !== "children" && !key.startsWith("on")
    );
  handlerKeys =
    props && Object.keys(props).filter((key) => key.startsWith("on"));
  if (domPropsKeys.length === 0 && handlerKeys.length === 0) {
    return;
  }
  switch (type) {
    case "htmlNode": {
      domPropsKeys.forEach((key) => {
        node[key] = props[key];
      });
      break;
    }
    case "svgNode": {
      domPropsKeys.forEach((key) => {
        node.setAttribute(key, props[key]);
      });
      break;
    }
  }
  handlerKeys.forEach((key) => {
    const eventType = key.toLocaleLowerCase().substring(2);
    node.addEventListener(eventType, props[key]);
  });
}

export function appendChildToContainer(container, child) {
  container.appendChild(child);
}

// remove
export function removeChild(container, child) {
  container.removeChild(child);
}

// update - call node props with new data
// other dom nodes
export function shouldNotMarkForCommitUpdate(oldProps, newProps) {
  if (JSON.stringify(oldProps) === JSON.stringify(newProps)) {
    return true;
  } else {
    return false;
  }
}

// text
export function commitHostTextUpdate(node, newText) {
  node.nodeValue = newText;
}

export function commitHostNodeUpdate(
  type,
  newNode,
  oldNode,
  newProps,
  oldProps
) {
  let domPropsKeys = [];
  let oldDomPropsKeys = [];
  let newHandlerKeys = [];
  let oldHandlerKeys = [];
  domPropsKeys =
    newProps &&
    Object.keys(newProps).filter(
      (key) => key !== "children" && !key.startsWith("on")
    );
  oldDomPropsKeys =
    oldProps &&
    Object.keys(oldProps).filter(
      (key) => key !== "children" && !key.startsWith("on")
    );
  newHandlerKeys =
    newProps && Object.keys(newProps).filter((key) => key.startsWith("on"));
  oldHandlerKeys =
    oldProps && Object.keys(oldProps).filter((key) => key.startsWith("on"));
  oldHandlerKeys.forEach((key) => {
    const eventType = key.toLocaleLowerCase().substring(2);
    oldNode.removeEventListener(eventType, oldProps[key]);
  });
  newHandlerKeys.forEach((key) => {
    const eventType = key.toLocaleLowerCase().substring(2);
    newNode.addEventListener(eventType, newProps[key]);
  });
  switch (type) {
    case "htmlNode": {
      oldDomPropsKeys.forEach((key) => {
        newNode[key] = null;
      });
      domPropsKeys.forEach((key) => {
        newNode[key] = newProps[key];
      });
      break;
    }
    case "svgNode": {
      oldDomPropsKeys.forEach((key) => {
        newNode.setAttribute(key, null);
      });
      domPropsKeys.forEach((key) => {
        newNode.setAttribute(key, newProps[key]);
      });
      break;
    }
  }
}
