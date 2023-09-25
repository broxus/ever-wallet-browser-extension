import { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { NftCollection } from '@app/models'
import { Button, useViewModel } from '@app/popup/modules/shared'
import EmptyListImg from '@app/popup/assets/img/broxie-empty-list@2x.png'

import { NftImport } from '../NftImport'
import { NftCollectionInfo } from '../NftCollectionInfo'
import { NftItem } from '../NftItem'
import { NftGrid } from '../NftGrid'
import { NftCollectionsViewModel } from './NftCollectionsViewModel'
import styles from './NftCollections.module.scss'

export const NftCollections = observer((): JSX.Element => {
    const vm = useViewModel(NftCollectionsViewModel)
    const intl = useIntl()

    const handleView = useCallback(({ address }: NftCollection) => vm.panel.open({
        fullHeight: true,
        render: () => <NftCollectionInfo address={address} />,
    }), [])
    const handleImport = useCallback(() => vm.panel.open({
        render: () => <NftImport />,
    }), [])

    return (
        <div className={styles.collections}>
            {vm.accountCollections.length === 0 && (
                <div className={styles.empty}>
                    <img className={styles.emptyImg} src={EmptyListImg} alt="" />
                    <h2 className={styles.emptyHeader}>
                        {intl.formatMessage({ id: 'NFT_EMPTY_LIST_HEADER' })}
                    </h2>
                    {/* <p className="nft-collections__empty-text">
                        {intl.formatMessage({ id: 'NFT_EMPTY_LIST_TEXT' })}
                    </p> */}
                    <div className={styles.btnGroup}>
                        {/* <Button design="primary">
                            {intl.formatMessage({ id: 'NFT_EMPTY_LIST_EXPLORE_BTN_TEXT' })}
                            <ExternalIcon />
                        </Button> */}
                        <Button onClick={handleImport}>
                            {intl.formatMessage({ id: 'NFT_IMPORT_INTO_BTN_TEXT' })}
                        </Button>
                    </div>
                </div>
            )}

            {vm.accountCollections.length !== 0 && (
                <>
                    <NftGrid
                        title={intl.formatMessage({ id: 'NFT_COLLECTIONS_TITLE' })}
                        layout={vm.grid.layout}
                        onLayoutChange={vm.grid.setLayout}
                    >
                        {vm.accountCollections.map((collection) => {
                            const count = vm.pendingNfts?.[collection.address]?.length
                            return (
                                <NftGrid.Item key={collection.address} onClick={() => handleView(collection)}>
                                    <NftItem
                                        layout={vm.grid.layout}
                                        item={collection}
                                        label={count ? intl.formatMessage(
                                            { id: 'NFT_NEW_LABEL' },
                                            { count },
                                        ) : undefined}
                                    />
                                </NftGrid.Item>
                            )
                        })}
                    </NftGrid>

                    <div className={styles.btnGroup}>
                        <Button onClick={handleImport}>
                            {intl.formatMessage({ id: 'NFT_IMPORT_INTO_BTN_TEXT' })}
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
})
