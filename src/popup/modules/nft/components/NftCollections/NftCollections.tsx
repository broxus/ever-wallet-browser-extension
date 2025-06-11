import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { NftCollection } from '@app/models'
import { Button, Space, useViewModel } from '@app/popup/modules/shared'
import EmptyListImg from '@app/popup/assets/img/broxie-empty-list@2x.png'

import { NftItem } from '../NftItem'
import { NftGrid } from '../NftGrid'
import { NftCollectionsViewModel } from './NftCollectionsViewModel'
import styles from './NftCollections.module.scss'

export const NftCollections = observer((): JSX.Element => {
    const vm = useViewModel(NftCollectionsViewModel)
    const intl = useIntl()
    const navigate = useNavigate()

    const handleImport = () => navigate('/dashboard/nft/add')
    const handleView = ({ address }: NftCollection) => navigate(`/dashboard/nft/collection/${address}`)

    return (
        <div className={styles.collections}>
            {vm.accountCollections.length === 0 && (
                <div className={styles.empty}>
                    <img className={styles.emptyImg} src={EmptyListImg} alt="" />
                    <h2 className={styles.emptyHeader}>
                        {intl.formatMessage({ id: 'NFT_EMPTY_LIST_HEADER' })}
                    </h2>
                    <p className={styles.emptyText}>
                        {intl.formatMessage({ id: 'NFT_EMPTY_LIST_TEXT' })}
                    </p>
                    <Space direction="column" gap="s" className={styles.btnGroup}>
                        {vm.marketplaceUrl && (
                            <Button design="primary" onClick={vm.openMarketplace} width={200}>
                                {intl.formatMessage({ id: 'NFT_EMPTY_LIST_EXPLORE_BTN_TEXT' })}
                            </Button>
                        )}
                        <Button design="secondary" onClick={handleImport} width={200}>
                            {intl.formatMessage({ id: 'NFT_IMPORT_INTO_BTN_TEXT' })}
                        </Button>
                    </Space>
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
                                <NftGrid.Item key={collection.address}>
                                    <NftItem
                                        layout={vm.grid.layout}
                                        item={collection}
                                        count={count || undefined}
                                        onClick={() => handleView(collection)}
                                    />
                                </NftGrid.Item>
                            )
                        })}
                    </NftGrid>

                    <div className={styles.btnGroup}>
                        <Button onClick={handleImport} design="neutral" width={200}>
                            {intl.formatMessage({ id: 'NFT_IMPORT_INTO_BTN_TEXT' })}
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
})
