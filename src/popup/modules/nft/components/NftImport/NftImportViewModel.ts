import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'

import { Nekoton } from '@app/models'
import { AccountabilityStore, DrawerContext, LocalizationStore, NekotonToken } from '@app/popup/modules/shared'
import { Logger } from '@app/shared'

import { NftStore } from '../../store'

@injectable()
export class NftImportViewModel {

    public drawer!: DrawerContext

    public error = ''

    public loading = false

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private accountability: AccountabilityStore,
        private nftStore: NftStore,
        private localization: LocalizationStore,
        private logger: Logger,
    ) {
        makeAutoObservable<NftImportViewModel, any>(this, {
            nekoton: false,
            accountability: false,
            nftStore: false,
            localization: false,
            logger: false,
        }, { autoBind: true })
    }

    public validateAddress(value: string): boolean {
        return this.nekoton.checkAddress(value)
    }

    public async submitManual(data: ImportFormData): Promise<void> {
        if (this.loading) return

        const { address } = data
        const owner = this.accountability.selectedAccountAddress!

        this.loading = true
        this.error = ''

        try {
            const collection = await this.nftStore.importNftCollection(owner, address)

            if (!collection) {
                runInAction(() => {
                    this.error = this.localization.intl.formatMessage({
                        id: 'ERROR_NFT_NOT_FOUND',
                    })
                })
            }
            else {
                this.drawer.close()
            }
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

export interface ImportFormData {
    address: string;
}
