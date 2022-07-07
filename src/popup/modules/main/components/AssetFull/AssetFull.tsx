import DeployIcon from '@app/popup/assets/img/deploy-dark-blue.svg';
import ReceiveIcon from '@app/popup/assets/img/receive-dark-blue.svg';
import SendIcon from '@app/popup/assets/img/send-dark-blue.svg';
import { DeployWallet } from '@app/popup/modules/deploy';
import { AssetIcon, Button, ButtonGroup, SlidingPanel, useViewModel } from '@app/popup/modules/shared';
import { convertCurrency, isSubmitTransaction, NATIVE_CURRENCY, SelectedAsset } from '@app/shared';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';
import { MultisigTransaction } from '../MultisigTransaction';
import { Receive } from '../Receive';
import { ScrollArea } from '../ScrollArea';
import { TransactionInfo } from '../TransactionInfo';
import { TransactionList } from '../TransactionList';
import { AssetFullViewModel, Panel } from './AssetFullViewModel';

import './AssetFull.scss';

interface Props {
  selectedAsset: SelectedAsset;
}

export const AssetFull = observer(({ selectedAsset }: Props): JSX.Element => {
  const vm = useViewModel(AssetFullViewModel, (vm) => {
    vm.selectedAsset = selectedAsset;
  }, [selectedAsset]);
  const intl = useIntl();

  const currencyName = selectedAsset.type === 'ton_wallet' ? NATIVE_CURRENCY : vm.symbol?.name;
  const decimals = selectedAsset.type === 'ton_wallet' ? 9 : vm.symbol?.decimals;
  const old = selectedAsset.type === 'token_wallet' && vm.symbol?.version !== 'Tip3';

  return (
    <>
      <div className="asset-full">
        <div className="asset-full__top">
          <div className="asset-full__info">
            <AssetIcon
              className="asset-full__info-icon"
              old={old}
              type={selectedAsset.type}
              address={
                selectedAsset.type === 'ton_wallet' ?
                  selectedAsset.data.address :
                  selectedAsset.data.rootTokenContract
              }
            />
            <div className="asset-full__info-token">
              <p className="asset-full__info-token-amount">
                {decimals != null && convertCurrency(vm.balance || '0', decimals)}
              </p>
              <p className="asset-full__info-token-comment">{currencyName}</p>
            </div>
          </div>

          <ButtonGroup className="asset-full__controls">
            <Button design="light-blue" onClick={vm.onReceive}>
              <img className="asset-full__controls-icon" src={ReceiveIcon} alt="" />
              {intl.formatMessage({ id: 'RECEIVE_BTN_TEXT' })}
            </Button>

            {vm.showSendButton && vm.shouldDeploy && (
              <Button design="light-blue" onClick={vm.onDeploy}>
                <img className="asset-full__controls-icon" alt="" src={DeployIcon} />
                {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
              </Button>
            )}

            {vm.showSendButton && !vm.shouldDeploy && (
              <Button design="light-blue" onClick={vm.onSend}>
                <img className="asset-full__controls-icon" alt="" src={SendIcon} />
                {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
              </Button>
            )}
          </ButtonGroup>
        </div>

        <ScrollArea className="asset-full__history">
          <TransactionList
            tonWalletAsset={vm.tonWalletAsset}
            topOffset={0}
            fullHeight={380}
            symbol={vm.symbol}
            transactions={vm.transactions}
            onViewTransaction={vm.showTransaction}
            preloadTransactions={vm.preloadTransactions}
          />
        </ScrollArea>
      </div>
      <SlidingPanel active={vm.panel.value !== undefined} onClose={vm.closePanel}>
        {vm.panel.value === Panel.Receive && (
          <Receive
            accountName={vm.account.name}
            address={vm.tonWalletAsset.address}
            currencyName={currencyName}
          />
        )}
        {vm.panel.value === Panel.Deploy && <DeployWallet />}
        {vm.panel.value === Panel.Transaction && vm.selectedTransaction &&
          (isSubmitTransaction(vm.selectedTransaction) ? (
            <MultisigTransaction transaction={vm.selectedTransaction} onOpenInExplorer={vm.openTransactionInExplorer} />
          ) : (
            <TransactionInfo transaction={vm.selectedTransaction} symbol={vm.symbol} onOpenInExplorer={vm.openTransactionInExplorer} />
          ))}
      </SlidingPanel>
    </>
  );
});
