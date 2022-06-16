import {
  Button,
  ButtonGroup,
  Container,
  Content,
  ErrorMessage,
  Footer,
  Header,
  Input,
} from '@app/popup/modules/shared';
import React, { memo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

interface Props {
  disabled?: boolean;
  error?: string;
  onSubmit(password: string): void;
  onBack(): void;
}

interface FormValue {
  password: string;
  passwordConfirm: string;
}

export const EnterNewSeedPasswords = memo(({ disabled, error, onBack, onSubmit }: Props): JSX.Element => {
  const intl = useIntl();
  const { register, handleSubmit, watch, formState } = useForm<FormValue>();

  const submit = useCallback(({ password }: FormValue) => onSubmit(password), [onSubmit]);

  return (
    <Container className="accounts-management">
      <Header>
        <h2>{intl.formatMessage({ id: 'IMPORT_SEED_PANEL_CONFIRM_HEADER' })}</h2>
      </Header>

      <Content>
        <form id="password" onSubmit={handleSubmit(submit)}>
          <div className="accounts-management__content-form-rows">
            <div className="accounts-management__content-form-row">
              <Input
                autoFocus
                type="password"
                disabled={disabled}
                placeholder={intl.formatMessage({ id: 'PASSWORD_FIELD_PLACEHOLDER' })}
                {...register('password', {
                  required: true,
                  minLength: 6,
                })}
              />

              <ErrorMessage>
                {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED' })}
              </ErrorMessage>
            </div>

            <div className="accounts-management__content-form-row">
              <Input
                type="password"
                disabled={disabled}
                placeholder={intl.formatMessage({ id: 'PASSWORD_CONFIRM_FIELD_PLACEHOLDER' })}
                {...register('passwordConfirm', {
                  required: true,
                  validate: (value) => value === watch('password'),
                })}
              />

              <ErrorMessage>
                {formState.errors.passwordConfirm && intl.formatMessage({ id: 'ERROR_PASSWORD_DOES_NOT_MATCH' })}
              </ErrorMessage>
            </div>
          </div>
          <ErrorMessage>{error}</ErrorMessage>
        </form>
      </Content>

      <Footer>
        <ButtonGroup>
          <Button group="small" design="secondary" disabled={disabled} onClick={onBack}>
            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
          </Button>
          <Button form="password" type="submit" disabled={disabled}>
            {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
          </Button>
        </ButtonGroup>
      </Footer>
    </Container>
  );
});
