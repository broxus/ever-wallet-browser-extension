import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'

import type { GasPriceParams, Nekoton } from '@app/models'

import { Contract, ContractFactory } from './Contract'

export class GasPriceService {

    constructor(
        private nekoton: Nekoton,
        private contractFactory: ContractFactory,
    ) { }

    public async getGasPriceParams(): Promise<GasPriceParams | null> {
        try {
            const config = this._getConfigContract()

            const fields = await config.getContractFields()

            const { boc: nonEmptyMap } = this.nekoton.packIntoCell(
                [
                    { name: 'flag', type: 'bool' },
                    { name: 'root', type: 'cell' },
                ],
                {
                    flag: true,
                    root: fields.paramsRoot,
                },
                '2.2',
            )
            const data = this.nekoton.unpackFromCell(
                [{ name: 'params', type: 'map(uint32,cell)' }],
                nonEmptyMap,
                true,
                '2.2',
            ) as { params: Array<[string, string]> }
            const params = new Map<number, string>(
                data.params.map(([id, value]) => [parseInt(id, 10), value]),
            )

            const prices = this.nekoton.unpackFromCell(PRICES_PARAM_ABI, params.get(21) ?? '', true, '2.2') as any

            return prices.value as GasPriceParams
        }
        catch (_) {
            return null
        }
    }

    public async computeGas(baseGas: string, params?: GasPriceParams): Promise<string> {
        const p = params ?? await this.getGasPriceParams()
        if (!p) return baseGas

        const k = BigNumber(p.gasPrice).div(evrscaleGasPrice)
        const value = BigNumber(baseGas).times(k)

        return value.toFixed()
    }

    private _getConfigContract(): Contract<typeof CONFIG_ABI> {
        return this.contractFactory.create(CONFIG_ABI, CONFIG_ADDRESS)
    }

}

const evrscaleGasPrice = BigNumber('1000')

const CONFIG_ADDRESS = '-1:5555555555555555555555555555555555555555555555555555555555555555'

const CONFIG_ABI = {
    'ABI version': 2,
    version: '2.2',
    header: [],
    functions: [],
    events: [],
    fields: [
        {
            name: 'paramsRoot',
            type: 'cell',
        },
    ],
} as const

const PRICES_PARAM_ABI: nt.AbiParam[] = [
    {
        name: 'value',
        type: 'tuple',
        components: [
            // Flat tag
            { name: 'tag1', type: 'uint8' },
            // The price of gas unit.
            { name: 'gasPrice', type: 'uint64' },
            // The maximum amount of gas available for a compute phase of an ordinary transaction.
            { name: 'gasLimit', type: 'uint64' },
            // Ext tag
            { name: 'tag2', type: 'uint8' },
            // The maximum amount of gas available for a compute phase of a special transaction.
            { name: 'specialGasLimit', type: 'uint64' },
            // The maximum amount of gas available before `ACCEPT`.
            { name: 'gasCredit', type: 'uint64' },
            // The maximum amount of gas units per block.
            { name: 'blockGasLimit', type: 'uint64' },
            // Amount of debt (in tokens) after which the account will be frozen.
            { name: 'freezeDueLimit', type: 'uint64' },
            // Amount of debt (in tokens) after which the contract will be deleted.
            { name: 'deleteDueLimit', type: 'uint64' },
            // Size of the first portion of gas with different price.
            { name: 'flatGasLimit', type: 'uint64' },
            // The gas price for the first portion determinted by flatGasLimit
            { name: 'flatGasPrice', type: 'uint64' },
        ],
    },
]
