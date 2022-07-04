import { ParamsView } from '@app/popup/modules/approvals/components/ParamsView';
import { EnterSendPassword } from '@app/popup/modules/send';
import {
  AssetIcon,
  Button,
  ButtonGroup,
  Content,
  ErrorMessage,
  Footer,
  TonAssetIcon,
  useResolve,
  useViewModel,
} from '@app/popup/modules/shared';
import { convertCurrency, convertTokenName, convertTons, NATIVE_CURRENCY } from '@app/shared';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Approval } from '../Approval';
import { ApproveSendMessageViewModel, Step } from './ApproveSendMessageViewModel';

import './ApproveSendMessage.scss';

export const ApproveSendMessage = observer((): JSX.Element | null => {
  const vm = useViewModel(useResolve(ApproveSendMessageViewModel));
  const intl = useIntl();

  useEffect(() => {
    if (!vm.account && !vm.inProcess) {
      vm.onReject();
    }
  }, [!!vm.account, vm.inProcess]);

  if (!vm.account) return null;

  return (
    <Approval
      className="approval--send-message"
      title={
        vm.step.is(Step.MessagePreview) ?
          intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_APPROVAL_PREVIEW_TITLE' }) :
          intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_APPROVAL_TITLE' })
      }
      account={vm.account}
      origin={vm.approval.origin}
      networkName={vm.networkName}
    >
      {vm.step.is(Step.MessagePreview) && (
        <>
          <Content>
            <div key="message" className="approval__spend-details">
              <div className="approval__spend-details-param">
                <span className="approval__spend-details-param-desc">
                  {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT' })}
                </span>
                <span className="approval__spend-details-param-value">
                  {vm.approval.requestData.recipient}
                </span>
              </div>
              {vm.tokenTransaction != null && (
                <div className="approval__spend-details-param">
                  <span className="approval__spend-details-param-desc">
                    {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })}
                  </span>
                  <span className="approval__spend-details-param-value approval--send-message__amount">
                    <AssetIcon
                      type="token_wallet"
                      address={vm.tokenTransaction.rootTokenContract}
                      old={vm.tokenTransaction.old}
                      className="root-token-icon noselect"
                    />
                    <span className="token-amount-text">
                      {convertCurrency(
                        vm.tokenTransaction.amount,
                        vm.tokenTransaction.decimals,
                      )}
                    </span>
                    &nbsp;
                    <span className="root-token-name">
                      {convertTokenName(vm.tokenTransaction.symbol)}
                    </span>
                  </span>
                </div>
              )}
              <div className="approval__spend-details-param">
                <span className="approval__spend-details-param-desc">
                  {!vm.tokenTransaction ?
                    intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' }) :
                    intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_ATTACHED_AMOUNT' })}
                </span>
                <span className="approval__spend-details-param-value approval--send-message__amount">
                  <TonAssetIcon className="root-token-icon noselect" />
                  {convertTons(vm.approval.requestData.amount)} {NATIVE_CURRENCY}
                </span>
                {vm.balance.lessThan(vm.approval.requestData.amount) && (
                  <ErrorMessage>
                    {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_INSUFFICIENT_FUNDS' })}
                  </ErrorMessage>
                )}
              </div>
              <div className="approval__spend-details-param">
                <span className="approval__spend-details-param-desc">
                  {intl.formatMessage({
                    id: 'APPROVE_SEND_MESSAGE_TERM_BLOCKCHAIN_FEE',
                  })}
                </span>
                {vm.isDeployed && (
                  <span className="approval__spend-details-param-value approval--send-message__amount">
                    <TonAssetIcon className="root-token-icon noselect" />
                    {vm.fees != null ?
                      `~${convertTons(vm.fees)} ${NATIVE_CURRENCY}` :
                      intl.formatMessage({ id: 'CALCULATING_HINT' })}
                  </span>
                )}
                {!vm.isDeployed && (
                  <div className="check-seed__content-error">
                    {intl.formatMessage({
                      id: 'APPROVE_SEND_MESSAGE_OPERATION_NOT_POSSIBLE',
                    })}
                  </div>
                )}
              </div>
              {vm.approval.requestData.payload && (
                <div className="approval__spend-details-param">
                  <span className="approval__spend-details-param-desc">
                    {intl.formatMessage({
                      id: 'APPROVE_SEND_MESSAGE_TERM_DATA',
                    })}
                  </span>
                  <div className="approval__spend-details-param-data">
                    <div className="approval__spend-details-param-data__method">
                      <span>
                        {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_DATA_METHOD' })}
                      </span>
                      <span>{vm.approval.requestData.payload.method}</span>
                    </div>
                    <ParamsView params={vm.approval.requestData.payload.params} />
                  </div>
                </div>
              )}
            </div>
          </Content>

          <Footer>
            <ButtonGroup>
              <Button design="secondary" onClick={vm.onReject}>
                {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
              </Button>
              <Button
                disabled={vm.balance.lessThan(vm.approval.requestData.amount) || !vm.selectedKey}
                onClick={vm.step.setEnterPassword}
              >
                {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
              </Button>
            </ButtonGroup>
          </Footer>
        </>
      )}

      {vm.step.is(Step.EnterPassword) && vm.selectedKey && (
        <EnterSendPassword
          keyEntries={vm.selectableKeys!.keys}
          keyEntry={vm.selectedKey}
          amount={vm.messageAmount}
          recipient={vm.approval.requestData.recipient}
          masterKeysNames={vm.masterKeysNames}
          fees={vm.fees}
          error={vm.error}
          disabled={vm.inProcess}
          onSubmit={vm.onSubmit}
          onBack={vm.step.setMessagePreview}
          onChangeKeyEntry={vm.setKey}
        />
      )}
    </Approval>
  );
});
