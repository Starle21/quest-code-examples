// just mount a canvas and do a MultiGather inside for draws and event handlers
// here is e.g. a canvas component
// you can then add e.g. a TransformContext to share matrix transforms from parent to child
// and if you want to optimize it, you can then make a secondary context ProjectionContext which contains the TransformContext by reference and is used by the drawing shapes just-in-time (so that changing the transform doesn't ping the shape components)

// context - passing values down a tree
// makeContext, <Provide/>, useContext

// reverse of context provider - capturing values from a subtree
// makeCapture
// <Capture then={()={}}/>  (Resume(Component))

// <Gather>
// <Yeet>{value}</Yeet>
// <MultiGather>
// <MapReduce>
import type { LC, PropsWithChildren } from '@use-gpu/live';

import { MultiGather, useOne, useNoOne, useResource } from '@use-gpu/live';

type CanvasProps = {
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  dpi: number,
};

type CanvasOps = {
  draw?: Drawable[],
  mousedown?: EventHandler[],
  mousemove?: EventHandler[],
  mouseup?: EventHandler[],
  wheel?: EventHandler[],
  click?: EventHandler[],
  contextmenu: EventHandler[],
  DOMMouseScroll?: EventHandler[],
};

type Drawable = {
  zIndex?: number,
  render: (context: CanvasRenderingContext2D, dpi: number) => void;
};

type CanvasEvent<T> = T & {
  propagationStopped: boolean,
};

type EventHandler = (event: CanvasEvent<any>, element: HTMLElement) => void;

export const Canvas: LC<CanvasProps> = (props: PropsWithChildren<CanvasProps>) => {
  const {canvas, width, height, dpi, children} = props;

  return (
      <MultiGather children={children} then={(ops: CanvasOps) => {
        const {draw, click, contextmenu, mousemove, mousedown, mouseup, wheel, DOMMouseScroll} = ops;

        const context = canvas.getContext('2d');
        context.resetTransform();
        context.clearRect(0, 0, width, height);
        context.scale(dpi, dpi);

        if (draw) {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useOne(() => draw.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)), draw);
          for (const call of draw) {
            call.render(context, 1);
          }
        }
        else {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useNoOne();
        }

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEventHandler(canvas, 'click', click);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEventHandler(canvas, 'pointermove', mousemove);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEventHandler(canvas, 'pointerdown', mousedown);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEventHandler(canvas, 'pointerup', mouseup);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEventHandler(canvas, 'wheel', wheel);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEventHandler(canvas, 'DOMMouseScroll', DOMMouseScroll);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEventHandler(canvas, 'contextmenu', contextmenu);
      }} />
  );
};

const useEventHandler = (el: HTMLElement, type: string, handlers?: EventHandler[]) =>
  useResource((dispose) => {
    if (!handlers) return;

    // Events are dispatched in reverse tree order,
    // i.e. child before parent, later sibling before earlier sibling
    const list = handlers.slice().reverse();

    const handle = (e: Event) => {
      const {stopPropagation} = e;
      
      const ev = e as CanvasEvent<any>;
      ev.stopPropagation = () => {
        stopPropagation.call(ev);
        ev.propagationStopped = true;
      };

      for (const handler of list) if (handler) {
        handler(ev, el);
        if (ev.propagationStopped) break;
      }
    };

    el.addEventListener(type, handle);
    dispose(() => {
      el.removeEventListener(type, handle);
    });
  }, handlers);