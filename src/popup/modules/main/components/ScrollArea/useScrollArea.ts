import { useContext } from 'react';
import { ScrollAreaContext } from './ScrollAreaContext';

export function useScrollArea() {
  return useContext(ScrollAreaContext);
}
