import type * as nt from '@broxus/ever-wallet-wasm';

import type { Nekoton } from '@app/models';
import { BlockchainConfigParams } from '@broxus/ever-wallet-wasm';

import { type BaseConfig, BaseController, type BaseState } from './BaseController';
import { type ContractFactory } from '../utils/Contract';
import { BigNumber } from 'bignumber.js';
import { Address } from 'everscale-inpage-provider';
import { type ConnectionController } from './ConnectionController';

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
} as const;

interface BlockchainConfigControllerConfig extends BaseConfig {
    nekoton: Nekoton;
    contractFactory: ContractFactory;
    connectionController: ConnectionController;
}

const BLOCKCHAIN_CONFIG_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

export class BlockchainConfigController extends BaseController<BlockchainConfigControllerConfig, BaseState> {
    private _paramsRootCache = new Map<string, CacheEntry<string>>();

    private _paramsConfigCache = new Map<string, CacheEntry<Map<number, string>>>();

    constructor(config: BlockchainConfigControllerConfig, state?: BaseState) {
        super(config, state);

        this.initialize();
    }

    public async getPrice(
        type: GasPriceType = GasPriceType.workchainGasLimitsAndPrices,
    ): Promise<MasterChainConfigData> {
        const params = await this.getParamsConfig();
        const param = params.get(paramsKey(type));

        if (!param) {
            throw new Error('Param state not found');
        }

        const { value: prices } = this.config.nekoton.unpackFromCell(
            PRICES_PARAM_ABI as nt.AbiParam[],
            param,
            true,
            '2.2',
        );

        return prices as MasterChainConfigData;
    }

    public async calcGas(options: {
        dynamicGas: string;
        fixedGas?: string;
        params?: MasterChainConfigData;
        type?: GasPriceType;
    }): Promise<string> {
        const { dynamicGas, fixedGas = '0', params, type = GasPriceType.workchainGasLimitsAndPrices } = options;

        const p = params ?? (await this.getPrice(type));

        const priceNum = p?.gasPrice ?? baseGasPrice(type);
        const gasPrice = BigNumber(priceNum).div(baseGasPrice(type).toString());

        const gas = BigNumber(dynamicGas).multipliedBy(gasPrice).plus(BigNumber(fixedGas));

        return gas.toString();
    }

    public async getFundamentalAddresses(): Promise<Set<string>> {
        const params = new BlockchainConfigParams(await this._getParamsRoot());

        return new Set(params.fundamentalSmcAddr());
    }

    public getParamsConfig = async (): Promise<Map<number, string>> => {
        const connectionId = this.config.connectionController.state.selectedConnection.id;

        const cached = this._paramsConfigCache.get(connectionId);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.value;
        }

        const paramsRoot = await this._getParamsRoot();

        const { boc: nonEmptyMap } = this.config.nekoton.packIntoCell(
            [
                { name: 'flag', type: 'bool' },
                { name: 'root', type: 'cell' },
            ] as nt.AbiParam[],
            { flag: true, root: paramsRoot },
            '2.2',
        );

        const { params: rawParams } = this.config.nekoton.unpackFromCell(
            [{ name: 'params', type: 'map(uint32,cell)' }] as nt.AbiParam[],
            nonEmptyMap,
            true,
            '2.2',
        );

        const result = new Map<number, string>();
        for (const [id, value] of rawParams as any) {
            result.set(parseInt(id, 10), value);
        }

        this._paramsConfigCache.set(connectionId, { value: result, expiresAt: Date.now() + BLOCKCHAIN_CONFIG_TTL_MS });

        return result;
    };

    private _getParamsRoot = async (): Promise<string> => {
        const connectionId = this.config.connectionController.state.selectedConnection.id;

        const cached = this._paramsRootCache.get(connectionId);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.value;
        }

        const confAddress = new Address('-1:5555555555555555555555555555555555555555555555555555555555555555');
        const contract = this.config.contractFactory.create(CONFIG_ABI, confAddress);
        const fields = await contract.getContractFields();

        if (fields == null) {
            throw new Error('Config contract state not found');
        }

        const paramsRoot = fields.paramsRoot;

        this._paramsRootCache.set(connectionId, {
            value: paramsRoot,
            expiresAt: Date.now() + BLOCKCHAIN_CONFIG_TTL_MS,
        });

        return paramsRoot;
    };
}

export enum GasPriceType {
    masterchainGasLimitsAndPrices,
    masterchainMessageForwardingPrices,
    workchainGasLimitsAndPrices,
    workchainMessageForwardingPrices,
}

export function paramsKey(type: GasPriceType): number {
    switch (type) {
        case GasPriceType.masterchainGasLimitsAndPrices:
            return 20;
        case GasPriceType.masterchainMessageForwardingPrices:
            return 24;
        case GasPriceType.workchainGasLimitsAndPrices:
            return 21;
        case GasPriceType.workchainMessageForwardingPrices:
            return 25;
        default: {
            return 21;
        }
    }
}

const _evrscaleWorkchainGasPrice = BigInt('65536000');
const _evrscaleMasterchainGasPrice = BigInt('655360000');

export function baseGasPrice(type: GasPriceType): bigint {
    switch (type) {
        case GasPriceType.masterchainGasLimitsAndPrices:
        case GasPriceType.masterchainMessageForwardingPrices:
            return _evrscaleMasterchainGasPrice;
        case GasPriceType.workchainGasLimitsAndPrices:
        case GasPriceType.workchainMessageForwardingPrices:
            return _evrscaleWorkchainGasPrice;
        default:
            return _evrscaleWorkchainGasPrice;
    }
}

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
];

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
};
