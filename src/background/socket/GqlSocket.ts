import * as nt from '@broxus/ever-wallet-wasm'
import log from 'loglevel'

import type { GqlSocketParams, Nekoton } from '@app/models'
import { delay } from '@app/shared'

export class GqlSocket {

    constructor(
        private readonly nekoton: Nekoton,
        private readonly origin?: string,
    ) {
    }

    public async connect(params: GqlSocketParams): Promise<nt.GqlConnection> {
        return new this.nekoton.GqlConnection(new GqlSender(params, this.origin))
    }

    static async checkLatency(endpoint: string): Promise<number | undefined> {
        const response = await fetch(`${endpoint}?query=%7Binfo%7Bversion%20time%20latency%7D%7D`, {
            method: 'get',
        })
            .then(response => response.json())
            .catch((e: any) => {
                log.error(e)
                return undefined
            })

        if (typeof response !== 'object') {
            return undefined
        }

        const { data } = response
        if (typeof data !== 'object') {
            return undefined
        }

        const { info } = data
        if (typeof info !== 'object') {
            return undefined
        }

        const { latency } = info
        if (typeof latency !== 'number') {
            return undefined
        }

        return latency
    }

    static expandAddress = (_baseUrl: string): string => {
        const lastBackslashIndex = _baseUrl.lastIndexOf('/')
        const baseUrl = lastBackslashIndex < 0 ? _baseUrl : _baseUrl.substr(0, lastBackslashIndex)

        if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
            return `${baseUrl}/graphql`
        }
        if (['localhost', '127.0.0.1'].indexOf(baseUrl) >= 0) {
            return `http://${baseUrl}/graphql`
        }
        return `https://${baseUrl}/graphql`
    }

}

class GqlSender implements nt.IGqlSender {

    private readonly endpoints: string[]

    private nextLatencyDetectionTime: number = 0

    private currentEndpoint?: string

    private resolutionPromise?: Promise<string>

    constructor(
        private readonly params: GqlSocketParams,
        private readonly origin?: string,
    ) {
        this.endpoints = params.endpoints.map(GqlSocket.expandAddress)
        if (this.endpoints.length === 1) {
            this.currentEndpoint = this.endpoints[0]
            this.nextLatencyDetectionTime = Number.MAX_VALUE
        }
    }

    isLocal(): boolean {
        return this.params.local
    }

    send(data: string, handler: nt.StringQuery) {
        (async () => {
            const now = Date.now()
            try {
                let endpoint: string
                if (this.currentEndpoint != null && now < this.nextLatencyDetectionTime) {
                    // Default route
                    endpoint = this.currentEndpoint
                }
                else if (this.resolutionPromise != null) {
                    // Already resolving
                    endpoint = await this.resolutionPromise
                    delete this.resolutionPromise
                }
                else {
                    delete this.currentEndpoint
                    // Start resolving (current endpoint is null, or it is time to refresh)
                    this.resolutionPromise = this._selectQueryingEndpoint().then(
                        endpoint => {
                            this.currentEndpoint = endpoint
                            this.nextLatencyDetectionTime = Date.now() + this.params.latencyDetectionInterval
                            return endpoint
                        },
                    )
                    endpoint = await this.resolutionPromise
                    delete this.resolutionPromise
                }

                const response = await fetch(endpoint, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Version': process.env.EXT_VERSION ?? '',
                        'X-Origin': this.origin ?? 'extension',
                    },
                    body: data,
                }).then(response => response.text())
                handler.onReceive(response)
            }
            catch (e: any) {
                handler.onError(e)
            }
        })()
    }

    private async _selectQueryingEndpoint(): Promise<string> {
        for (let retryCount = 0; retryCount < 5; ++retryCount) {
            try {
                return await this._getOptimalEndpoint()
            }
            catch (e: any) {
                await delay(Math.min(100 * retryCount, 5000))
            }
        }

        throw new Error('No available endpoint found')
    }

    private _getOptimalEndpoint(): Promise<string> {
        if (this.endpoints.length === 1) return Promise.resolve(this.endpoints[0])

        return new Promise<string>((resolve, reject) => {
            const maxLatency = this.params.maxLatency || 60000
            const endpointCount = this.endpoints.length
            let checkedEndpoints = 0,
                lastLatency: { endpoint: string; latency: number | undefined } | undefined

            this.endpoints.forEach((endpoint) => GqlSocket.checkLatency(endpoint).then(latency => {
                ++checkedEndpoints

                if (latency !== undefined && latency <= maxLatency) {
                    resolve(endpoint)
                    return
                }

                if (
                    lastLatency?.latency === undefined
                    || (latency !== undefined && latency < lastLatency.latency)
                ) {
                    lastLatency = { endpoint, latency }
                }

                if (checkedEndpoints >= endpointCount) {
                    if (lastLatency?.latency !== undefined) {
                        resolve(lastLatency.endpoint)
                    }
                    else {
                        reject()
                    }
                }
            }))
        })
    }

}
