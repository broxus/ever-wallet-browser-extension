import type { createMemoryRouter } from 'react-router'
import type { constructor } from 'tsyringe/dist/typings/types'

export type Router = ReturnType<typeof createMemoryRouter>
export const Router = (() => null) as any as constructor<Router>
