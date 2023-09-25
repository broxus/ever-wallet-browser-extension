import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { convertAddress } from '@app/shared'
import { Button, Container, Content, Footer, PageLoader, ParamsPanel, Space, useViewModel } from '@app/popup/modules/shared'
import EvernameBg from '@app/popup/assets/img/evername-bg.svg'
import PlaceholderImgSrc from '@app/popup/assets/img/nft-placeholder@2x.png'

import { NftImg } from '../NftImg'
import { Expandable } from '../Expandable'
import { NftDetailsViewModel } from './NftDetailsViewModel'
import styles from './NftDetails.module.scss'

interface Props {
    address: string;
}

export const NftDetails = observer(({ address }: Props): JSX.Element => {
    const vm = useViewModel(NftDetailsViewModel, (model) => {
        model.address = address
    })
    const intl = useIntl()

    const handleTransferError = () => vm.notification.error(intl.formatMessage({ id: 'NFT_DETAILS_HINT' }))

    if (!vm.nft) return <PageLoader />

    return (
        <Container>
            {vm.nft.img && (
                <div className={styles.img}>
                    <NftImg src={vm.nft.img} alt={vm.nft.name} />
                </div>
            )}
            {!vm.isEvername && !vm.nft.img && (
                <div className={styles.img}>
                    <img src={PlaceholderImgSrc} alt="" />
                </div>
            )}
            {vm.isEvername && !vm.nft.img && (
                <div className={styles.img}>
                    <img src={EvernameBg} alt="" />
                </div>
            )}

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
            </Content>

            <Footer>
                <Space direction="column" gap="s">
                    {!vm.nft.balance && (
                        <Button onClick={vm.openMarketplace}>
                            {intl.formatMessage({ id: 'NFT_DETAILS_OPEN_IN_MARKETPLACE' })}
                        </Button>
                    )}
                    {vm.isOwner && (
                        <Button design="secondary" onClick={vm.canTransfer ? vm.onTransfer : handleTransferError}>
                            {intl.formatMessage({ id: 'NFT_TRANSFER_BTN_TEXT' })}
                        </Button>
                    )}
                    {vm.nft.balance && (
                        <Button design="secondary" onClick={vm.onTransferTokens}>
                            {intl.formatMessage({ id: 'NFT_TRANSFER_TOKENS_BTN_TEXT' })}
                        </Button>
                    )}
                </Space>
            </Footer>
        </Container>
    )
})
