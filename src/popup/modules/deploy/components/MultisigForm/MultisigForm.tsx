import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useCallback, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, IconButton, Input, Space, Tabs } from '@app/popup/modules/shared'
import { ContactInput } from '@app/popup/modules/contacts'

import { MultisigData } from '../../store'
import styles from './MultisigForm.module.scss'

interface FormValue {
    custodians: Array<{
        value: string;
    }>;
    reqConfirms: number;
    expirationTime: number;
}

interface Props {
    data?: MultisigData;
    contractType?: nt.ContractType;
    onSubmit(data: MultisigData): void;
}

const pattern = /^[a-fA-F0-9]{64}$/
const hours = [1, 4, 12, 24]

export const MultisigForm = memo(({ data, contractType, onSubmit }: Props): JSX.Element => {
    const intl = useIntl()
    const { register, handleSubmit, formState, control, setValue } = useForm<FormValue>({
        defaultValues: useMemo(() => ({
            custodians: data?.custodians.map(value => ({ value })) ?? [{ value: '' }],
            reqConfirms: data?.reqConfirms ?? 1,
            expirationTime: Number.isInteger(data?.expirationTime) ? data?.expirationTime : 24,
        }), [data]),
    })
    const { fields, append, remove } = useFieldArray({ control, name: 'custodians' })

    const addField = useCallback(() => append({ value: '' }), [append])
    const submit = useCallback((value: FormValue) => {
        onSubmit({
            custodians: value.custodians.map(({ value }) => value),
            reqConfirms: value.reqConfirms,
            expirationTime: value.expirationTime,
        })
    }, [onSubmit])
    const handleExpChange = useCallback((value: number) => {
        setValue('expirationTime', value, { shouldValidate: true })
    }, [setValue])

    return (
        <Container>
            <Content>
                <Form id="multisig" onSubmit={handleSubmit(submit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_CUSTODIAN_CONFIRMATION_LABEL' })}
                        invalid={!!formState.errors.reqConfirms}
                    >
                        <Input
                            autoFocus
                            size="s"
                            className={styles.reqconfirms}
                            placeholder={intl.formatMessage({ id: 'ENTER_NUMBER_PLACEHOLDER' })}
                            suffix={intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_FIELD_COUNT_HINT' }, { count: fields.length })}
                            {...register('reqConfirms', {
                                valueAsNumber: true,
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

                    {contractType === 'Multisig2_1' && fields.length > 1 && (
                        <FormControl
                            label={(
                                <FormattedMessage
                                    id="DEPLOY_MULTISIG_FORM_EXPIRATION_HEADER"
                                    values={{
                                        // eslint-disable-next-line react/no-unstable-nested-components
                                        span: (...parts) => <span className={styles.hint}>{parts}</span>,
                                    }}
                                />
                            )}
                            invalid={!!formState.errors.expirationTime}
                        >
                            <Space direction="row" gap="s">
                                <Input
                                    size="xs"
                                    className={styles.expiration}
                                    suffix={intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_EXPIRATION_PLACEHOLDER' })}
                                    {...register('expirationTime', {
                                        valueAsNumber: true,
                                        required: true,
                                        min: 1,
                                        max: 24,
                                    })}
                                />

                                <Controller
                                    name="expirationTime"
                                    control={control}
                                    rules={{ pattern, required: true }}
                                    render={({ field }) => (
                                        <Tabs
                                            compact
                                            className={styles.tabs}
                                            tab={field.value}
                                            onChange={handleExpChange}
                                        >
                                            {hours.map((value) => (
                                                <Tabs.Tab className={styles.tab} key={value} id={value}>
                                                    {value}h
                                                </Tabs.Tab>
                                            ))}
                                        </Tabs>
                                    )}
                                />
                            </Space>
                        </FormControl>
                    )}

                    <h2 className={styles.custodiansTitle}>
                        {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_LIST_CUSTODIANS_HEADER' })}
                    </h2>

                    {fields.map((field, index) => (
                        <FormControl
                            key={field.id}
                            label={intl.formatMessage(
                                { id: 'DEPLOY_MULTISIG_FORM_CUSTODIAN_FIELD_LABEL' },
                                { index: index + 1 },
                            )}
                            invalid={!!formState.errors.custodians?.[index]?.value}
                        >
                            <Controller
                                name={`custodians.${index}.value` as const}
                                defaultValue=""
                                control={control}
                                rules={{ pattern, required: true }}
                                render={({ field }) => (
                                    <div className={styles.custodian}>
                                        <ContactInput
                                            {...field}
                                            type="public_key"
                                            placeholder={intl.formatMessage({ id: 'ENTER_PUBLIC_KEY_FIELD_PLACEHOLDER' })}
                                        />
                                        {fields.length > 1 && (
                                            <IconButton
                                                size="s"
                                                design="secondary"
                                                className={styles.remove}
                                                icon={Icons.delete}
                                                onClick={() => remove(index)}
                                            />
                                        )}
                                    </div>
                                )}
                            />
                            <ErrorMessage>
                                {formState.errors.custodians?.[index]?.value?.type === 'pattern' && intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_VALIDATION_INVALID' })}
                            </ErrorMessage>
                        </FormControl>
                    ))}

                    <Button
                        design="ghost"
                        size="s"
                        className={styles.add}
                        onClick={addField}
                    >
                        {Icons.plus}
                        {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_ADD_FIELD_LINK_TEXT' })}
                    </Button>
                </Form>
            </Content>

            <Footer>
                <Button form="multisig" type="submit">
                    {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
