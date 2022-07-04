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
import { DisplayTypeSelector } from '../DisplayTypeSelector';
import { ApproveEncryptDataViewModel } from './ApproveEncryptDataViewModel';

export const ApproveEncryptData = observer((): JSX.Element | null => {
  const vm = useResolve(ApproveEncryptDataViewModel);
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
        title={intl.formatMessage({ id: 'APPROVE_ENRYPT_DATA_APPROVAL_TITLE' })}
        account={vm.account}
        origin={vm.approval.origin}
        networkName={vm.networkName}
      >
        <Content>
          <div className="approval__spend-details">
            <div className="approval__spend-details-param">
              <div className="approval__spend-details-param-desc with-selector">
                <span>
                  {intl.formatMessage({ id: 'APPROVE_ENRYPT_DATA_TERM_DATA' })}
                </span>
                <DisplayTypeSelector value={vm.displayType} onChange={vm.setDisplayType} />
              </div>
              <div className="approval__spend-details-param-data">{vm.data}</div>
            </div>
          </div>
        </Content>

        <Footer>
          <ButtonGroup>
            <Button design="secondary" onClick={vm.onReject}>
              {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
            </Button>
            <Button onClick={vm.openPasswordModal}>
              {intl.formatMessage({ id: 'ENCRYPT_BTN_TEXT' })}
            </Button>
          </ButtonGroup>
        </Footer>
      </Approval>

      <SlidingPanel
        active={vm.passwordModalVisible}
        onClose={vm.closePasswordModal}
      >
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
