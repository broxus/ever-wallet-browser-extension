import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Container, Content, Header, Loader, Navbar, SettingsMenu, useViewModel } from '@app/popup/modules/shared'

import { NftItem } from '../NftItem'
import { NftGrid } from '../NftGrid'
import { NftDetails } from '../NftDetails'
import { Expandable } from '../Expandable'
import { NftCollectionInfoViewModel } from './NftCollectionInfoViewModel'
import styles from './NftCollectionInfo.module.scss'

interface Props {
    address: string;
}

export const NftCollectionInfo = observer(({ address }: Props): JSX.Element => {
    const vm = useViewModel(NftCollectionInfoViewModel, (model) => {
        model.address = address
    })
    const loaderRef = useRef<HTMLDivElement>(null)
    const intl = useIntl()

    const handleClick = (id: string) => vm.panel.open({
        render: () => <NftDetails address={vm.nftById[id].address} />,
    })

    useEffect(() => {
        if (!loaderRef.current) return

        const observer = new IntersectionObserver(() => vm.loadMore())
        observer.observe(loaderRef.current)

        return () => observer.disconnect() // eslint-disable-line consistent-return
    }, [])

    return (
        <Container>
            <Header>
                <Navbar
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
                <div className={styles.info}>
                    <h2 className={styles.name}>{vm.collection.name}</h2>

                    {vm.collection.description && (
                        <Expandable className={styles.description}>
                            {vm.collection.description}
                        </Expandable>
                    )}
                </div>

                <NftGrid
                    compact
                    className={styles.grid}
                    title={intl.formatMessage({ id: 'NFT_ITEMS_TITLE' })}
                    layout={vm.grid.layout}
                    onLayoutChange={vm.grid.setLayout}
                >
                    {vm.nfts.map((id) => (
                        <NftGrid.Item key={id} onClick={() => handleClick(id)}>
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
