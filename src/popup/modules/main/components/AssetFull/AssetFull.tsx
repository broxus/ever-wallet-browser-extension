import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useMemo } from 'react'

import DeployIcon from '@app/popup/assets/img/deploy-white.svg'
import ReceiveIcon from '@app/popup/assets/img/receive-white.svg'
import SendIcon from '@app/popup/assets/img/send-white.svg'
import { DeployWallet } from '@app/popup/modules/deploy'
import {
    AssetIcon,
    Button,
    ButtonGroup,
    SlidingPanel,
    useViewModel,
} from '@app/popup/modules/shared'
import { convertCurrency,
    isSubmitTransaction,
    SelectedAsset, supportedByLedger } from '@app/shared'
import { LedgerVerifyAddress } from '@app/popup/modules/ledger'

import { MultisigTransaction } from '../MultisigTransaction'
import { Receive } from '../Receive'
import { ScrollArea } from '../ScrollArea'
import { TransactionInfo } from '../TransactionInfo'
import { TransactionList } from '../TransactionList'
import { AssetFullViewModel, Panel } from './AssetFullViewModel'

import './AssetFull.scss'

interface Props {
    selectedAsset: SelectedAsset;
}

export const AssetFull = observer(({ selectedAsset }: Props): JSX.Element => {
    const vm = useViewModel(AssetFullViewModel, model => {
        model.selectedAsset = selectedAsset
    }, [selectedAsset])
    const intl = useIntl()

    const { type, data } = selectedAsset
    const assetIcon = useMemo(() => (
        <AssetIcon
            old={vm.old}
            type={type}
            address={type === 'ever_wallet' ? data.address : data.rootTokenContract}
        />
    ), [vm.old, type, data])

    return (
        <>
            <div className="asset-full">
                <div className="asset-full__top">
                    <div className="asset-full__info">
                        {assetIcon}
                        <div className="asset-full__info-token">
                            <p className="asset-full__info-token-amount">
                                {vm.decimals != null && convertCurrency(vm.balance || '0', vm.decimals)}
                            </p>
                            <p className="asset-full__info-token-comment">{vm.currencyName}</p>
                        </div>
                    </div>

                    <ButtonGroup>
                        <Button onClick={vm.onReceive}>
                            <img src={ReceiveIcon} alt="" />
                            {intl.formatMessage({ id: 'RECEIVE_BTN_TEXT' })}
                        </Button>

                        {vm.showSendButton && vm.shouldDeploy && (
                            <Button onClick={vm.onDeploy}>
                                <img src={DeployIcon} alt="" />
                                {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
                            </Button>
                        )}

                        {vm.showSendButton && !vm.shouldDeploy && (
                            <Button onClick={vm.onSend}>
                                <img src={SendIcon} alt="" />
                                {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                            </Button>
                        )}
                    </ButtonGroup>
                </div>

                <ScrollArea className="asset-full__history">
                    <TransactionList
                        everWalletAsset={vm.everWalletAsset}
                        topOffset={0}
                        fullHeight={380}
                        symbol={vm.symbol}
                        transactions={vm.transactions}
                        pendingTransactions={vm.pendingTransactions}
                        preloadTransactions={vm.preloadTransactions}
                        onViewTransaction={vm.showTransaction}
                    />
                </ScrollArea>
            </div>
            <SlidingPanel active={vm.panel.value !== undefined} onClose={vm.closePanel}>
                {vm.panel.is(Panel.Receive) && (
                    <Receive
                        account={vm.account}
                        symbol={<>{assetIcon}{vm.currencyName}</>}
                        canVerifyAddress={vm.key.signerName === 'ledger_key' && supportedByLedger(vm.account.tonWallet.contractType)}
                        onVerifyAddress={vm.verifyAddress}
                    />
                )}
                {vm.panel.is(Panel.Deploy) && <DeployWallet />}
                {vm.panel.is(Panel.Transaction) && vm.selectedTransaction
                    && (isSubmitTransaction(vm.selectedTransaction) ? (
                        <MultisigTransaction
                            transaction={vm.selectedTransaction}
                            onOpenInExplorer={vm.openTransactionInExplorer}
                        />
                    ) : (
                        <TransactionInfo
                            transaction={vm.selectedTransaction}
                            symbol={vm.symbol}
                            nativeCurrency={vm.currencyName}
                            onOpenInExplorer={vm.openTransactionInExplorer}
                        />
                    ))}
                {vm.panel.is(Panel.VerifyAddress) && vm.addressToVerify && (
                    <LedgerVerifyAddress address={vm.addressToVerify} onBack={vm.closePanel} />
                )}
            </SlidingPanel>
        </>
    )
})
