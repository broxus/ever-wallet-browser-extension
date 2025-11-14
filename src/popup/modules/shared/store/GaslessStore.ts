import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import { ConfigResponse, Configuration, GaslessApi, GaslessSend, V1GaslessEstimateMasterIdPostRequest } from '@app/api/gassless'

import { ConnectionStore } from './ConnectionStore'

@singleton()
export class GaslessStore {

    private api: GaslessApi

    private isExistApi: boolean = false

    public config: ConfigResponse | undefined

    constructor(private connectionStore: ConnectionStore) {
        makeAutoObservable(
            this,
            undefined,
            { autoBind: true },
        )

        const group = this.connectionStore.selectedConnectionNetworkGroup
        const baseUrl = this.connectionStore.connectionConfig.blockchainsByGroup[group].gaslessApiBaseUrl

        this.isExistApi = !!baseUrl

        const config = new Configuration({
            basePath: baseUrl,
        })

        this.api = new GaslessApi(config)

        if (baseUrl) {
            this.initialize()
        }
    }


    protected async initialize() {
        const config = await this.loadConfig()
        runInAction(() => {
            this.config = config
        })
    }

    public get isAvailable() {
        return this.isExistApi
    }


    public async loadConfig() {
        return this.api.v1GaslessConfigGet()
    }


    public async estimate(params:V1GaslessEstimateMasterIdPostRequest) {
        return this.api.v1GaslessEstimateMasterIdPost(params)
    }

    public async send(gaslessSend:GaslessSend) {
        return this.api.v1GaslessSendPost({ gaslessSend })
    }

}
