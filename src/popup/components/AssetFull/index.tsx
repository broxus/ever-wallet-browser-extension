import AssetIcon from '@app/popup/components/AssetIcon';
import { DeployWallet } from '@app/popup/components/DeployWallet';
import { MultisigTransactionSign } from '@app/popup/components/MultisigTransaction';
import Receive from '@app/popup/components/Receive';
import { Send } from '@app/popup/components/Send';
import SlidingPanel from '@app/popup/components/SlidingPanel';
import { TransactionInfo } from '@app/popup/components/TransactionInfo';
import { TransactionsList } from '@app/popup/components/TransactionsList';
import { useRipple } from '@app/popup/modules/shared/hooks';
import DeployIcon from '@app/popup/assets/img/deploy-dark-blue.svg';
import ReceiveIcon from '@app/popup/assets/img/receive-dark-blue.svg';
import SendIcon from '@app/popup/assets/img/send-dark-blue.svg';
import { useAccountability } from '@app/popup/modules/shared/providers/AccountabilityProvider';
import { useRpc } from '@app/popup/modules/shared/providers/RpcProvider';
import { useRpcState } from '@app/popup/modules/shared/providers/RpcStateProvider';
import { getScrollWidth } from '@app/popup/utils';
import { convertCurrency, isSubmitTransaction, NATIVE_CURRENCY, SelectedAsset, TokenWalletState } from '@app/shared';
import type nt from 'nekoton-wasm';
import React from 'react';
import { useIntl } from 'react-intl';

import './style.scss';

type Props = {
  tokenWalletStates: { [rootTokenContract: string]: TokenWalletState }
  selectedKeys: nt.KeyStoreEntry[]
  selectedAsset: SelectedAsset
};

enum Panel {
  RECEIVE,
  SEND,
  DEPLOY,
  TRANSACTION,
}

