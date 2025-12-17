import { createWalletError, mapTonErrorCode, createWalletEventError, TonError } from '@app/shared/ton/errors'

import { type TonConnectEvent, type TonConnectItemReply, type TonConnectRequest, type TonWalletResponse, type TonRpcMethod, TON_CONNECT_EVENT_ERROR_CODES, type TonRpcRequests, type TonSignDataRpcResponseSuccess, TON_SEND_TRANSACTION_ERROR_CODES } from '../models/background'
import { type Client } from './Client'

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
    send(message: TonRpcRequests['sendTransaction'] | TonRpcRequests['sendTransaction']): Promise<TonWalletResponse<'signData'> | TonWalletResponse<'sendTransaction'>>;
    signData(message: TonRpcRequests['signData']): Promise<TonWalletResponse<'signData'>>;
    listen(callback: (event: any) => void): () => void;
}

type TonConnectCallback<T extends TonRpcMethod> = (event: TonWalletResponse<T>) => void


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

    constructor(private client: Client) {
        client.on('tonDisconnected', () => {
            this.disconnect()
        })
    }

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
            const code = e.name === TonError.name ? e.code : mapTonErrorCode(e.code)
            const errorMessage = code === TON_SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR ? 'User declined the connection' : e.message

            return this.notify({
                id: this.getConnectId(),
                event: 'connect_error',
                payload: {
                    code,
                    message: errorMessage ?? 'Unknown error',
                },
            })
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
            const code = e.name === TonError.name ? e.code : mapTonErrorCode(e.code)
            return this.notify(createWalletEventError('disconnect', {
                id: this.getConnectId().toString(),
                message: e.message ?? 'Unknown error',
                code: code ?? TON_CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
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
            const code = e.name === TonError.name ? e.code : mapTonErrorCode(e.code)
            return this.notify(createWalletEventError('connect', {
                id: this.getConnectId(),
                message: e.message ?? 'Unknown error',
                code: code ?? TON_CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
            }))
        }
    }

    send = async (message: TonRpcRequests['sendTransaction'] | TonRpcRequests['signData']): Promise<TonWalletResponse<'sendTransaction'> | TonWalletResponse<'signData'>> => {
        if (message.method === 'signData') return this.signData(message) as any

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
            const code = e.name === TonError.name ? e.code : mapTonErrorCode(e.code)
            const errorMessage = code === TON_SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR ? 'User declined the transaction' : e.message

            return createWalletError('sendTransaction', {
                id: message.id,
                message: errorMessage ?? 'Unknown error',
                code: code ?? TON_CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
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
            const code = e.name === TonError.name ? e.code : mapTonErrorCode(e.code)
            return createWalletError('signData', {
                id: message.id,
                message: e.message ?? 'Unknown error',
                code: code ?? TON_CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
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


export type SignDataFeature = {
    name: 'SignData';
    types: ('text' | 'binary' | 'cell')[];
}
export type SendTransactionFeature = {
    name: 'SendTransaction';
    maxMessages: number;
    extraCurrencySupported?: boolean;
}
export type SendTransactionFeatureDeprecated = 'SendTransaction'
export type Feature = SendTransactionFeatureDeprecated | SendTransactionFeature | SignDataFeature
export type DeviceInfo = {
    platform: 'iphone' | 'ipad' | 'android' | 'windows' | 'mac' | 'linux' | 'browser';
    appName: string;
    appVersion: string;
    maxProtocolVersion: number;
    features: Feature[];
}

export const getDeviceInfo = (): DeviceInfo => ({
    platform: 'browser',
    appName: 'Sparx',
    appVersion: '1',
    maxProtocolVersion: 2,
    features: [
        'SendTransaction',
        {
            name: 'SendTransaction',
            maxMessages: 4,
            extraCurrencySupported: true,
        },
        {
            name: 'SignData',
            types: ['text', 'binary', 'cell'],
        },
    ],
})
