import {
  Button,
  ButtonGroup,
  Content,
  EnterPassword,
  Footer,
  SlidingPanel,
  useResolve,
} from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Approval } from '../Approval';
import { ApproveDecryptDataViewModel } from './ApproveDecryptDataViewModel';

export const ApproveDecryptData = observer((): JSX.Element | null => {
  const vm = useResolve(ApproveDecryptDataViewModel);
  const intl = useIntl();

  useEffect(() => {
    if (!vm.account && !vm.inProcess) {
      vm.onReject();
    }
  }, [!!vm.account, vm.inProcess]);

  if (!vm.account) return null;

  return (
    <>
      <Approval
        className="approval--encrypt-data"
        title={intl.formatMessage({ id: 'APPROVE_DECRYPT_DATA_APPROVAL_TITLE' })}
        account={vm.account}
        origin={vm.approval.origin}
        networkName={vm.networkName}
      >
        <Content>
          <div className="approval__spend-details">
            <div className="approval__spend-details-param">
              <span className="approval__spend-details-param-desc">
                {intl.formatMessage({ id: 'APPROVE_DECRYPT_DATA_TERM_PUBLIC_KEY' })}
              </span>
              <span className="approval__spend-details-param-value">
                {vm.approval.requestData.sourcePublicKey}
              </span>
            </div>
          </div>
        </Content>

        <Footer>
          <ButtonGroup>
            <Button design="secondary" onClick={vm.onReject}>
              {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
            </Button>
            <Button onClick={vm.openPasswordModal}>
              {intl.formatMessage({ id: 'DECRYPT_BTN_TEXT' })}
            </Button>
          </ButtonGroup>
        </Footer>
      </Approval>

      <SlidingPanel active={vm.passwordModalVisible} onClose={vm.closePasswordModal}>
        <EnterPassword
          keyEntry={vm.keyEntry}
          disabled={vm.inProcess}
          error={vm.error}
          onSubmit={vm.onSubmit}
          onBack={vm.closePasswordModal}
        />
      </SlidingPanel>
    </>
  );
});
