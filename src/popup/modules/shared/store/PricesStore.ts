import { makeAutoObservable } from 'mobx'
import { singleton } from 'tsyringe'

import { ConnectionDataItem } from '@app/models'
import { EVERSCALE_DEX_API_BASE_PATH, HAMSTER_DEX_API_BASE_PATH, TON_API_BASE_PATH, VENOM_DEX_API_BASE_PATH } from '@app/shared'

import { Logger } from '../utils'

@singleton()
export class PricesStore {

    constructor(
        private logger: Logger,
    ) {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    async fetch(addresses: string[], connection: ConnectionDataItem): Promise<Record<string, string> | null> {
        try {
            if (addresses.length > 0) {
                if (connection.network === 'everscale') {
                    const url = `${EVERSCALE_DEX_API_BASE_PATH}/currencies_usdt_prices`
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

                if (connection.network === 'venom') {
                    const url = `${VENOM_DEX_API_BASE_PATH}/currencies_usdt_prices`
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

                if (connection.network === 'hamster') {
                    const url = `${HAMSTER_DEX_API_BASE_PATH}/currencies_usdt_prices`
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

                if (connection.network === 'ton') {
                    const url = `${TON_API_BASE_PATH}/rates?tokens=${addresses.join(',')}&currencies=USD`
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
            }
        }
        catch (e) {
            this.logger.error(e)
        }

        return null
    }

}
