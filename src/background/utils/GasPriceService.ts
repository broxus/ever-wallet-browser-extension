import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'

import type { GasPriceParams, Nekoton } from '@app/models'

import { Contract, ContractFactory } from './Contract'

export class GasPriceService {

    constructor(
        private nekoton: Nekoton,
        private contractFactory: ContractFactory,
    ) { }

    public async getGasPriceParams(type = GasPriceType.WorkchainGasLimitsAndPrices): Promise<GasPriceParams | null> {
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

            const boc = params.get(getParamsKey(type)) ?? ''
            const prices = this.nekoton.unpackFromCell(PRICES_PARAM_ABI, boc, true, '2.2') as any

            return prices.value as GasPriceParams
        }
        catch (_) {
            return null
        }
    }

    public async computeGas(args: ComputeArgs, params?: GasPriceParams | null): Promise<string> {
        const p = params ?? await this.getGasPriceParams()
        const base = getBaseGasPrice(args.type ?? GasPriceType.WorkchainGasLimitsAndPrices)
        const gasPrice = BigNumber(p?.gasPrice ?? base).div(base)

        return BigNumber(args.dynamicGas).times(gasPrice).plus(args.fixedValue ?? 0).toFixed()
    }

    private _getConfigContract(): Contract<typeof CONFIG_ABI> {
        return this.contractFactory.create(CONFIG_ABI, CONFIG_ADDRESS)
    }

}

enum GasPriceType {
    MasterchainGasLimitsAndPrices,
    MasterchainMessageForwardingPrices,
    WorkchainGasLimitsAndPrices,
    WorkchainMessageForwardingPrices,
}

const _evrscaleMasterchainGasPrice = BigNumber('655360000')
const _evrscaleWorkchainGasPrice = BigNumber('65536000')

function getParamsKey(type: GasPriceType): number {
    switch (type) {
        case GasPriceType.MasterchainGasLimitsAndPrices:
            return 20
        case GasPriceType.MasterchainMessageForwardingPrices:
            return 24
        case GasPriceType.WorkchainGasLimitsAndPrices:
            return 21
        case GasPriceType.WorkchainMessageForwardingPrices:
            return 25
        default: throw new Error('Unknown gas price type')
    }
}

function getBaseGasPrice(type: GasPriceType): BigNumber {
    switch (type) {
        case GasPriceType.MasterchainGasLimitsAndPrices:
        case GasPriceType.MasterchainMessageForwardingPrices:
            return _evrscaleMasterchainGasPrice
        case GasPriceType.WorkchainGasLimitsAndPrices:
        case GasPriceType.WorkchainMessageForwardingPrices:
            return _evrscaleWorkchainGasPrice
        default: throw new Error('Unknown gas price type')
    }
}

interface ComputeArgs {
    type?: GasPriceType,
    dynamicGas: BigNumber.Value,
    fixedValue?: BigNumber.Value,
}

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
            { name: 'tag1', type: 'uint8' },
            { name: 'flatGasLimit', type: 'uint64' },
            { name: 'flatGasPrice', type: 'uint64' },
            { name: 'tag2', type: 'uint8' },
            { name: 'gasPrice', type: 'uint64' },
            { name: 'gasLimit', type: 'uint64' },
            { name: 'specialGasLimit', type: 'uint64' },
            { name: 'gasCredit', type: 'uint64' },
            { name: 'blockGasLimit', type: 'uint64' },
            { name: 'freezeDueLimit', type: 'uint64' },
            { name: 'deleteDueLimit', type: 'uint64' },
        ],
    },
]
