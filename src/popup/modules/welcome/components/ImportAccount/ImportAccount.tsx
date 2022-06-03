import { Notification, useResolve } from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { EnterSeed } from '../EnterSeed';
import { NewPassword } from '../NewPassword';
import { SelectContractType } from '../SelectContractType';
import { ImportAccountViewModel, Step } from './ImportAccountViewModel';

interface Props {
  name: string;
  onBack: () => void;
}

export const ImportAccount = observer(({ name, onBack }: Props): JSX.Element => {
  const vm = useResolve(ImportAccountViewModel);
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
      {vm.step.value === Step.EnterPhrase && (
        <EnterSeed
          wordCount={vm.wordCount}
          getBip39Hints={vm.getBip39Hints}
          onSubmit={vm.submitSeed}
          onBack={vm.step.setSelectContractType}
        />
      )}
      {vm.step.value === Step.EnterPassword && (
        <NewPassword
          disabled={vm.inProcess}
          onSubmit={submit}
          onBack={vm.step.setEnterPhrase}
        />
      )}
      {vm.error && (
        <Notification
          title={intl.formatMessage({ id: 'COULD_NOT_IMPORT_WALLET' })}
          onClose={vm.resetError}
        >
          <p className="error-message">{vm.error}</p>
        </Notification>
      )}
    </>
  );
});
