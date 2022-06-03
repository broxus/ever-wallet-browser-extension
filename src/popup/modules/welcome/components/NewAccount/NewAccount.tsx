import { Notification, useResolve } from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { CheckSeed } from '../CheckSeed';
import { NewPassword } from '../NewPassword';
import { ExportedSeed } from '../ExportedSeed';
import { SelectContractType } from '../SelectContractType';
import { NewAccountViewModel, Step } from './NewAccountViewModel';

type Props = {
  name: string;
  onBack: () => void;
};

export const NewAccount = observer(({ name, onBack }: Props) => {
  const vm = useResolve(NewAccountViewModel);
  const intl = useIntl();

  const submit = useCallback((pwd: string) => vm.submit(name, pwd), [name]);

  return (
    <>
      {vm.step.value === Step.SelectContractType && (
        <SelectContractType
          onSubmit={vm.setContractType}
          onBack={onBack}
        />
      )}
      {vm.step.value === Step.ShowPhrase && (
        <ExportedSeed
          onBack={vm.step.setSelectContractType}
          onNext={vm.step.setCheckPhrase}
          seed={vm.seed.phrase}
        />
      )}
      {vm.step.value === Step.CheckPhrase && (
        <CheckSeed
          onSubmit={vm.step.setEnterPassword}
          onBack={vm.step.setShowPhrase}
          seed={vm.seed.phrase}
        />
      )}
      {vm.step.value === Step.EnterPassword && (
        <NewPassword
          disabled={vm.inProcess}
          onSubmit={submit}
          onBack={vm.step.setShowPhrase}
        />
      )}
      {vm.error && (
        <Notification
          title={intl.formatMessage({ id: 'COULD_NOT_CREATE_WALLET' })}
          onClose={vm.resetError}
        >
          <p className="error-message">{vm.error}</p>
        </Notification>
      )}
    </>
  );
});
