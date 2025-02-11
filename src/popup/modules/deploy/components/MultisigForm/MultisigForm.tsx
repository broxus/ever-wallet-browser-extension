import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useCallback, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { Icons } from '@app/popup/icons'
import {
    Button,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Form,
    FormControl,
    Header,
    Icon,
    IconButton,
    Input,
    Navbar,
    Tabs,
    Tooltip,
} from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

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
        defaultValues: useMemo(
            () => ({
                custodians: data?.custodians.map((value) => ({ value })) ?? [{ value: '' }, { value: '' }, { value: '' }],
                reqConfirms: data?.reqConfirms ?? 3,
                expirationTime: Number.isInteger(data?.expirationTime) ? data?.expirationTime : 24,
            }),
            [data],
        ),
    })
    const { fields, append, remove } = useFieldArray({ control, name: 'custodians' })

    const addField = useCallback(() => append({ value: '' }), [append])
    const submit = useCallback(
        (value: FormValue) => {
            if (value.custodians.length > 1) {
                onSubmit({
                    custodians: value.custodians.map(({ value }) => value),
                    reqConfirms: value.reqConfirms,
                    expirationTime: value.expirationTime,
                })
            }
        },
        [onSubmit],
    )
    const handleExpChange = useCallback(
        (value: number) => {
            setValue('expirationTime', value, { shouldValidate: true })
        },
        [setValue],
    )

    return (
        <>
            <Header>
                <Navbar close="window">
                    {intl.formatMessage({
                        id: 'DEPLOY_MULTISIG_PANEL_HEADER_DETAILS',
                    })}
                </Navbar>
            </Header>
            <Container>
                <Content>
                    <Form id="multisig" onSubmit={handleSubmit(submit, (error) => console.log(error))}>
                        <FormControl
                            label={(
                                <>
                                    <div className={styles.label}>
                                        {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_CUSTODIAN_CONFIRMATION_LABEL' })}
                                        <Icon icon="info" id="custodians-tooltip" />
                                    </div>
                                    <Tooltip design="primary" anchorSelect="#custodians-tooltip">
                                        {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_CUSTODIAN_CONFIRMATION_DESCR' })}
                                    </Tooltip>
                                </>
                            )}
                            invalid={!!formState.errors.reqConfirms}
                        >
                            <Input
                                autoFocus
                                size="xs"
                                type="number"
                                className={styles.reqconfirms}
                                placeholder={intl.formatMessage({ id: 'ENTER_NUMBER_PLACEHOLDER' })}
                                suffix={intl.formatMessage(
                                    { id: 'DEPLOY_MULTISIG_FORM_FIELD_COUNT_HINT' },
                                    { count: fields.length },
                                )}
                                {...register('reqConfirms', {
                                    valueAsNumber: true,
                                    required: true,
                                    min: 1,
                                    max: fields.length,
                                })}
                            />
                            <ErrorMessage>
                                {formState.errors.reqConfirms?.type === 'max'
                                    && intl.formatMessage(
                                        { id: 'DEPLOY_MULTISIG_FORM_VALIDATION_MAX' },
                                        { count: fields.length },
                                    )}
                                {formState.errors.reqConfirms?.type === 'min'
                                    && intl.formatMessage(
                                        { id: 'DEPLOY_MULTISIG_FORM_VALIDATION_MIN' },
                                        { count: 1 },
                                    )}
                                {formState.errors.reqConfirms?.type === 'required'
                                    && intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_VALIDATION_REQUIRED' })}
                            </ErrorMessage>
                        </FormControl>

                        {contractType === 'Multisig2_1' && fields.length > 1 && (
                            <FormControl
                                label={(
                                    <>
                                        <div className={styles.label}>
                                            {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_EXPIRATION_HEADER' })}
                                            <Icon icon="info" id="expiration-tooltip" />
                                        </div>
                                        <Tooltip design="primary" anchorSelect="#expiration-tooltip">
                                            {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_CUSTODIAN_EXPIRATION_DESCR' })}
                                        </Tooltip>
                                    </>
                                )}
                                invalid={!!formState.errors.expirationTime}
                            >
                                <Input
                                    size="xs"
                                    type="number"
                                    className={styles.expiration}
                                    suffix={(
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
                                                        <Tabs.Tab
                                                            className={classNames(styles.tab, {
                                                                [styles.active]: value === field.value,
                                                            })}
                                                            key={value}
                                                            id={value}
                                                        >
                                                            {value} h
                                                        </Tabs.Tab>
                                                    ))}
                                                </Tabs>
                                            )}
                                        />
                                    )}
                                    {...register('expirationTime', {
                                        valueAsNumber: true,
                                        required: true,
                                        min: 1,
                                        max: 24,
                                    })}
                                />
                                <ErrorMessage>
                                    {formState.errors.expirationTime?.type === 'max'
                                        && intl.formatMessage(
                                            { id: 'DEPLOY_MULTISIG_FORM_VALIDATION_EXPIRATION_MAX' },
                                            { count: 24 },
                                        )}
                                    {formState.errors.expirationTime?.type === 'min'
                                        && intl.formatMessage(
                                            { id: 'DEPLOY_MULTISIG_FORM_VALIDATION_EXPIRATION_MIN' },
                                            { count: 1 },
                                        )}
                                    {formState.errors.expirationTime?.type === 'required'
                                        && intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_VALIDATION_EXPIRATION_REQUIRED' })}
                                </ErrorMessage>
                            </FormControl>
                        )}
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
                                            <Input
                                                {...field}
                                                size="xs"
                                                type="public_key"
                                                placeholder={intl.formatMessage({
                                                    id: 'ENTER_PUBLIC_KEY_FIELD_PLACEHOLDER',
                                                })}
                                                suffix={
                                                    fields.length > 2 ? (
                                                        <IconButton
                                                            size="s"
                                                            design="neutral"
                                                            className={styles.remove}
                                                            icon={Icons.delete}
                                                            onClick={() => remove(index)}
                                                        />
                                                    ) : null
                                                }
                                            />
                                        </div>
                                    )}
                                />
                                <ErrorMessage>
                                    {formState.errors.custodians?.[index]?.value?.type === 'pattern'
                                        && intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_VALIDATION_INVALID' })}
                                </ErrorMessage>
                            </FormControl>
                        ))}

                        <Button
                            design="ghost" size="s" className={styles.add}
                            onClick={addField}
                        >
                            {Icons.plus}
                            {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_ADD_FIELD_LINK_TEXT' })}
                        </Button>
                    </Form>
                </Content>

                <Footer layer>
                    <FooterAction>
                        <Button form="multisig" type="submit">
                            {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                        </Button>
                    </FooterAction>
                </Footer>
            </Container>
        </>
    )
})
