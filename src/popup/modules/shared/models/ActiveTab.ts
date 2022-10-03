import type nt from '@wallet/nekoton-wasm'

import {
    ENVIRONMENT_TYPE_BACKGROUND,
    ENVIRONMENT_TYPE_FULLSCREEN,
    ENVIRONMENT_TYPE_NOTIFICATION,
    ENVIRONMENT_TYPE_POPUP,
} from '@app/shared'

export type ActiveTab =
    | nt.EnumItem<typeof ENVIRONMENT_TYPE_POPUP,
    {
        id?: number
        title?: string
        origin: string
        protocol?: string
        url?: string
    }>
    | nt.EnumItem<typeof ENVIRONMENT_TYPE_NOTIFICATION, undefined>
    | nt.EnumItem<typeof ENVIRONMENT_TYPE_FULLSCREEN,
    {
        route?: string
    }>
    | nt.EnumItem<typeof ENVIRONMENT_TYPE_BACKGROUND, undefined>;
