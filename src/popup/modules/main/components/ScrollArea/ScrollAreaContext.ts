import React, { RefObject } from 'react';

export const ScrollAreaContext = React.createContext<RefObject<HTMLDivElement>>({ current: null });
