more reacty internals, tree schema
...
calculation phase
- begin
    - creating fibers (memoizing)
- complete
    - creating dom nodes
    - attaching child dom nodes to parent dom nodes
effect phase - running visible actions
    - delete - first performing deletions
    - create - appending top dom node subtree
    - update - updating properties and values
    - passive effects (user defined side effectuful functions)
    - state effects 
    - memo effects
...
https://github.com/reactjs/react-basic
1. UI as a projection of data, function od data - props data --> produces object description
2. abstraction - defining reusable pieces, 
3. composition - easily combine different abstractions into a new abstraction
4. local state specific to a component, passing props from a single atom at the top, without side effects
5. memoization - with pure functions, not have to rerun if args are the same
6. lists
7. continuations - when many lists of lists - deferring execution of a function, passing state through from outside
8. state map
9. memoization map - when memoizing a lot of nested items - caching algorithm needed - UI relatively stable - same position in the tree gets the same value every time
10. algebraic effects - not having to pass every data dependency value through several levels of abstractions
...
11. scheduler
    - user pushes (dispatches) data (reactive, real-time, data producers), scheduler 'pulls' (data on demand, data consumers) from a queue of tasks - reduces pushes into batches for calculation and schedules dom update
    - gives priority to tasks, priority queues
    - handle async functions
...
12. no dsl templates - jsx, javascript
13. server side rendering, static site generation
14. one way data flow, following data dependencies, DAG
15. reconciler
16. event system (react-dom)
...
17. deterministic handling of side effects, runtime for side effects, one clear place where it is handled
...
1. create element effect
- render phase
2. create fiber for the effect in parent fiber, wip moved to child fiber
3. process that fiber 
    - on begin
        - call its function (for functional component) 
        - create fiber for children
    - on complete
        - for host fiber create host DOM node and appends its DOM children
4. on commit 
    - recurse from the top to the elements that have flags
...
...
Element - smallest userland unit, description of state result, object form
Component - description of state result, gathers elements, components, form of function
Fiber - memoized Component of type object on the heap, created on parent render
- holds type, props, component function, state 
- rendering fiber
    - global currentFiber points to current WIP
    - if fiber root fiber
        - fiber gets created in createRoot as the first fiber
            - gets returned with host root fiber to user to call render on
                - render called
                    - turns passed in jsx into effect
                    - schedules task to do ... interleaving possible here ...
                        - starts rendering from the fiber root
                            - prepares fresh wip root, creates new fiber for host root, marks it as wip
                                - starts work loop on the wip -->
    - if host root fiber is wip (we are starting at the top)
        - fiber gets created in createRoot as the second fiber
        - or is created in preparing fresh wip root and gets marked as wip
            --> starts begin work loop on the wip
                - checks if current, checks if props pointers match, if no context or if no update scheduled - bails out of this fiber
                    - reconcile children if above false
                        - creates fiber for App
                    - marks wip as its first child
            --> starts complete work loop
                - noop, wip root finished
                - go to on finish wip root
    - if host fiber
        --> starts begin work loop on the wip (div)
            - checks if current, checks if props pointers match, if no context or if no update scheduled - bails out of this fiber
                - reconcile children if above false
                    - creates fibers for div's children
                - marks wip as the first returned child
                - or if reached bottom, starts complete work
        --> starts complete work loop
            - creates DOM node for the fiber
            - appends already created children DOM nodes (for dom nodes except for host text - that one is always at the leaf)
            - moves to sibling and changes to begin work loop or moves to parent and stays in the complete work loop
            
    - if fce fiber
        --> starts begin work loop on the wip (App)
            - checks if current, checks if props pointers match, if no context or if no update scheduled - bails out of this fiber
                - calls fce with hooks
                    - calls Component function
                    - executes fce, executes hooks (useState and useMemo), sets initial state in memoizedState right away
                    - unwraps childrens' jsx into effects
                - reconcile children
                    - creates fiber for the first child - div child
                - marks wip as its first child
         --> starts complete work loop
            - noop, moves to sibling or parent
