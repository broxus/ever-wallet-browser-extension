import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { NftCollection } from '@app/models'
import { Button, ButtonGroup, useViewModel } from '@app/popup/modules/shared'
import EmptyListImg from '@app/popup/assets/img/broxie-empty-list@2x.png'
// import ExternalIcon from '@app/popup/assets/icons/external.svg'

import { NftItem } from '../NftItem'
import { NftGrid } from '../NftGrid'
import { NftCollectionsViewModel } from './NftCollectionsViewModel'
import styles from './NftCollections.module.scss'

export const NftCollections = observer((): JSX.Element => {
    const vm = useViewModel(NftCollectionsViewModel)
    const intl = useIntl()
    const navigate = useNavigate()

    const handleView = ({ address }: NftCollection) => navigate(`/nft/collection/${address}`)
    const handleImport = () => navigate('/nft/import')

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
                    <ButtonGroup className={styles.btnGroup} vertical>
                        {/* <Button design="primary">
                            {intl.formatMessage({ id: 'NFT_EMPTY_LIST_EXPLORE_BTN_TEXT' })}
                            <ExternalIcon />
                        </Button> */}
                        <Button onClick={handleImport}>
                            {intl.formatMessage({ id: 'NFT_IMPORT_INTO_BTN_TEXT' })}
                        </Button>
                    </ButtonGroup>
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

                    <ButtonGroup className={styles.btnGroup} vertical>
                        <Button onClick={handleImport}>
                            {intl.formatMessage({ id: 'NFT_IMPORT_INTO_BTN_TEXT' })}
                        </Button>
                    </ButtonGroup>
                </>
            )}
        </div>
    )
})
