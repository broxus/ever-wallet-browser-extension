import classNames from 'classnames'
import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { NftCollection } from '@app/models'
import {
    Container,
    Content, Dropdown,
    Header,
    Loader,
    SlidingPanel,
    useDrawerPanel, useOnClickOutside,
    useViewModel,
} from '@app/popup/modules/shared'
import DotsIcon from '@app/popup/assets/icons/dots.svg'
import CrossIcon from '@app/popup/assets/icons/cross.svg'
import ExternalIcon from '@app/popup/assets/icons/external.svg'
import HideIcon from '@app/popup/assets/icons/eye-off.svg'

import { NftItem } from '../NftItem'
import { NftDetails } from '../NftDetails'
import { NftGrid } from '../NftGrid'
import { NftListViewModel } from './NftListViewModel'

import './NftList.scss'

interface Props {
    collection: NftCollection
}

export const NftList = observer(({ collection }: Props): JSX.Element => {
    const drawer = useDrawerPanel()
    const vm = useViewModel(NftListViewModel, (model) => {
        model.collection = collection
        model.drawer = drawer
    })
    const loaderRef = useRef<HTMLDivElement>(null)
    const descRef = useRef<HTMLDivElement>(null)
    const intl = useIntl()

    const btnRef = useRef(null)
    const dropdownRef = useRef(null)

    useOnClickOutside(dropdownRef, btnRef, vm.hideDropdown)

    useEffect(() => {
        drawer.setConfig({
            showClose: false,
        })
        return () => drawer.setConfig(undefined)
    }, [])

    useEffect(() => {
        if (!loaderRef.current) return

        const observer = new IntersectionObserver(() => vm.loadMore())
        observer.observe(loaderRef.current)

        return () => observer.disconnect() // eslint-disable-line consistent-return
    }, [])

    useEffect(() => {
        if (!descRef.current) return

        if (descRef.current.clientHeight < descRef.current.scrollHeight) {
            vm.setExpanded(false)
        }
    }, [collection.description])

    return (
        <>
            <Container className="nft-list">
                <Header className="nft-list__header">
                    <h2>{collection.name}</h2>
                    <div className="nft-list__header-buttons">
                        <button
                            type="button"
                            className="nft-list__header-btn"
                            ref={btnRef}
                            onClick={vm.toggleDropdown}
                        >
                            <DotsIcon />
                        </button>
                        <button type="button" className="nft-list__header-btn" onClick={drawer.close}>
                            <CrossIcon />
                        </button>

                        <Dropdown className="nft-list__dropdown" ref={dropdownRef} active={vm.dropdownActive}>
                            <button
                                type="button"
                                className="nft-list__dropdown-btn"
                                onClick={vm.openCollectionInExplorer}
                            >
                                <ExternalIcon />
                                {intl.formatMessage({ id: 'OPEN_IN_EXPLORER_BTN_TEXT' })}
                            </button>
                            <hr className="nft-list__dropdown-separator" />
                            <button
                                type="button"
                                className="nft-list__dropdown-btn _danger"
                                onClick={vm.hideCollection}
                            >
                                <HideIcon />
                                {intl.formatMessage({ id: 'NFT_HIDE_COLLECTION_BTN_TEXT' })}
                            </button>
                        </Dropdown>
                    </div>
                </Header>
                <Content className="nft-list__content">
                    {collection.description && (
                        <>
                            <div
                                className={classNames('nft-list__desc', {
                                    _expandable: vm.expanded === false,
                                    _expanded: vm.expanded,
                                })}
                                ref={descRef}
                            >
                                {collection.description}
                            </div>
                            <button className="nft-list__more-btn" type="button" onClick={() => vm.setExpanded(true)}>
                                {intl.formatMessage({ id: 'NFT_DESC_SHOW_MORE_BTN_TEXT' })}
                            </button>
                        </>
                    )}
                    <NftGrid
                        className="nft-list__grid"
                        title={intl.formatMessage({ id: 'NFT_ITEMS_TITLE' })}
                        layout={vm.layout}
                        onLayoutChange={vm.setLayout}
                    >
                        {vm.nfts.map((nft) => (
                            <NftItem
                                className="nft-list__item"
                                key={nft.address}
                                layout={vm.layout}
                                item={nft}
                                onClick={() => vm.openNftDetails(nft)}
                            />
                        ))}
                    </NftGrid>
                    {vm.hasMore && (
                        <div className="nft-list__loader" ref={loaderRef}>
                            <Loader />
                        </div>
                    )}
                </Content>
            </Container>

            <SlidingPanel active={!!vm.selectedNft} onClose={vm.closeNftDetails}>
                <NftDetails nft={vm.selectedNft!} />
            </SlidingPanel>
        </>
    )
})
