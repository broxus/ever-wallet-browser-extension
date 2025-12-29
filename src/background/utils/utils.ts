import { Address } from 'everscale-inpage-provider'
import browser from 'webextension-polyfill'
import type * as nt from '@broxus/ever-wallet-wasm'

import { type Nekoton } from '@app/models'

import { type ContractFactory } from './Contract'

/**
 * Try to keep service worker alive until a given promise resolves
 *
 * @see {@link https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers#keep_a_service_worker_alive_until_a_long-running_operation_is_finished}
 */
export async function waitUntil<T>(promise: Promise<T>): Promise<T> {
    const keepAlive = setInterval(browser.runtime.getPlatformInfo, 25 * 1000)
    try {
        return await promise
    }
    finally {
        clearInterval(keepAlive)
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

export const getParamsConfig = async ({
    nekoton,
    contractFactory,
}: {
    nekoton: Nekoton;
    contractFactory: ContractFactory;
}) => {
    const confAddress = new Address('-1:5555555555555555555555555555555555555555555555555555555555555555')
    const contract = contractFactory.create(CONFIG_ABI, confAddress)
    const fields = await contract.getContractFields()

    if (fields == null) {
        throw new Error('Config contract state not found')
    }

    const { boc: nonEmptyMap } = await nekoton.packIntoCell(
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

    const { params: rawParams } = await nekoton.unpackFromCell([{ name: 'params', type: 'map(uint32,cell)' }] as nt.AbiParam[], nonEmptyMap, true, '2.2')

    const params = new Map<number, string>()

    for (const [id, value] of rawParams as any) {
        params.set(parseInt(id, 10), value)
    }

    return params
}
