import type * as nt from '@broxus/ever-wallet-wasm'
import { Disposable, injectable } from 'tsyringe'
import { autorun, reaction, when } from 'mobx'

import { interval } from '@app/shared'
import { ignoreCheckPassword } from '@app/popup/utils'

import { RpcStore } from '../store/RpcStore'

type Disposer = () => void;

@injectable()
export class Utils implements Disposable {

    private disposers: Disposer[] = []

    constructor(
        private rpcStore: RpcStore,
    ) { }

    public dispose(): void {
        this.disposers.forEach((disposer) => disposer())
    }

    public reaction<T, FireImmediately extends boolean = false>(
        ...args: Parameters<typeof reaction<T, FireImmediately>>
    ): void {
        this.disposers.push(
            reaction(...args),
        )
    }

    public autorun(...args: Parameters<typeof autorun>): void {
        this.disposers.push(
            autorun(...args),
        )
    }

    public when(...args: Parameters<typeof when>): void {
        this.disposers.push(
            when(...args),
        )
    }

    public interval(...args: Parameters<typeof interval>): void {
        this.disposers.push(
            interval(...args),
        )
    }

    public register(disposer: Disposer): void {
        this.disposers.push(disposer)
    }

    public checkPassword(keyPassword: nt.KeyPassword): Promise<boolean> {
        if (ignoreCheckPassword(keyPassword)) {
            return Promise.resolve(true)
        }
        return this.rpcStore.rpc.checkPassword(keyPassword)
    }

}
