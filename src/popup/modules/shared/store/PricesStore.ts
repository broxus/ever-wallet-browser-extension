import { makeAutoObservable } from 'mobx'
import { singleton } from 'tsyringe'

import { NetworkGroup, NetworkType } from '@app/shared'

import { Logger } from '../utils'
import { RpcStore } from './RpcStore'
import { ConnectionStore } from './ConnectionStore'

@singleton()
export class PricesStore {

    constructor(
        private logger: Logger,
        private rpcStore: RpcStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    async fetch(
        addresses: string[],
        connectionGroup: NetworkGroup,
        type: NetworkType,
    ): Promise<Record<string, string> | null> {
        const baseUrl = this.connectionStore.connectionConfig.blockchainsByGroup[connectionGroup]?.currencyApiBaseUrl
        try {
            if (addresses.length > 0) {
                if (type === 'ton') {
                    const url = `${baseUrl}/rates?tokens=${addresses.join(',')}&currencies=USD`
                    const response = await fetch(url, {
                        headers: { 'Content-Type': 'application/json' },
                    })

                    if (response.ok) {
                        const data = await response.json()
                        const entries = Object.keys(data.rates).map(address => (
                            [address, data.rates[address].prices?.USD ?? '0']
                        ))
                        const prices = Object.fromEntries(entries)

                        return prices
                    }
                }
                else {
                    const url = `${baseUrl}/currencies_usdt_prices`
                    const response = await fetch(url, {
                        method: 'post',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            currency_addresses: addresses,
                        }),
                    })

                    if (response.ok) {
                        return response.json()
                    }
                }
            }
        }
        catch (e) {
            this.logger.error(e)
        }

        return null
    }

}