- on finishing wip root
    - check finish type
        - on RootCompleted
            - go to commitRoot
                - recursively traverse the tree from the top, check flags on fibers
                    - for commitPlacement tag (create new node) - recurse for first host node, call append to append div to div#root 
                - change current pointer in root fiber to point to finished work (previously wip)

...

<type of element, props, children>
element 
<div className='foo'>Hello</div>
transpiles to
React.createElement('div',{className: 'foo'},"Hello")
when called returns element description = effect:
{type: 'div', props:{className:'foo', children:"Hello"}}

...
component 
<App/>
transpiles to
React.createElement('f App()', {})
component description = effect:
{type: f App(), props: {}}

React.createRoot is called
- creates fibers for FiberRoot and HostRoot(div)
React.render is called
element description - effect is passed into render fce as argument
(task is scheduled - put into queue)
... (interleaving possible)
(task is run - taken from queue)
(start processing whole tree from root)
(run user defined effects)
(when you start for the first time, create second tree - create another root - another fiber for host element where fiber tree resides - for div#root defined in html)
(make that fiber for div#root the workInProgress fiber)
..
(start work loop with that wip - div#root)
(check props passed to wip fiber - they are null bcs it's the top div#root)
(reconcile children - wip fiber (div#root), current child (null), new child effect (the App element/effect))
new fiber for App created:
const AppFiber = {
  type: "functionalComponent",
  functionToCall: Component,
  state: [],
  parent: "parentFiberNode",
  alternateFiberOnCurrentTree: null,
  child: "not yet resolved",
};
..
wip moved to AppFiber
check props passed to the AppFiber if there is current fiber (there is not)
renderWithHooks
  - call App functional component App(), from AppFiber
    - var children = Component(props, context);
    - calls hooks if there are any - useState fce imported through ReactCurrentDispatcher
        - component's fiber accessible through ReactCurrentOwner.current in component's scope 
        - memoized state on fiber updated
reconcile children - unwrap jsx, create effects, create fibers for the first one



----
MOUNT
- fiber root
    - keeps reference to the dom node
    - keeps reference to current fiber tree
- host root (div)
    - created before work loops in preparing fresh stack in perfromConcurrentWorkOnRoot
    - return: null
    - stateNode: points to fiber root
    - set as WIP
begin (creating fibers or reusing them - do I need to rerun this "stack"?)
- if there is a current, compares props, context, flags if it can bail out of computing the fiber altogether
- switch on type:
- host root
    - nothing to do on the fiber itself
    - reconcile children
        - checks if it is a react type element
        - if current null - creates fiber
            - marks it with Placement tag
        - if there is current - clones fiber from the old one
    - returns its child as wip
- functional component
    - call functional component to unwrap child effects
    - flags it with PerformedWork
    - reconcile children (newly unwraped elements)
        - if current null - creates fiber
            - marks it with Placement tag
        - if there is current - clones fiber from the old one
        - creates fiber for the fist one
    - sets child as wip
- host element
    - nothing to do on the fiber itself
    - reconcile children
        - if current null - creates fiber
            - marks it with Placement tag
        - if there is current
            - clones fiber
                - create fiber

- host text
    - noop

complete (creating dom nodes if applicable and connecting them)
- host root
    - noop, calculation phase finished
- functional component
    - noop
- host element
    - make dom node for it
    - connect it with its children

commit
- recurse to the fiber that has deletion array
- delete - process deletion array
- place - if it has placement mark, do placement
- update - if it has update mark, do update


RERENDER





.......
incremental
- avoids redundant recomputation - memoized
- call it repeatedly with new input, re-run subtrees selectively, memoize recursively

reactive
- dispatch and data flow is implicit and 1-way

declarative
- side-effects are auto-mounted and disposed



...
packages

react-dom
 - div, span, h1
react
 - react component, 
 - hooks/effects, 
 - props, state
 - key, ref, context
 - react.lazy, error boundaries
 - concurrent mode, suspense
react-reconciler
 - memoizing functions - their stack frames = fiber tree - directed acyclic tree (/ graph if added returned path viz Live)
 - follows data flow principles - control flow follows data dependencies
 - figure out what state transitions to do
 - diff on tag update
 - running effects in order