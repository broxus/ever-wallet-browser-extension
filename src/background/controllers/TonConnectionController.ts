import browser from 'webextension-polyfill'
import log from 'loglevel'
import type * as nt from '@broxus/ever-wallet-wasm'

import type { ApprovalApi, TonConnectItemReply, TonConnectRequest } from '@app/models'
import { NekotonRpcError, RpcErrorCode } from '@app/shared'

import { Deserializers, Storage } from '../utils/Storage'
import type { ApprovalController } from './ApprovalController'
import { BaseConfig, BaseController, BaseState } from './BaseController'


interface TonConnectionsConfig extends BaseConfig {
    storage: Storage<TonConnectionsStorage>;
    origin?: string;
    approvalController?: ApprovalController;
}

type TonConnection = {
    replyItems: TonConnectItemReply[],
    wallet: nt.TonWalletAsset,
    manifest: string,
}

interface TonConnectionsStorage {
    connections: { [origin: string]: TonConnection };
}


interface TonConnectionsState extends BaseState {
    connections: { [origin: string]: TonConnection };
}

function makeDefaultState(): TonConnectionsState {
    return {
        connections: {},
    }
}

export class TonConnectionsController extends BaseController<TonConnectionsConfig, TonConnectionsState> {


    constructor(config: TonConnectionsConfig, state?: TonConnectionsState) {
        super(config, state ?? makeDefaultState())
        this.initialize()

        this._handleStorageChanged = this._handleStorageChanged.bind(this)
    }

    public initialSync() {
        try {
            const connections = this.config.storage.snapshot.connections ?? {}

            this.update({ connections })


            this._subscribeOnStorageChanged()
        }
        catch (e: any) {
            log.warn('Failed to load connections', e)
        }
    }

    public async requestConnections(origin: string, data: TonConnectRequest) {
        let existing = this.getConnections(origin)

        if (!existing?.replyItems?.length) {
            if (!this.config.approvalController) throw new Error('[TonConnectionsService] ApprovalController is not provided')

            const originConnections: ApprovalApi['tonConnect']['output'] = await this.config.approvalController
                .addAndShowApprovalRequest({
                    origin,
                    type: 'tonConnect',
                    requestData: data,
                })

            const connection = {
                ...originConnections,
                manifest: data.manifestUrl,
            }
            const connections = {
                ...this.state.connections,
                [origin]: connection,
            }


            this._updateConnections(connections)

            existing = connection
        }

        return existing
    }

    public getConnections(origin: string): TonConnection | undefined {
        return this.state.connections[origin]
    }

    public checkConnections(origin: string) {
        if (!this.state.connections[origin]?.replyItems?.length) {
            throw new NekotonRpcError(
                RpcErrorCode.INSUFFICIENT_PERMISSIONS,
                `There are no TonConnect connection for origin "${origin}"`,
            )
        }
    }

    public async removeTonOrigin(origin: string) {
        const connections = { ...this.state.connections }
        delete connections[origin]

        await this._updateConnections(connections)
    }

    private async _updateConnections(connections: { [origin: string]: TonConnection }) {
        this._unsubscribeOnStorageChanged()
        this.update({ connections }, true)
        await this._saveConnections()
        this._subscribeOnStorageChanged()
    }

    private async _saveConnections() {
        await this.config.storage.set({ connections: this.state.connections })
    }

    private _handleStorageChanged(changes: browser.Storage.StorageAreaOnChangedChangesType) {
        if (typeof changes.connections?.newValue === 'object') {
            this.update({ connections: changes.connections.newValue }, true)
        }
    }

    private _subscribeOnStorageChanged() {
        browser.storage.local.onChanged.addListener(this._handleStorageChanged)
    }

    private _unsubscribeOnStorageChanged() {
        browser.storage.local.onChanged.removeListener(this._handleStorageChanged)
    }

    public destroy() {
        this._unsubscribeOnStorageChanged()
    }

}


Storage.register<TonConnectionsStorage>({
    connections: { deserialize: Deserializers.object },
})
