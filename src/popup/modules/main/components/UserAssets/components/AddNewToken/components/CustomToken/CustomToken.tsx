import { TokenWalletsToUpdate } from '@app/models';
import { Button, ButtonGroup, ErrorMessage, Input, useViewModel } from '@app/popup/modules/shared';
import React, { memo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { CustomTokenViewModel } from './CustomTokenViewModel';

import './CustomToken.scss';

interface NewToken {
  rootTokenContract: string;
}

interface Props {
  disabled?: boolean;
  error?: string;
  onSubmit: (params: TokenWalletsToUpdate) => void;
  onBack: () => void;
}

export const CustomToken = memo(({ disabled, error, onSubmit, onBack }: Props): JSX.Element => {
  const vm = useViewModel(CustomTokenViewModel);
  const intl = useIntl();
  const { register, handleSubmit, formState } = useForm<NewToken>();

  const submit = useCallback(({ rootTokenContract }: NewToken) => {
    onSubmit({
      [rootTokenContract]: true,
    });
  }, []);

  return (
    <div className="custom-token">
      <form id="custom-token" onSubmit={handleSubmit(submit)}>
        <Input
          type="text"
          disabled={disabled}
          placeholder={intl.formatMessage({ id: 'ROOT_TOKEN_CONTRACT_FIELD_PLACEHOLDER' })}
          {...register('rootTokenContract', {
            required: true,
            pattern: /^(?:-1|0):[0-9a-fA-F]{64}$/,
            validate: (value: string) => value != null && vm.checkAddress(value),
          })}
        />

        <ErrorMessage>{error}</ErrorMessage>
        {formState.errors.rootTokenContract && (
          <ErrorMessage>
            {formState.errors.rootTokenContract.type === 'required' &&
              intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
            {(formState.errors.rootTokenContract.type === 'pattern' ||
                formState.errors.rootTokenContract.type === 'validate') &&
              intl.formatMessage({ id: 'ERROR_INVALID_ADDRESS' })}
          </ErrorMessage>
        )}
      </form>

      <ButtonGroup className="custom-token__buttons">
        <Button design="secondary" disabled={disabled} onClick={onBack}>
          {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
        </Button>
        <Button type="submit" form="custom-token" disabled={disabled}>
          {intl.formatMessage({ id: 'PROCEED_BTN_TEXT' })}
        </Button>
      </ButtonGroup>
    </div>
  );
});
