import { forwardRef, PropsWithChildren, ReactPortal } from 'react';
import { createPortal } from 'react-dom';

type Props = PropsWithChildren<{
  id: string;
}>;

const containers = new Map<string, HTMLElement>();

export const Portal = forwardRef<HTMLElement, Props>((props, ref): ReactPortal => {
  const { id, children } = props;
  let container = containers.get(id) ?? null;

  if (!container) {
    container = document.getElementById(id);
  }

  if (!container) {
    container = window.document.createElement('div');
    container.id = id;

    window.document.body.appendChild(container);
  }

  containers.set(id, container);

  if (ref) {
    if (typeof ref === 'function') {
      ref(container);
    } else {
      ref.current = container;
    }
  }

  return createPortal(children, container);
});
