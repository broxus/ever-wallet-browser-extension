import { Duplex } from 'readable-stream'
import { ConsoleLike } from '@shared/utils'

import { NekotonInpageProvider } from './NekotonInpageProvider'

type InitializeProviderOptions<T extends Duplex> = {
    connectionStream: T
    jsonRpcStreamName?: string
    logger?: ConsoleLike
    maxEventListeners?: number
    shouldSetOnWindow?: boolean
}

export const initializeProvider = <S extends Duplex>({
    connectionStream,
    jsonRpcStreamName,
    logger = console,
    maxEventListeners = 100,
    shouldSetOnWindow = true,
}: InitializeProviderOptions<S>) => {
    let provider = new NekotonInpageProvider(connectionStream, {
        jsonRpcStreamName,
        logger,
        maxEventListeners,
    })

    if (shouldSetOnWindow) {
        setGlobalProvider(provider)
    }

    return provider
}

export function setGlobalProvider<S extends Duplex>(
    providerInstance: NekotonInpageProvider<S>
): void {
    ;(window as Record<string, any>).__ever = providerInstance
    window.dispatchEvent(new Event('ever#initialized'))

    // TODO: remove later
    ;(window as Record<string, any>).ton = providerInstance
    window.dispatchEvent(new Event('ton#initialized'))
}
