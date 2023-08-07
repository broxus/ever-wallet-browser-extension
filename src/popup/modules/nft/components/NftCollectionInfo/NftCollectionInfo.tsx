import classNames from 'classnames'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Container, Content, Header, Loader, Navbar, SettingsMenu, useViewModel } from '@app/popup/modules/shared'

import { NftItem } from '../NftItem'
import { NftGrid } from '../NftGrid'
import { NftCollectionInfoViewModel } from './NftCollectionInfoViewModel'
import styles from './NftCollectionInfo.module.scss'

export const NftCollectionInfo = observer((): JSX.Element => {
    const vm = useViewModel(NftCollectionInfoViewModel)
    const loaderRef = useRef<HTMLDivElement>(null)
    const descRef = useRef<HTMLDivElement>(null)
    const intl = useIntl()

    useEffect(() => {
        if (!loaderRef.current) return

        const observer = new IntersectionObserver(() => vm.loadMore())
        observer.observe(loaderRef.current)

        return () => observer.disconnect() // eslint-disable-line consistent-return
    }, [])

    useLayoutEffect(() => {
        if (!descRef.current) return

        if (descRef.current.clientHeight < descRef.current.scrollHeight) {
            vm.setExpanded(false)
        }
    }, [vm.collection.description])

    return (
        <Container>
            <Header className="nft-list__header">
                <Navbar
                    back={() => vm.router.navigate(-1)}
                    settings={(
                        <SettingsMenu>
                            <SettingsMenu.Item icon={Icons.planet} onClick={vm.openCollectionInExplorer}>
                                {intl.formatMessage({ id: 'OPEN_IN_EXPLORER_BTN_TEXT' })}
                            </SettingsMenu.Item>
                            <SettingsMenu.Item icon={Icons.eyeOff} onClick={vm.hideCollection} danger>
                                {intl.formatMessage({ id: 'NFT_HIDE_COLLECTION_BTN_TEXT' })}
                            </SettingsMenu.Item>
                        </SettingsMenu>
                    )}
                />
            </Header>
            <Content>
                <h2>{vm.collection.name}</h2>

                {vm.collection.description && (
                    <>
                        <div
                            className={classNames(styles.description, {
                                [styles._expandable]: vm.expanded === false,
                                [styles._expanded]: vm.expanded,
                            })}
                            ref={descRef}
                        >
                            {vm.collection.description}
                        </div>
                        <button type="button" className={styles.more} onClick={() => vm.setExpanded(true)}>
                            {intl.formatMessage({ id: 'NFT_DESC_SHOW_MORE_BTN_TEXT' })}
                        </button>
                    </>
                )}

                <NftGrid
                    className={styles.grid}
                    title={intl.formatMessage({ id: 'NFT_ITEMS_TITLE' })}
                    layout={vm.grid.layout}
                    onLayoutChange={vm.grid.setLayout}
                >
                    {vm.nfts.map((id) => (
                        <NftGrid.Item key={id} onClick={() => vm.openNftDetails(id)}>
                            <NftItem
                                layout={vm.grid.layout}
                                item={vm.nftById[id]}
                                label={vm.pending?.has(id)
                                    ? intl.formatMessage({ id: 'NFT_ITEM_NEW_LABEL' })
                                    : undefined}
                            />
                        </NftGrid.Item>
                    ))}
                </NftGrid>
                {vm.hasMore && (
                    <div className={styles.loader} ref={loaderRef}>
                        <Loader />
                    </div>
                )}
            </Content>
        </Container>
    )
})
