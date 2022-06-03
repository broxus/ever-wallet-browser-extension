import React, { useEffect, useRef } from 'react';

interface Props {
  selector: string;
  children: (ref: React.RefObject<any>) => React.ReactNode;
}

export function AutoScroller({ selector, children }: Props): JSX.Element {
  const ref = useRef<HTMLElement>();
  const elRef = useRef<HTMLElement>();

  useEffect(() => {
    const scroll = ref.current;
    const element = scroll?.querySelector(selector) as HTMLElement;

    if (!scroll || !element || elRef.current === element) return;

    elRef.current = element;

    if (element.offsetTop + element.clientHeight > scroll.scrollTop + scroll.clientHeight) {
      scroll.scrollTo(0, element.offsetTop + element.clientHeight - scroll.clientHeight);
    } else if (element.offsetTop < scroll.scrollTop) {
      scroll.scrollTo(0, element.offsetTop);
    }
  });

  return children(ref) as JSX.Element;
}
