import { useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { useNavigate } from 'react-router'

import { Icons } from '@app/popup/icons'
import { convertAddress } from '@app/shared'
import { Button, Container, Content, Footer, Icon, PageLoader, Space, useViewModel } from '@app/popup/modules/shared'
import EvernameBg from '@app/popup/assets/img/evername-bg.svg'
import PlaceholderImgSrc from '@app/popup/assets/img/nft-placeholder@2x.png'
import { Page } from '@app/popup/modules/shared/components/Page'
import { usePage } from '@app/popup/modules/shared/hooks/usePage'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { Data } from '@app/popup/modules/shared/components/Data'

import { NftImg } from '../NftImg'
import { Expandable } from '../Expandable'
import { NftDetailsViewModel } from './NftDetailsViewModel'
import styles from './NftDetails.module.scss'

export const NftDetails = observer((): JSX.Element => {
    const vm = useViewModel(NftDetailsViewModel)
    const page = usePage()
    const intl = useIntl()
    const imgRef = useRef<HTMLDivElement>(null)
    const scrollerRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    if (!vm.nft) return <PageLoader />

    return (
        <Page
            animated page={page}
            className={styles.page}
        >
            <div className={styles.root}>
                <Button
                    size="s"
                    shape="pill"
                    design="transparency"
                    className={classNames(styles.close)}
                    onClick={() => navigate(-1)}
                >
                    <Icon icon="arrowLeft" width={16} height={16} />
                </Button>

                <div ref={imgRef} className={classNames(styles.img)}>
                    {vm.nft.img && (
                        <NftImg src={vm.nft.img} alt={vm.nft.name} />
                    )}
                    {vm.isEvername && !vm.nft.img && (
                        <img src={EvernameBg} alt="" />
                    )}
                    {!vm.isEvername && !vm.nft.img && (
                        <img src={PlaceholderImgSrc} alt="" />
                    )}
                </div>

                <div ref={scrollerRef} className={styles.scroller}>
                    <Container className={styles.container}>
                        <Content className={styles.content}>
                            <div className={styles.nft}>
                                <h2>{vm.nft.name}</h2>
                                {vm.collection && (
                                    <div className={styles.collection}>
                                        {vm.collection?.name}
                                    </div>
                                )}
                                {vm.nft.description && (
                                    <Expandable className={styles.description}>
                                        {vm.nft.description}
                                    </Expandable>
                                )}
                            </div>

                            <Space gap="m" direction="column">
                                <hr />
                                {vm.nft.balance && vm.nft.supply && (
                                    <Data
                                        dir="h"
                                        label={intl.formatMessage({ id: 'NFT_DETAILS_BALANCE' })}
                                        value={(
                                            <span title={`${vm.nft.balance}/${vm.nft.supply}`}>
                                                {`${vm.nft.balance} / ${vm.nft.supply}`}
                                            </span>
                                        )}
                                    />
                                )}
                                <Data
                                    dir="h"
                                    label={intl.formatMessage({ id: 'NFT_DETAILS_CONTRACT' })}
                                    value={(
                                        <a
                                            className={styles.link}
                                            target="_blank"
                                            rel="nofollow noopener noreferrer"
                                            href={vm.getExplorerLink(vm.nft.address)}
                                        >
                                            {convertAddress(vm.nft.address)}
                                            {Icons.externalLink}
                                        </a>
                                    )}
                                />
                                <Data
                                    dir="h"
                                    label={intl.formatMessage({ id: 'NFT_DETAILS_OWNER' })}
                                    value={(
                                        <a
                                            className={styles.link}
                                            target="_blank"
                                            rel="nofollow noopener noreferrer"
                                            href={vm.getExplorerLink(vm.nft.owner)}
                                        >
                                            {convertAddress(vm.nft.owner)}
                                            {Icons.externalLink}
                                        </a>
                                    )}
                                />
                                <Data
                                    dir="h"
                                    label={intl.formatMessage({ id: 'NFT_DETAILS_MANAGER' })}
                                    value={(
                                        <a
                                            className={styles.link}
                                            target="_blank"
                                            rel="nofollow noopener noreferrer"
                                            href={vm.getExplorerLink(vm.nft.manager)}
                                        >
                                            {convertAddress(vm.nft.manager)}
                                            {Icons.externalLink}
                                        </a>
                                    )}
                                />
                            </Space>
                        </Content>


                    </Container>
                </div>

                <Footer className={styles.footer} layer>
                    <hr className={styles.hr} />
                    <FooterAction>
                        <Space direction="column" gap="s" className={styles.space}>
                            {vm.isOwner && (
                                <Button onClick={vm.canTransfer ? vm.onTransfer : vm.showTransferError}>
                                    {intl.formatMessage({ id: 'NFT_TRANSFER_BTN_TEXT' })}
                                </Button>
                            )}
                            {vm.nft.balance && (
                                <Button onClick={vm.onTransferTokens}>
                                    {intl.formatMessage({ id: 'NFT_TRANSFER_TOKENS_BTN_TEXT' })}
                                </Button>
                            )}
                            {!vm.nft.balance && vm.marketplaceUrl && (
                                <Button onClick={vm.openMarketplace} design="secondary">
                                    {intl.formatMessage({ id: 'NFT_DETAILS_OPEN_IN_MARKETPLACE' })}
                                </Button>
                            )}
                        </Space>
                    </FooterAction>
                </Footer>
            </div>
        </Page>
    )
})
