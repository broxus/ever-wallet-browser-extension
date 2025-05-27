import { DeviceInfo } from '@tonconnect/protocol'

import { NekotonRpcError } from '@app/shared/errors'
import { createWalletError, mapTonErrorCode, createWalletEventError } from '@app/shared/ton/errors'

import { TonConnectEvent, TonConnectItemReply, TonConnectRequest, TonWalletResponse, TonRpcMethod, TON_CONNECT_EVENT_ERROR_CODES, TonRpcRequests, TonSignDataRpcResponseSuccess } from '../models/background'
import { Client } from './Client'

export const getDeviceInfo = (): DeviceInfo => ({
    platform: getPlatform()!,
    appName: 'Sparx',
    appVersion: '1',
    maxProtocolVersion: 2,
    features: [
        'SendTransaction',
        {
            name: 'SendTransaction',
            maxMessages: 4,
        },
    ],
})

export interface WalletInfo {
    name: string;
    image: string;
    tondns?: string;
    about_url: string;
}

export interface TonConnectBridge {
    deviceInfo: DeviceInfo;
    walletInfo?: WalletInfo;
    protocolVersion: number;
    isWalletBrowser: boolean;
    connect(protocolVersion: number, message: TonConnectRequest): Promise<TonConnectEvent>;
    restoreConnection(): Promise<TonConnectEvent>;
    send(message: TonRpcRequests['sendTransaction']): Promise<TonWalletResponse<'sendTransaction'>>;
    signData(message: TonRpcRequests['signData']): Promise<TonWalletResponse<'signData'>>;
    listen(callback: (event: any) => void): () => void;
}

type TonConnectCallback<T extends TonRpcMethod> = (event: TonWalletResponse<T>) => void;


export class TonProvider implements TonConnectBridge {

    callbacks: TonConnectCallback<TonRpcMethod>[] = []

    deviceInfo: DeviceInfo = getDeviceInfo()

    walletInfo: WalletInfo = {
        name: 'Sparx',
        image: 'https://raw.githubusercontent.com/broxus/sparx-networks/refs/heads/master/icons/sparx/sparx.png',
        about_url: 'https://sparxwallet.com',
    }

    connectId = 0

    protocolVersion = 2

    isWalletBrowser = false

    constructor(private client: Client) { }

    connect = async (protocolVersion: number, message: TonConnectRequest): Promise<TonWalletResponse<'connect'>> => {
        if (protocolVersion > this.protocolVersion) {
            return this.notify(createWalletEventError('connect', {
                id: this.getConnectId(),
                message: 'Unknown error',
                code: TON_CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
            }))
        }

        try {
            const items = await this.client.request<TonConnectItemReply[]>({ method: 'tonConnect', params: message })

            if (!items) {
                return this.notify(createWalletEventError('connect', {
                    id: this.getConnectId(),
                    message: 'Unknown error',
                    code: TON_CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
                }))
            }

            return this.notify({
                id: this.getConnectId(),
                event: 'connect',
                payload: {
                    items: items as TonConnectItemReply[],
                    device: getDeviceInfo(),
                },
            })
        }
        catch (e: any) {
            if (e instanceof NekotonRpcError) {
                return this.notify(createWalletEventError('connect', {
                    id: this.getConnectId(),
                    message: e.message,
                    code: mapTonErrorCode(e.code),
                }))
            }
            return this.notify(createWalletError('connect', {
                id: this.getConnectId(),
                message: e.message ?? 'Unknown error',
                code: e.code ?? TON_CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
            }))
        }
    }

    disconnect = async (): Promise<TonWalletResponse<'disconnect'>> => {
        try {
            await this.client.request({ method: 'tonDisconnect' })
            return this.notify({
                event: 'disconnect',
                id: this.getConnectId().toString(),
                result: {},
            })
        }
        catch (e:any) {
            if (e instanceof NekotonRpcError) {
                return this.notify(createWalletEventError('disconnect', {
                    id: this.getConnectId().toString(),
                    message: e.message,
                    code: mapTonErrorCode(e.code),
                }))
            }
            return this.notify(createWalletEventError('disconnect', {
                id: this.getConnectId().toString(),
                message: e.message ?? 'Unknown error',
                code: e.code ?? TON_CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
            }))
        }
    }

