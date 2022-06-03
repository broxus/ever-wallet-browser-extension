import { useResolve } from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { LedgerAccountSelector } from '../LedgerAccountSelector';
import { LedgerConnector } from '../LedgerConnector';
import { LedgerSignInViewModel, Step } from './LedgerSignInViewModel';

import './LedgerSignIn.scss';

interface Props {
  onBack: () => void;
}

// TODO: test with ledger
export const LedgerSignIn = observer(({ onBack }: Props) => {
  const vm = useResolve(LedgerSignInViewModel);

  return (
    <div className="ledger-sign-in">
      {vm.step.value === Step.Connect && (
        <LedgerConnector
          theme="sign-in"
          onBack={onBack}
          onNext={vm.step.setSelect}
        />
      )}

      {vm.step.value === Step.Select && (
        <LedgerAccountSelector
          theme="sign-in"
          onBack={onBack}
          onSuccess={vm.onSuccess}
          onError={vm.step.setConnect}
        />
      )}
    </div>
  );
});
