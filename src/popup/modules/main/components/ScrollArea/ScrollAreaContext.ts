import { createContext, RefObject } from 'react'

export const ScrollAreaContext = createContext<RefObject<HTMLDivElement>>({ current: null })
