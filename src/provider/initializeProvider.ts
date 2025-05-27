import type { Duplex } from 'readable-stream'

import type { ConsoleLike } from '@app/shared'

import { NekotonInpageProvider } from './NekotonInpageProvider'
import { TonProvider } from './TonProvider'
import { Client } from './Client'

type InitializeProviderOptions<T extends Duplex> = {
    connectionStream: T
    jsonRpcStreamName?: string
    logger?: ConsoleLike
    maxEventListeners?: number
    shouldSetOnWindow?: boolean
};

interface TVMAnnounceProviderEvent extends CustomEvent {
    type: 'tvm:announceProvider';
    detail: TVMProviderDetail;
}

interface TVMProviderDetail {
    info: TVMProviderInfo;
    provider: NekotonInpageProvider;
}

interface TVMProviderInfo {
    name: string;
    rdns: string;
}

function setGlobalProvider(
    client: Client,
): void {
    const nekotonProvider = new NekotonInpageProvider(client);
    (window as any).__sparx = nekotonProvider;
    (window as any).sparx = {
        tonconnect: new TonProvider(client),
    }


    window.dispatchEvent(new Event('sparx#initialized'))

    const announceEvent = new CustomEvent<TVMProviderDetail>('tvm:announceProvider', {
        detail: Object.freeze({
            info: {
                name: process.env.EXT_NAME ?? '',
                rdns: process.env.EXT_RDNS ?? '',
            },
            provider: nekotonProvider,
        }),
    }) as TVMAnnounceProviderEvent

    // The Wallet dispatches an announce event which is heard by
    // the DApp code that had run earlier
    window.dispatchEvent(announceEvent)

    // The Wallet listens to the request events which may be
    // dispatched later and re-dispatches the `TVMAnnounceProviderEvent`
    window.addEventListener('tvm:requestProvider', () => {
        window.dispatchEvent(announceEvent)
    })
}

export const initializeProvider = <S extends Duplex>({
    connectionStream,
    jsonRpcStreamName,
    logger = console,
    maxEventListeners = 100,
    shouldSetOnWindow = true,
}: InitializeProviderOptions<S>) => {
    const client = new Client(connectionStream, {
        jsonRpcStreamName,
        logger,
        maxEventListeners,
    })

    if (shouldSetOnWindow) {
        setGlobalProvider(client)
    }
}
