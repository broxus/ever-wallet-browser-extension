import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, Container, Content, Header, Icon, Loader, Navbar, PageLoader, useViewModel } from '@app/popup/modules/shared'
import { Page } from '@app/popup/modules/shared/components/Page'
import { usePage } from '@app/popup/modules/shared/hooks/usePage'

import { NftItem } from '../NftItem'
import { NftGrid } from '../NftGrid'
import { Expandable } from '../Expandable'
import { NftCollectionInfoViewModel } from './NftCollectionInfoViewModel'
import styles from './NftCollectionInfo.module.scss'
import { NftCollectionInfoSettings } from './NftCollectionInfoSettings'

export const NftCollectionInfo = observer((): JSX.Element => {
    const page = usePage()
    const navigate = useNavigate()
    const vm = useViewModel(NftCollectionInfoViewModel)
    const loaderRef = useRef<HTMLDivElement>(null)
    const intl = useIntl()

    const handleClick = (id: string) => navigate(`/dashboard/nft/item/${vm.nftById[id].address}`)

    useEffect(() => {
        if (!loaderRef.current) return

        const observer = new IntersectionObserver(() => vm.loadMore())
        observer.observe(loaderRef.current)

        return () => observer.disconnect() // eslint-disable-line consistent-return
    }, [])

    if (!vm.collection) return <PageLoader />


    return (
        <Page
            animated id="nft-add-page" page={page}
            className={styles.page}
        >
            <Container className={styles.container}>
                <Header className={styles.header}>
                    <Navbar
                        back={() => navigate(-1)}
                        info={(
                            <Button
                                size="s"
                                shape="icon"
                                design="transparency"
                                onClick={() => vm.panel.open({
                                    showClose: false,
                                    render: () => <NftCollectionInfoSettings />,
                                })}
                            >
                                <Icon icon="settings" width={16} height={16} />
                            </Button>
                        )}
                    >
                        <span className={styles.name} title={vm.collection.name}>{vm.collection.name}</span>
                    </Navbar>
                </Header>

                <Content>
                    <div className={styles.info}>
                        {vm.collection.description && (
                            <Expandable className={styles.description}>
                                {vm.collection.description}
                            </Expandable>
                        )}
                    </div>

                    <NftGrid
                        className={styles.grid}
                        title={intl.formatMessage({ id: 'NFT_ITEMS_TITLE' })}
                        layout={vm.grid.layout}
                        onLayoutChange={vm.grid.setLayout}
                    >
                        {vm.nfts.map((id) => (
                            <NftGrid.Item key={id}>
                                <NftItem
                                    layout={vm.grid.layout}
                                    item={vm.nftById[id]}
                                    label={vm.pending?.has(id)
                                        ? intl.formatMessage({ id: 'NFT_ITEM_NEW_LABEL' })
                                        : undefined}
                                    onClick={() => handleClick(id)}
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
        </Page>
    )
})
