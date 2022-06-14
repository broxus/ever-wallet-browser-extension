import { Container, Header, useResolve, useViewModel } from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';
import { MultisigForm } from '../MultisigForm';
import { PreparedMessage } from '../PreparedMessage';
import { DeployMultisigWalletViewModel, Step } from './DeployMultisigWalletViewModel';

import './DeployMultisigWallet.scss';

export const DeployMultisigWallet = observer((): JSX.Element | null => {
  const vm = useViewModel(useResolve(DeployMultisigWalletViewModel));
  const intl = useIntl();

  if (!vm.selectedAccount) return null;

  return (
    <Container className="deploy-multisig">
      <Header>
        <h2 className="deploy-multisig__header-title">
          {intl.formatMessage({ id: 'DEPLOY_MULTISIG_PANEL_HEADER' })}
        </h2>
        {vm.step.value === Step.DeployMessage && (
          <h3 className="deploy-multisig__header-subtitle">
            {intl.formatMessage({ id: 'DEPLOY_MULTISIG_PANEL_COMMENT' })}
          </h3>
        )}
      </Header>

      {vm.step.value === Step.DeployMessage && (
        <PreparedMessage
          keyEntry={vm.selectedDerivedKeyEntry}
          balance={vm.tonWalletState?.balance}
          fees={vm.fees}
          custodians={vm.multisigData?.custodians}
          disabled={vm.inProcess}
          error={vm.error}
          onSubmit={vm.onSubmit}
          onBack={vm.step.setEnterData}
        />
      )}

      {vm.step.value === Step.EnterData && (
        <MultisigForm key="multisig" data={vm.multisigData} onSubmit={vm.onNext} />
      )}
    </Container>
  );
});