export function AssetFull({ tokenWalletStates, selectedAsset, selectedKeys }: Props) {
  const intl = useIntl();
  const accountability = useAccountability();
  const rpc = useRpc();
  const rpcState = useRpcState();
  const ripple = useRipple();

  const account = accountability.selectedAccount;

  if (account == null) {
    return null;
  }

  const [openedPanel, setOpenedPanel] = React.useState<Panel>();
  const [selectedTransaction, setSelectedTransaction] = React.useState<nt.Transaction>();
  const scrollArea = React.useRef<HTMLDivElement>(null);

  const accountName = account.name;
  const accountAddress = account.tonWallet.address;
  const tonWalletAsset = account.tonWallet;
  const tonWalletState = rpcState.state.accountContractStates[accountAddress] as
    | nt.ContractState
    | undefined;
  const tokenWalletAssets = account.additionalAssets[rpcState.state.selectedConnection.group]?.tokenWallets || [];

  const scrollWidth = React.useMemo(() => getScrollWidth(), []);
  const shouldDeploy = React.useMemo(() => {
    if (selectedAsset.type === 'ton_wallet') {
      return (
        tonWalletState == null ||
        (!tonWalletState.isDeployed &&
          nt.getContractTypeDetails(account.tonWallet.contractType)
            .requiresSeparateDeploy)
      );
    }
    return false;
  }, [selectedAsset, tonWalletState]);
  const balance = React.useMemo(() => {
    if (selectedAsset.type === 'ton_wallet') {
      return tonWalletState?.balance;
    }
    const rootTokenContract = selectedAsset.data.rootTokenContract;
    return rpcState.state.accountTokenStates[accountAddress]?.[rootTokenContract]?.balance;
  }, [selectedAsset, rpcState.state.accountTokenStates, tonWalletState]);
  const transactions = React.useMemo(() => {
    if (selectedAsset.type === 'ton_wallet') {
      return rpcState.state.accountTransactions[accountAddress] || [];
    }
    const tokenTransactions = rpcState.state.accountTokenTransactions[accountAddress]?.[
      selectedAsset.data.rootTokenContract
    ];
    return (
      tokenTransactions?.filter((transaction) => {
        const tokenTransaction = transaction as nt.TokenWalletTransaction;
        return tokenTransaction.info != null;
      }) || []
    );
  }, [selectedAsset, rpcState.state.accountTransactions, rpcState.state.accountTokenTransactions]);
  const symbol = React.useMemo(() => {
    if (selectedAsset.type === 'ton_wallet') {
      return undefined;
    }
    const rootTokenContract = selectedAsset.data.rootTokenContract;
    return rpcState.state.knownTokens[rootTokenContract];
  }, []);

  const currencyName = selectedAsset.type === 'ton_wallet' ? NATIVE_CURRENCY : symbol?.name;
  const decimals = selectedAsset.type === 'ton_wallet' ? 9 : symbol?.decimals;
  const old = selectedAsset.type === 'token_wallet' && symbol?.version !== 'Tip3';

  const preloadTransactions = React.useCallback(
    ({ lt, hash }: nt.TransactionId) => {
      if (selectedAsset.type === 'ton_wallet') {
        return rpc.preloadTransactions(accountAddress, lt, hash);
      }
      const rootTokenContract = selectedAsset.data.rootTokenContract;
      return rpc.preloadTokenTransactions(accountAddress, rootTokenContract, lt, hash);
    },
    [accountAddress, selectedAsset],
  );

  const closePanel = () => {
    setSelectedTransaction(undefined);
    setOpenedPanel(undefined);
  };

  const showTransaction = (transaction: nt.Transaction) => {
    setSelectedTransaction(transaction);
    setOpenedPanel(Panel.TRANSACTION);
  };

  const onReceive = () => {
    setOpenedPanel(Panel.RECEIVE);
  };

  const onSend = async () => {
    await rpc.tempStorageInsert('selected_asset', selectedAsset);
    await rpc.openExtensionInExternalWindow({
      group: 'send',
      width: 360 + scrollWidth - 1,
      height: 600 + scrollWidth - 1,
    });
    setOpenedPanel(undefined);
  };

  const onDeploy = () => {
    setOpenedPanel(Panel.DEPLOY);
  };

  React.useEffect(() => {
    const transactionToUpdate = (
      transactions as (nt.TonWalletTransaction | nt.TokenWalletTransaction)[]
    ).find((transaction) => transaction.id === selectedTransaction?.id);
    if (transactionToUpdate !== undefined) {
      setSelectedTransaction(transactionToUpdate);
    }
  }, [transactions]);

  const showSendButton = tonWalletState &&
    (balance || '0') !== '0' &&
    (selectedAsset.type === 'ton_wallet' ||
      tonWalletState.isDeployed ||
      !nt.getContractTypeDetails(account.tonWallet.contractType).requiresSeparateDeploy);

  return (
    <>
      <div className="asset-full">
        <div className="asset-full__top" />
        <div className="asset-full__info">
          <AssetIcon
            type={selectedAsset.type}
            address={
              selectedAsset.type === 'ton_wallet' ?
                selectedAsset.data.address :
                selectedAsset.data.rootTokenContract
            }
            old={old}
            className="asset-full__info__icon"
          />
          <div className="asset-full__info-token">
            <span className="asset-full__info-token-amount">
              {decimals != null && convertCurrency(balance || '0', decimals)}
            </span>
            <span className="asset-full__info-token-comment">{currencyName}</span>
          </div>
        </div>

        <div className="asset-full__controls noselect">
          <button
            className="asset-full__controls__button"
            onClick={() => {}}
            onMouseDown={ripple.create}
            onMouseLeave={ripple.remove}
            onMouseUp={(event) => {
              ripple.remove(event);
              onReceive();
            }}
          >
            <div className="asset-full__controls__button__content">
              <img src={ReceiveIcon} alt="" style={{ marginRight: '8px' }} />
              {intl.formatMessage({ id: 'RECEIVE_BTN_TEXT' })}
            </div>
          </button>

          {showSendButton && (
            <button
              className="asset-full__controls__button"
              onClick={() => {
              }}
              onMouseDown={ripple.create}
              onMouseLeave={ripple.remove}
              onMouseUp={(event) => {
                ripple.remove(event);
                if (shouldDeploy) {
                  onDeploy();
                } else {
                  onSend();
                }
              }}
            >
              <div className="asset-full__controls__button__content">
                {shouldDeploy ? (
                  <>
                    <img
                      src={DeployIcon}
                      alt=""
                      style={{ marginRight: '8px' }}
                    />
                    {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
                  </>
                ) : (
                  <>
                    <img src={SendIcon} alt="" style={{ marginRight: '8px' }} />
                    {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                  </>
                )}
              </div>
            </button>
          )}
        </div>

        <div className="asset-full__history" ref={scrollArea}>
          <TransactionsList
            tonWalletAsset={tonWalletAsset}
            topOffset={0}
            fullHeight={380}
            scrollArea={scrollArea}
            symbol={symbol}
            transactions={transactions}
            onViewTransaction={showTransaction}
            preloadTransactions={preloadTransactions}
          />
        </div>
      </div>
      <SlidingPanel isOpen={openedPanel != null} onClose={closePanel}>
        <>
          {openedPanel === Panel.RECEIVE && (
            <Receive
              accountName={accountName}
              address={accountAddress}
              currencyName={currencyName}
            />
          )}
          {openedPanel === Panel.SEND && tonWalletState && (
            <Send
              accountName={accountName}
              tonWalletAsset={tonWalletAsset}
              tokenWalletAssets={tokenWalletAssets}
              defaultAsset={selectedAsset}
              keyEntries={selectedKeys}
              tonWalletState={tonWalletState}
              tokenWalletStates={tokenWalletStates}
              knownTokens={rpcState.state.knownTokens}
              onBack={closePanel}
              estimateFees={async (params) => rpc.estimateFees(accountAddress, params, {})}
              prepareMessage={async (params, password) => rpc.prepareTransferMessage(accountAddress, params, password)}
              prepareTokenMessage={async (owner, rootTokenContract, params) => rpc.prepareTokenMessage(owner, rootTokenContract, params)}
              sendMessage={async (message) => rpc.sendMessage(accountAddress, message)}
            />
          )}
          {openedPanel === Panel.DEPLOY && <DeployWallet />}
          {openedPanel === Panel.TRANSACTION && selectedTransaction &&
            (isSubmitTransaction(selectedTransaction) ? (
              <MultisigTransactionSign transaction={selectedTransaction} />
            ) : (
              <TransactionInfo transaction={selectedTransaction} symbol={symbol} />
            ))}
        </>
      </SlidingPanel>
    </>
  );
}
