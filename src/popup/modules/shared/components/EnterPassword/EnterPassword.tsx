import { Button, ButtonGroup, ErrorMessage, Footer, Input } from '@app/popup/modules/shared';
import type nt from '@wallet/nekoton-wasm';
import React, { memo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import './EnterPassword.scss';

interface Props {
  keyEntry?: nt.KeyStoreEntry;
  disabled?: boolean;
  error?: string;
  onSubmit(password: string): void;
  onBack(): void;
}

interface FormValue {
  password: string;
}

export const EnterPassword = memo((props: Props): JSX.Element => {
  const {
    keyEntry,
    disabled,
    error,
    onSubmit,
    onBack,
  } = props;

  const intl = useIntl();
  const { register, handleSubmit, formState } = useForm<FormValue>();

  const submit = useCallback(({ password }: FormValue) => onSubmit(password), [onSubmit]);

  return (
    <div className="enter-password">
      <div className="enter-password__content">
        {keyEntry?.signerName === 'ledger_key' ? (
          <div className="enter-password__form">
            <div className="enter-password__form-ledger">
              {intl.formatMessage({
                id: 'APPROVE_ENTER_PASSWORD_DRAWER_CONFIRM_WITH_LEDGER',
              })}
            </div>
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        ) : (
          <div className="enter-password__form">
            <h2 className="enter-password__form-title">
              {intl.formatMessage({ id: 'APPROVE_ENTER_PASSWORD_DRAWER_HEADER' })}
            </h2>
            <form id="password" onSubmit={handleSubmit(submit)}>
              <Input
                type="password"
                autoFocus
                disabled={disabled}
                placeholder={intl.formatMessage({
                  id: 'APPROVE_ENTER_PASSWORD_DRAWER_PASSWORD_FIELD_PLACEHOLDER',
                })}
                {...register('password', {
                  required: true,
                  minLength: 6,
                })}
              />
              <ErrorMessage>
                {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
              </ErrorMessage>
              <ErrorMessage>{error}</ErrorMessage>
            </form>
          </div>
        )}
      </div>

      <Footer>
        <ButtonGroup>
          <Button group="small" design="secondary" disabled={disabled} onClick={() => onBack()}>
            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
          </Button>
          <Button type="submit" form="password" disabled={disabled}>
            {keyEntry?.signerName === 'ledger_key' ?
              intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' }) :
              intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
          </Button>
        </ButtonGroup>
      </Footer>
    </div>
  );
});
