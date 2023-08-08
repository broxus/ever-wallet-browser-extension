import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { ConnectionStore, Logger, RpcStore, SlidingPanelHandle } from '@app/popup/modules/shared'
import { ConnectionDataItem } from '@app/models'
import { getScrollWidth } from '@app/popup/utils'

@injectable()
export class ConnectionErrorViewModel {

    public loading = false

    constructor(
        public handle: SlidingPanelHandle,
        private rpcStore: RpcStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get failedConnection(): ConnectionDataItem | undefined {
        return this.connectionStore.failedConnection
    }

    public get availableConnections(): ConnectionDataItem[] {
        return this.connectionStore.connectionItems.filter(
            (item) => item.group !== this.failedConnection?.group,
        )
    }

    public async openNetworkSettings(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'network_settings',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    public async changeNetwork(network: ConnectionDataItem): Promise<void> {
        if (this.loading) return
        this.loading = true

        try {
            await this.connectionStore.changeNetwork(network)
            this.handle.close()
        }
        catch (e) {
            this.logger.error(e)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}