    restoreConnection = async (): Promise<TonConnectEvent> => {
        try {
            const items = await this.client.request<TonConnectItemReply[]>({
                method: 'tonReconnect',
                params: [{ name: 'ton_addr' }],
            })

            if (!items?.length) {
                return this.notify(createWalletEventError('connect', {
                    id: this.getConnectId(),
                    message: 'Unknown error',
                    code: TON_CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
                }))
            }

            return this.notify({
                id: this.getConnectId(),
                event: 'connect',
                payload: {
                    items: items as TonConnectItemReply[],
                    device: getDeviceInfo(),
                },
            })
        }
        catch (e:any) {
            if (e instanceof NekotonRpcError) {
                return this.notify(createWalletEventError('connect', {
                    id: this.getConnectId(),
                    message: e.message,
                    code: mapTonErrorCode(e.code),
                }))
            }
            return this.notify(createWalletEventError('connect', {
                id: this.getConnectId(),
                message: e.message ?? 'Unknown error',
                code: e.code ?? TON_CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
            }))
        }
    }

    send = async (message: TonRpcRequests['sendTransaction']): Promise<TonWalletResponse<'sendTransaction'>> => {
        try {
            const result = await this.client.request<string>({ method: 'tonSendTransaction', params: message.params })
            if (!result) {
                return createWalletError('sendTransaction', {
                    id: message.id,
                    message: 'Unknown error',
                    code: TON_CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
                })
            }

            return {
                result,
                id: message.id,
            }
        }
        catch (e:any) {
            if (e instanceof NekotonRpcError) {
                return createWalletError('sendTransaction', {
                    id: message.id,
                    message: e.message,
                    code: mapTonErrorCode(e.code),
                })
            }
            return createWalletError('sendTransaction', {
                id: message.id,
                message: e.message ?? 'Unknown error',
                code: e.code ?? TON_CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
            })
        }
    }

    signData = async (message: TonRpcRequests['signData']): Promise<TonWalletResponse<'signData'>> => {
        try {
            const result = await this.client.request<TonSignDataRpcResponseSuccess['result']>({ method: 'tonSignData', params: message.params })
            if (!result) {
                return createWalletError('signData', {
                    id: message.id,
                    message: 'Unknown error',
                    code: TON_CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
                })
            }

            return {
                result,
                id: message.id,
            }
        }
        catch (e: any) {
            if (e instanceof NekotonRpcError) {
                return createWalletError('signData', {
                    id: message.id,
                    message: e.message,
                    code: mapTonErrorCode(e.code),
                })
            }
            return createWalletError('signData', {
                id: message.id,
                message: e.message ?? 'Unknown error',
                code: e.code ?? TON_CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
            })
        }
    }

    listen = (callback: (event: any) => void): (() => void) => {
        this.callbacks.push(callback)
        return () => {
            this.callbacks = this.callbacks.filter((item) => item !== callback)
        }
    }

    notify = <T extends TonRpcMethod, E extends TonWalletResponse<T>>(event: E): E => {
        this.callbacks.forEach((item) => item(event))
        return event
    }


    private getConnectId() {
        this.connectId += 1
        return this.connectId
    }

}

const getPlatform = (): DeviceInfo['platform'] => {
    const platform = (window.navigator as any)?.userAgentData?.platform || window.navigator.platform

    const userAgent = window.navigator.userAgent

    const macosPlatforms = ['macOS', 'Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
    const iphonePlatforms = ['iPhone']
    const iosPlatforms = ['iPad', 'iPod']

    let os: DeviceInfo['platform'] | null = null

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'mac'
    }
    else if (iphonePlatforms.indexOf(platform) !== -1) {
        os = 'iphone'
    }
    else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'ipad'
    }
    else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'windows'
    }
    else if (/Android/.test(userAgent)) {
        os = 'linux'
    }
    else if (/Linux/.test(platform)) {
        os = 'linux'
    }

    return os!
}
