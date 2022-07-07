import { Button, Container, Content, Footer, Input } from '@app/popup/modules/shared';
import React, { memo, useCallback, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import './MultisigForm.scss';

export interface MultisigData {
  custodians: string[];
  reqConfirms: number;
}

interface FormValue {
  custodians: Array<{
    value: string;
  }>;
  reqConfirms: number;
}

interface Props {
  data?: MultisigData;
  onSubmit: (data: MultisigData) => void;
}

export const MultisigForm = memo(({ data, onSubmit }: Props): JSX.Element => {
  const intl = useIntl();
  const { register, handleSubmit, formState, control } = useForm<FormValue>({
    defaultValues: useMemo(() => ({
      custodians: data?.custodians.map((value) => ({ value })) ?? [{ value: '' }],
      reqConfirms: data?.reqConfirms ?? 1,
    }), [data]),
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'custodians' });

  const addField = useCallback(() => append({ value: '' }), [append]);
  const submit = useCallback((value: FormValue) => {
    onSubmit({
      custodians: value.custodians.map(({ value }) => value),
      reqConfirms: value.reqConfirms,
    });
  }, [onSubmit]);

  return (
    <Container className="multisig-form">
      <Content>
        <form id="multisig" className="multisig-form__form" onSubmit={handleSubmit(submit)}>
          <div className="multisig-form__form-row">
            <div className="multisig-form__content-header">
              {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_CONTENT_HEADER' })}
            </div>

            <Input
              autoFocus
              autoComplete="off"
              placeholder={intl.formatMessage({ id: 'ENTER_NUMBER_PLACEHOLDER' })}
              suffix={intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_FIELD_COUNT_HINT' }, { count: fields.length })}
              {...register('reqConfirms', {
                required: true,
                min: 1,
                max: fields.length,
              })}
            />

            {formState.errors.reqConfirms !== undefined && (
              <>
                {formState.errors.reqConfirms.type === 'max' && (
                  <div className="multisig-form__content-error">
                    {intl.formatMessage(
                      { id: 'DEPLOY_MULTISIG_FORM_VALIDATION_MAX' },
                      { count: fields.length },
                    )}
                  </div>
                )}
                {formState.errors.reqConfirms.type === 'required' && (
                  <div className="multisig-form__content-error">
                    {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_VALIDATION_REQUIRED' })}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="multisig-form__content-header--lead" style={{ marginTop: 0 }}>
            {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_LIST_CUSTODIANS_HEADER' })}
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="multisig-form__form-row">
              <div className="multisig-form__content-header">
                {intl.formatMessage(
                  { id: 'DEPLOY_MULTISIG_FORM_CUSTODIAN_FIELD_LABEL' },
                  { index: index + 1 },
                )}
              </div>
              <div className="multisig-form__field">
                <Input
                  type="text"
                  autoComplete="off"
                  placeholder={intl.formatMessage({ id: 'ENTER_PUBLIC_KEY_FIELD_PLACEHOLDER' })}
                  suffix={fields.length > 1 && (
                    <button type="button" className="multisig-form__field-delete" onClick={() => remove(index)}>
                      {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                    </button>
                  )}
                  {...register(`custodians.${index}.value` as const, {
                    required: true,
                    pattern: /^[a-fA-F0-9]{64}$/,
                  })}
                />
              </div>
              {formState.errors.custodians?.[index]?.value?.type === 'pattern' && (
                <div className="multisig-form__content-error">
                  {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_VALIDATION_INVALID' })}
                </div>
              )}
            </div>
          ))}

          <div className="multisig-form__form-row">
            <button type="button" className="multisig-form__add-field" onClick={addField}>
              {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_ADD_FIELD_LINK_TEXT' })}
            </button>
          </div>
        </form>
      </Content>

      <Footer>
        <Button form="multisig" type="submit">
          {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
        </Button>
      </Footer>
    </Container>
  );
});
