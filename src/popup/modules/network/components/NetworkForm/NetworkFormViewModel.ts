import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'
import { NetworkConfig } from 'everscale-inpage-provider'

import { ConnectionDataItem, UpdateCustomNetwork } from '@app/models'
import { ConnectionStore, LocalizationStore, Logger, NotificationStore, Router } from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'

@injectable()
export class NetworkFormViewModel {

    public loading = false

    public error = ''

    private readonly id: string | undefined

    constructor(
        private router: Router,
        private connectionStore: ConnectionStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this.id = router.state.matches.at(-1)?.params.id
    }

    public get networks(): ConnectionDataItem[] {
        return this.connectionStore.connectionItems
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.connectionStore.selectedConnection
    }

    public get network(): ConnectionDataItem | undefined {
        return this.id ? this.networks.find(({ id }) => id === this.id) : undefined
    }

    public get canDelete(): boolean {
        return this.network?.id !== this.selectedConnection.id
    }

    public get canSwitch(): boolean {
        return this.network?.id !== this.selectedConnection.id
    }

    public async handleSubmit(value: NetworkFormValue): Promise<void> {
        if (this.loading) return
        this.loading = true

        try {
            const data = value.type === 'jrpc' || value.type === 'proto' ? {
                type: value.type,
                data: {
                    endpoint: value.endpoints[0].value,
                },
            } : {
                type: value.type,
                data: {
                    endpoints: value.endpoints.map(({ value }) => value),
                    local: value.local,
                    latencyDetectionInterval: 60000,
                    maxLatency: 60000,
                },
            }

            const update: UpdateCustomNetwork = {
                id: this.network?.id,
                name: value.name,
                config: {
                    decimals: value.config.decimals || undefined,
                    symbol: value.config.symbol || undefined,
                    tokensManifestUrl: value.config.tokensManifestUrl || undefined,
                    explorerBaseUrl: value.config.explorerBaseUrl || undefined,
                },
                ...data,
            }


            const network = await this.connectionStore.updateCustomNetwork(update as UpdateCustomNetwork)

            if (this.selectedConnection.id === network.id) {
                this.connectionStore.changeNetwork(network).catch()
            }

            this.showSuccessNotification(network, !!this.network)
            await this.router.navigate('/')
        }
        catch (e) {
            this.logger.error(e)
            runInAction(() => {
                this.error = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public async handleDelete(): Promise<void> {
        if (this.loading || !this.network) return
        this.loading = true

        try {
            const network = this.network
            await this.connectionStore.deleteCustomNetwork(network.id)

            this.showDeleteNotification(network)
            await this.router.navigate('/')
        }
        catch (e) {
            this.logger.error(e)
            runInAction(() => {
                this.error = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public async handleReset(): Promise<void> {
        if (this.loading || !this.network) return
        this.loading = true

        try {
            const defaultNetwork = await this.connectionStore.deleteCustomNetwork(this.network.id)

            if (this.selectedConnection.id === defaultNetwork?.id) {
                this.connectionStore.changeNetwork(defaultNetwork).catch(this.logger.error)
                this.router.navigate('/')
            }
        }
        catch (e) {
            this.logger.error(e)
            runInAction(() => {
                this.error = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    private showDeleteNotification(network: ConnectionDataItem): void {
        this.notification.show({
            message: this.localization.intl.formatMessage({ id: 'NETWORK_DELETED_MESSAGE_TEXT' }),
            action: this.localization.intl.formatMessage({ id: 'UNDO_BTN_TEXT' }),
            onAction: () => {
                const update: UpdateCustomNetwork = {
                    ...network,
                    id: undefined,
                }

                this.connectionStore.updateCustomNetwork(update).catch(this.logger.error)
            },
        })
    }

    private showSuccessNotification(network: ConnectionDataItem, edit: boolean): void {
        const { intl } = this.localization
        const message = edit
            ? intl.formatMessage({ id: 'NETWORK_RESULT_UPDATE' })
            : intl.formatMessage({ id: 'NETWORK_RESULT_ADD' })
        const action = this.canSwitch
            ? intl.formatMessage({ id: 'NETWORK_RESULT_SWITCH_BTN_TEXT' })
            : undefined

        this.notification.show({
            message,
            action,
            type: 'success',
            onAction: () => this.connectionStore.changeNetwork(network).catch(this.logger.error),
        })
    }

}

export interface NetworkFormValue {
    name: string;
    config: NetworkConfig;
    type: 'graphql' | 'jrpc' | 'proto';
    endpoints: Array<{ value: string }>;
    local: boolean;
}
