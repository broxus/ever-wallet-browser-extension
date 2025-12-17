import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { RpcStore, SlidingPanelHandle, Utils } from '@app/popup/modules/shared'

type DappInfo = {
    origin: string;
    url?: string | undefined;
    name?: string | undefined;
    iconUrl?: string | undefined;
}

@injectable()
export class DappsViewModel {

    public connectedDAaps: Map<string, DappInfo> = new Map()

    public loading = new Set()

    constructor(public handle: SlidingPanelHandle, private rpcStore: RpcStore, private utils: Utils) {
        makeAutoObservable(this, undefined, { autoBind: true })

        const origins = Object.keys(this.rpcStore.state.connections)
        if (origins.length) {
            this.getConnectedDAppsInfo()
        }
    }

    public get connections() {
        return Object.keys(this.rpcStore.state.connections)
    }

    public async getConnectedDAppsInfo() {
        try {
            const info = await this.rpcStore.rpc.getConnectedDAppsInfo()

            runInAction(() => {
                this.connectedDAaps = new Map(info.map(item => ([item.origin, item])))
            })
        }
        catch (error) {
            console.error(error)
        }
    }

    public async disconnect(origins: string[]) {
        this.loading.add(origins)
        try {
            await this.rpcStore.rpc.removeTonOrigin(origins)
            this.rpcStore.rpc.deleteDapps(origins)
        }
        catch (error) {
            console.error(error)
        }
        finally {
            this.loading.clear()
        }
    }

    public async disconnectAll() {
        const origins = Object.keys(this.rpcStore.state.connections)
        this.loading.add(origins)
        try {
            await this.rpcStore.rpc.removeTonOrigin(origins)
            this.rpcStore.rpc.deleteDapps(origins)
        }
        catch (error) {
            console.error(error)
        }
        finally {
            this.loading.clear()
        }
    }

}
