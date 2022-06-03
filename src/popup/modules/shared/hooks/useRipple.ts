import React, { useMemo } from 'react';

export function useRipple() {
  return useMemo(() => ({
    remove: removeRipple,
    create: createRipple,
  }), []);
}

const removeRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
  const button = event.currentTarget;
  const ripple = button.getElementsByClassName('ripple')[0];
  if (ripple) {
    ripple.remove();
  }
};

const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
  const button = event.currentTarget;
  removeRipple(event);

  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  const rect = event.currentTarget.getBoundingClientRect();

  const circle = document.createElement('span');
  circle.style.height = `${diameter}px`;
  circle.style.width = `${diameter}px`;
  circle.style.left = `${event.clientX - (rect.left + radius)}px`;
  circle.style.top = `${event.clientY - (rect.top + radius)}px`;
  circle.classList.add('ripple');
  button.prepend(circle);
};
