import React, { memo } from 'react';
import { useIntl } from 'react-intl';
import { useForm } from 'react-hook-form';
import { Button, Input } from '@app/popup/modules/shared';

import './NewPassword.scss';

interface Props {
  disabled: boolean;
  onSubmit: (password: string) => void;
  onBack: () => void;
}

interface FormValue {
  password: string;
  passwordConfirm: string;
}

export const NewPassword = memo(({ disabled, onSubmit, onBack }: Props): JSX.Element => {
  const intl = useIntl();
  const { register, handleSubmit, watch, formState } = useForm<FormValue>();

  const trySubmit = (data: FormValue) => {
    if (!disabled) {
      onSubmit(data.password);
    }
  };

  return (
    <div className="new-password">
      <div className="new-password__form">
        <h2 className="new-password__form-header">
          {intl.formatMessage({ id: 'PASSWORD_PROTECTION' })}
        </h2>
        <h3 className="new-password__form-comment">
          {intl.formatMessage({ id: 'PASSWORD_PROTECTION_NOTE' })}
        </h3>
        <form
          id="password"
          onSubmit={handleSubmit(trySubmit)}
          style={{ position: 'relative' }}
        >
          <Input
            type="password"
            autoFocus
            placeholder={intl.formatMessage({ id: 'PASSWORD_FIELD_PLACEHOLDER' })}
            disabled={disabled}
            {...register('password', {
              required: true,
              minLength: 6,
            })}
          />
          <Input
            type="password"
            placeholder={intl.formatMessage({ id: 'PASSWORD_CONFIRM_FIELD_PLACEHOLDER' })}
            disabled={disabled}
            {...register('passwordConfirm', {
              required: true,
              validate: (value) => value === watch('password'),
            })}
          />
          {formState.errors.password && (
            <div className="new-password__form-error">
              {intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED' })}
            </div>
          )}
          {formState.errors.passwordConfirm && (
            <div className="new-password__form-error">
              {intl.formatMessage({ id: 'ERROR_PASSWORD_DOES_NOT_MATCH' })}
            </div>
          )}
        </form>
      </div>
      <div className="new-password__buttons">
        <Button
          form="password"
          disabled={disabled}
          onClick={handleSubmit(trySubmit)}
        >
          {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
        </Button>
        <Button
          design="secondary"
          disabled={disabled}
          onClick={onBack}
        >
          {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
        </Button>
      </div>
    </div>
  );
});
