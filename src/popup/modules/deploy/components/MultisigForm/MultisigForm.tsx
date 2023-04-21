import { memo, useCallback, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import {
    Button,
    ButtonGroup,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Form,
    FormControl,
    Input,
} from '@app/popup/modules/shared'
import { ContactInput } from '@app/popup/modules/contacts'
import PlusIcon from '@app/popup/assets/icons/plus.svg'

import './MultisigForm.scss'

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
    onSubmit(data: MultisigData): void;
    onBack(): void;
}

const pattern = /^[a-fA-F0-9]{64}$/

export const MultisigForm = memo(({ data, onSubmit, onBack }: Props): JSX.Element => {
    const intl = useIntl()
    const { register, handleSubmit, formState, control } = useForm<FormValue>({
        defaultValues: useMemo(() => ({
            custodians: data?.custodians.map(value => ({ value })) ?? [{ value: '' }],
            reqConfirms: data?.reqConfirms ?? 1,
        }), [data]),
    })
    const { fields, append, remove } = useFieldArray({ control, name: 'custodians' })

    const addField = useCallback(() => append({ value: '' }), [append])
    const submit = useCallback((value: FormValue) => {
        onSubmit({
            custodians: value.custodians.map(({ value }) => value),
            reqConfirms: value.reqConfirms,
        })
    }, [onSubmit])

    return (
        <Container className="multisig-form">
            <Content>
                <Form id="multisig" onSubmit={handleSubmit(submit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_CONTENT_HEADER' })}
                        invalid={!!formState.errors.reqConfirms}
                    >
                        <Input
                            autoFocus
                            size="s"
                            placeholder={intl.formatMessage({ id: 'ENTER_NUMBER_PLACEHOLDER' })}
                            suffix={intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_FIELD_COUNT_HINT' }, { count: fields.length })}
                            {...register('reqConfirms', {
                                required: true,
                                min: 1,
                                max: fields.length,
                            })}
                        />
                        <ErrorMessage>
                            {formState.errors.reqConfirms?.type === 'max' && intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_VALIDATION_MAX' }, { count: fields.length })}
                            {formState.errors.reqConfirms?.type === 'required' && intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_VALIDATION_REQUIRED' })}
                        </ErrorMessage>
                    </FormControl>

                    <div className="multisig-form__content-header">
                        {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_LIST_CUSTODIANS_HEADER' })}
                    </div>

                    {fields.map((field, index) => (
                        <FormControl
                            key={field.id}
                            label={(
                                <div className="multisig-form__control-label">
                                    {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_CUSTODIAN_FIELD_LABEL' }, { index: index + 1 })}
                                    {fields.length > 1 && (
                                        <button type="button" className="multisig-form__delete" onClick={() => remove(index)}>
                                            {intl.formatMessage({ id: 'DEPLOY_MULTISIG_DELETE_CUSTODIAN_BTN_TEXT' })}
                                        </button>
                                    )}
                                </div>
                            )}
                            invalid={!!formState.errors.custodians?.[index]?.value}
                        >
                            <Controller
                                name={`custodians.${index}.value` as const}
                                defaultValue=""
                                control={control}
                                rules={{ pattern, required: true }}
                                render={({ field }) => (
                                    <ContactInput
                                        {...field}
                                        size="s"
                                        type="public_key"
                                        placeholder={intl.formatMessage({ id: 'ENTER_PUBLIC_KEY_FIELD_PLACEHOLDER' })}
                                    />
                                )}
                            />
                            <ErrorMessage>
                                {formState.errors.custodians?.[index]?.value?.type === 'pattern' && intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_VALIDATION_INVALID' })}
                            </ErrorMessage>
                        </FormControl>
                    ))}

                    <button type="button" className="multisig-form__add-btn" onClick={addField}>
                        <PlusIcon />
                        {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_ADD_FIELD_LINK_TEXT' })}
                    </button>
                </Form>
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button group="small" design="secondary" onClick={onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button form="multisig" type="submit">
                        {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
