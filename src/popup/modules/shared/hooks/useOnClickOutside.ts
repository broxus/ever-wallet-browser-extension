/* eslint-disable max-len */
import { RefObject, useEffect, useRef } from 'react';

type Handler = (event: MouseEvent) => void;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(ref: RefObject<T>, handler: Handler): void;
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(ref: RefObject<T>, ignore: RefObject<HTMLElement>, handler: Handler): void;
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(ref: RefObject<T>, ignoreOrHandler: RefObject<HTMLElement> | Handler, handlerOrNull?: Handler): void {
  const handler = handlerOrNull ?? ignoreOrHandler as Handler;
  const ignore = handlerOrNull ? ignoreOrHandler as RefObject<HTMLElement> : null;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current) return;
      if (ignore?.current && ignore.current.contains(event.target as Node)) return;

      if (!ref.current.contains(event.target as Node)) {
        handlerRef.current(event);
      }
    };

    document.addEventListener('mousedown', listener);

    return () => document.removeEventListener('mousedown', listener);
  }, []);
}
