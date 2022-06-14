import { useResolve, useViewModel } from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { LedgerAccountSelector } from '../LedgerAccountSelector';
import { LedgerConnector } from '../LedgerConnector';
import { LedgerAccountManagerViewModel, Step } from './LedgerAccountManagerViewModel';

interface Props {
  name?: string;
  onBack: () => void;
}

export const LedgerAccountManager = observer(({ onBack, name }: Props): JSX.Element => {
  const vm = useViewModel(useResolve(LedgerAccountManagerViewModel), (vm) => {
    vm.name = name;
    vm.onBack = onBack;
  });

  return (
    <>
      {vm.step.value === Step.Connect && (
        <LedgerConnector
          onBack={onBack}
          onNext={vm.step.setSelect}
        />
      )}

      {vm.step.value === Step.Select && (
        <LedgerAccountSelector
          onBack={onBack}
          onSuccess={vm.onSuccess}
          onError={vm.step.setConnect}
        />
      )}
    </>
  );
});
