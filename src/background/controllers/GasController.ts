import { Address } from 'everscale-inpage-provider'
import type * as nt from '@broxus/ever-wallet-wasm'

import type { Nekoton } from '@app/models'

import { type BaseConfig, BaseController, type BaseState } from './BaseController'
import { type ContractFactory } from '../utils/Contract'

interface StakeControllerConfig extends BaseConfig {
    nekoton: Nekoton;
    contractFactory: ContractFactory;
}

export class GasController extends BaseController<StakeControllerConfig, BaseState> {

    constructor(config: StakeControllerConfig, state?: BaseState) {
        super(config, state)

        this.initialize()
    }

    public async getPrice(): Promise<MasterChainConfigData> {
        const confAddress = new Address('-1:5555555555555555555555555555555555555555555555555555555555555555')
        const contract = this.config.contractFactory.create(CONFIG_ABI, confAddress)
        const fields = await contract.getContractFields()

        if (fields == null) {
            throw new Error('Config contract state not found')
        }

        const { boc: nonEmptyMap } = await this.config.nekoton.packIntoCell(
            [
                { name: 'flag', type: 'bool' },
                { name: 'root', type: 'cell' },
            ] as nt.AbiParam[],
            {
                flag: true,
                root: fields.paramsRoot,
            },
            '2.2',
        )

        const { params: rawParams } = await this.config.nekoton.unpackFromCell([{ name: 'params', type: 'map(uint32,cell)' }] as nt.AbiParam[], nonEmptyMap, true, '2.2')

        const params = new Map<number, string>()

        for (const [id, value] of rawParams as any) {
            params.set(parseInt(id, 10), value)
        }

        const param = params.get(21)

        if (!param) {
            throw new Error('Param state not found')
        }

        const { value: prices } = await this.config.nekoton.unpackFromCell(PRICES_PARAM_ABI as nt.AbiParam[], param, true, '2.2')

        return prices as MasterChainConfigData
    }

    public async calcGas(options: {
        dynamicGas: string;
        fixedGas?: string;
        params?: MasterChainConfigData;
        type?: GasPriceType;
    }): Promise<string> {
        const { dynamicGas, fixedGas = '0', params, type = GasPriceType.workchainGasLimitsAndPrices } = options

        const p = params ?? (await this.getPrice())

        const priceNum = p?.gasPrice ?? baseGasPrice(type)
        const gasPrice = BigInt(priceNum) / baseGasPrice(type)

        const gas = BigInt(dynamicGas) * BigInt(gasPrice) + BigInt(fixedGas)

        return gas.toString()
    }

}


const enum GasPriceType {
    masterchainGasLimitsAndPrices,
    masterchainMessageForwardingPrices,
    workchainGasLimitsAndPrices,
    workchainMessageForwardingPrices,
}

export function paramsKey(type: GasPriceType): number {
    switch (type) {
        case GasPriceType.masterchainGasLimitsAndPrices: return 20
        case GasPriceType.masterchainMessageForwardingPrices: return 24
        case GasPriceType.workchainGasLimitsAndPrices: return 21
        case GasPriceType.workchainMessageForwardingPrices: return 25
        default: {
            return 21
        }
    }
}

const _evrscaleWorkchainGasPrice = BigInt('65536000')
const _evrscaleMasterchainGasPrice = BigInt('655360000')

export function baseGasPrice(type: GasPriceType): bigint {
    switch (type) {
        case GasPriceType.masterchainGasLimitsAndPrices:
        case GasPriceType.masterchainMessageForwardingPrices:
            return _evrscaleMasterchainGasPrice
        case GasPriceType.workchainGasLimitsAndPrices:
        case GasPriceType.workchainMessageForwardingPrices:
            return _evrscaleWorkchainGasPrice
        default: return _evrscaleWorkchainGasPrice
    }
}


export const CONFIG_ABI = {
    'ABI version': 2,
    events: [],
    fields: [
        {
            name: 'paramsRoot',
            type: 'cell',
        },
    ],
    functions: [],
    header: [],
    version: '2.2',
} as const

export const PRICES_PARAM_ABI = [
    {
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
        name: 'value',
        type: 'tuple',
    },
]

export type MasterChainConfigData = {
    tag1: string;
    gasPrice: string;
    gasLimit: string;
    tag2: string;
    specialGasLimit: string;
    gasCredit: string;
    blockGasLimit: string;
    freezeDueLimit: string;
    deleteDueLimit: string;
    flatGasLimit: string;
    flatGasPrice: string;
}
