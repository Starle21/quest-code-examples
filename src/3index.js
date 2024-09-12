// manual sync between JS-->DOM
// forkify like, form like, acko delta changes
// exponential delta code, stateful/imperative
// html - empty, populated from JS
// (maybe easier in the start - populate parts of html which doesnt change)

// create, update, delete
// Inputs
// SVG
// Rectangle

// event handlers
// checking state in handler or in "render method"

5. more reacty internals, tree schema
-  findDiff
-  replaceChildren
-  convert
-  createVDOM
-  updateDOM
-  directives
-  hook
-  declarative components
-  data
  - all the pieces
- UI hard parts
  - handlers only change state
  - all data in JS, not kept in DOM
- single source in JS memory, one way data flow
  - describing state in one place, underlying runtime generates transitional code
- take all down, as if from clean slate, declarative component
---
- new state = f(previous state, event)
- component = f(props * state)
- view = f(state)
- dataflow
4. react strategies


---------------
  (- cycles in events/observers)
- no consistency, no single place for source of particular data for a particular scope, where it is written
  - rect app and units schema
- adding 1 new state - exponential increase
3. issues
- from render method
- checking state flags
- saving state
2. coding from handlers
1. part in html, part in js
0. how to scale to whole app? - flesh out event loop more, nondeterminism, concurrency








