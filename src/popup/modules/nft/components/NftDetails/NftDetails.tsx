import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { Icons } from '@app/popup/icons'
import { convertAddress } from '@app/shared'
import { Button, Container, Content, PageLoader, ParamsPanel, Space, useViewModel } from '@app/popup/modules/shared'
import EvernameBg from '@app/popup/assets/img/evername-bg.svg'
import PlaceholderImgSrc from '@app/popup/assets/img/nft-placeholder@2x.png'

import { NftImg } from '../NftImg'
import { Expandable } from '../Expandable'
import { NftDetailsViewModel } from './NftDetailsViewModel'
import styles from './NftDetails.module.scss'

interface Props {
    address: string;
}

const IMG_HEIGHT = 360
const IMG_MIN_HEIGHT = 60
const MIN_SCALE = IMG_MIN_HEIGHT / IMG_HEIGHT

export const NftDetails = observer(({ address }: Props): JSX.Element => {
    const vm = useViewModel(NftDetailsViewModel, (model) => {
        model.address = address
    })
    const intl = useIntl()
    const [scrolled, setScrolled] = useState(false)
    const imgRef = useRef<HTMLDivElement>(null)
    const scrollerRef = useRef<HTMLDivElement>(null)

    const handleScroll = useRafCallback(() => {
        if (!scrollerRef.current || !imgRef.current) return

        const top = scrollerRef.current.scrollTop
        const k = Math.min(top / (IMG_HEIGHT - 140), 1) // 140px empirically calculated
        const scale = 1 + (MIN_SCALE - 1) * k

        imgRef.current.style.transform = `scale(${scale})`

        setScrolled(top > 0)
    })

    useLayoutEffect(() => {
        vm.handle.update({
            fullHeight: true,
            whiteBg: true,
            showClose: false,
            className: styles.panel,
        })
    }, [])

    if (!vm.nft) return <PageLoader />

    return (
        <div className={styles.root}>
            <button
                type="button"
                className={classNames(styles.close, { [styles._scrolled]: scrolled })}
                onClick={() => vm.handle.close()}
            >
                {Icons.cross}
            </button>

            <div ref={imgRef} className={classNames(styles.img, { [styles._scrolled]: scrolled })}>
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

            <div ref={scrollerRef} className={styles.scroller} onScroll={handleScroll}>
                <Container className={styles.container}>
                    <Content>
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

                        <ParamsPanel className={styles.details}>
                            <ParamsPanel.Param label={intl.formatMessage({ id: 'NFT_DETAILS_CONTRACT' })}>
                                <a
                                    className={styles.link}
                                    target="_blank"
                                    rel="nofollow noopener noreferrer"
                                    href={vm.getExplorerLink(vm.nft.address)}
                                >
                                    {convertAddress(vm.nft.address)}
                                    {Icons.planet}
                                </a>
                            </ParamsPanel.Param>
                            <ParamsPanel.Param label={intl.formatMessage({ id: 'NFT_DETAILS_OWNER' })}>
                                <a
                                    className={styles.link}
                                    target="_blank"
                                    rel="nofollow noopener noreferrer"
                                    href={vm.getExplorerLink(vm.nft.owner)}
                                >
                                    {convertAddress(vm.nft.owner)}
                                    {Icons.planet}
                                </a>
                            </ParamsPanel.Param>
                            <ParamsPanel.Param label={intl.formatMessage({ id: 'NFT_DETAILS_MANAGER' })}>
                                <a
                                    className={styles.link}
                                    target="_blank"
                                    rel="nofollow noopener noreferrer"
                                    href={vm.getExplorerLink(vm.nft.manager)}
                                >
                                    {convertAddress(vm.nft.manager)}
                                    {Icons.planet}
                                </a>
                            </ParamsPanel.Param>
                            {vm.nft.balance && vm.nft.supply && (
                                <ParamsPanel.Param label={intl.formatMessage({ id: 'NFT_DETAILS_BALANCE' })}>
                                    <span title={`${vm.nft.balance}/${vm.nft.supply}`}>
                                        {`${vm.nft.balance}/${vm.nft.supply}`}
                                    </span>
                                </ParamsPanel.Param>
                            )}
                        </ParamsPanel>

                        <Space direction="column" gap="s">
                            {!vm.nft.balance && (
                                <Button onClick={vm.openMarketplace}>
                                    {intl.formatMessage({ id: 'NFT_DETAILS_OPEN_IN_MARKETPLACE' })}
                                </Button>
                            )}
                            {vm.isOwner && (
                                <Button design="secondary" onClick={vm.canTransfer ? vm.onTransfer : vm.showTransferError}>
                                    {intl.formatMessage({ id: 'NFT_TRANSFER_BTN_TEXT' })}
                                </Button>
                            )}
                            {vm.nft.balance && (
                                <Button design="secondary" onClick={vm.onTransferTokens}>
                                    {intl.formatMessage({ id: 'NFT_TRANSFER_TOKENS_BTN_TEXT' })}
                                </Button>
                            )}
                        </Space>
                    </Content>
                </Container>
            </div>
        </div>
    )
})

function useRafCallback(callback: () => void): () => void {
    const raf = useRef(false)

    return useCallback(() => {
        if (raf.current) return
        raf.current = true

        requestAnimationFrame(() => {
            raf.current = false
            callback()
        })
    }, [])
}
