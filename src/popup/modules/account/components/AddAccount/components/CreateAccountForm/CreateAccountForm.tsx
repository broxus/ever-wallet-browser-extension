import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { Controller, useForm } from 'react-hook-form'

import {
    Button,
    Card,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Form,
    FormControl,
    Header,
    Icon,
    Input,
    Navbar,
    RadioButton,
    Switch,
    Tooltip,
} from '@app/popup/modules/shared'
import { getContractName, getDefaultWalletContracts, getOtherWalletContracts } from '@app/shared'
import { Alert } from '@app/popup/modules/shared/components/Alert/Alert'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { NetworkType } from '@app/models'

import styles from './CreateAccountForm.module.scss'

interface Props {
    networkType: NetworkType
    availableContracts: nt.ContractType[];
    excludedContracts?: nt.ContractType[];
    defaultAccountName: string;
    error?: string;
    loading?: boolean;
    onSubmit(value: CreateAccountFormValue): void;
}

export interface CreateAccountFormValue {
    name: string;
    contractType: nt.ContractType;
}

export const CreateAccountForm = memo((props: Props): JSX.Element => {
    const {
        availableContracts,
        excludedContracts,
        defaultAccountName,
        error,
        loading,
        networkType,
        onSubmit,
    } = props
    const intl = useIntl()
    const [extended, setExtended] = useState(false)

    const excluded = useMemo(
        () => new Set(excludedContracts),
        [excludedContracts],
    )
    const available = useMemo(
        () => new Set(availableContracts),
        [availableContracts],
    )

    const defaultWalletContracts = getDefaultWalletContracts(networkType)
    const otherWalletContracts = getOtherWalletContracts(networkType)

    const { register, handleSubmit, formState, control } = useForm<CreateAccountFormValue>({
        defaultValues: {
            name: defaultAccountName,
            // eslint-disable-next-line no-nested-ternary
            // contractType: available.has(DEFAULT_WALLET_TYPE)
            //     ? DEFAULT_WALLET_TYPE
            //     : available.has(DEFAULT_MS_WALLET_TYPE)
            //         ? DEFAULT_MS_WALLET_TYPE
            //         : undefined,
        },
    })

    return (
        <Container>
            <Header>
                <Navbar back="..">
                    {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_LABEL' })}
                </Navbar>
            </Header>

            <Content>
                <Form id="create-account-form" onSubmit={handleSubmit(onSubmit)}>
                    <FormControl label={intl.formatMessage({ id: 'ENTER_ACCOUNT_NAME_FIELD_PLACEHOLDER' })}>
                        <Input
                            autoFocus
                            size="xs"
                            type="text"
                            {...register('name')}
                        />
                    </FormControl>

                    <Card bg="layer-1" size="xs" className={styles.card}>
                        {defaultWalletContracts.map(item => (
                            <Controller
                                name="contractType"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <RadioButton<nt.ContractType>
                                        labelPosition="before"
                                        className={styles.item}
                                        disabled={!available.has(item.type)}
                                        checked={item.type === field.value}
                                        value={item.type}
                                        name={field.name}
                                        onChange={field.onChange}
                                    >
                                        <div className={styles.name}>
                                            {getContractName(item.type, networkType)}
                                        </div>
                                        <div className={styles.desc}>
                                            {intl.formatMessage({ id: item.description })}
                                        </div>
                                    </RadioButton>
                                )}
                            />
                        ))}
                    </Card>

                    {defaultWalletContracts.every(item => available.has(item.type)) && (
                        <Alert
                            showIcon={false}
                            type="warning"
                            body={intl.formatMessage({ id: 'CREATE_ACCOUNT_WALLET_TYPE_ALERT' })}
                        />
                    )}

                    <Switch labelPosition="before" checked={extended} onChange={setExtended}>
                        <div className={styles.switch}>
                            {intl.formatMessage({ id: 'CREATE_ACCOUNT_OPEN_ALL' })}
                            <Icon icon="info" id="alert-tooltip" />
                        </div>
                        <Tooltip design="primary" anchorSelect="#alert-tooltip">
                            {intl.formatMessage({ id: 'CREATE_ACCOUNT_WALLET_DEPRECATED_HINT' })}
                        </Tooltip>
                    </Switch>

                    {extended && (
                        <Card bg="layer-1" size="xs" className={styles.card}>
                            {otherWalletContracts.map(({ type, description }) => {
                                if (excluded.has(type)) return null

                                return (
                                    <Controller
                                        name="contractType"
                                        key={type}
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <RadioButton<nt.ContractType>
                                                labelPosition="before"
                                                className={styles.item}
                                                disabled={!available.has(type)}
                                                checked={type === field.value}
                                                value={type}
                                                name={field.name}
                                                onChange={field.onChange}
                                            >
                                                <div className={styles.name}>
                                                    {getContractName(type, networkType)}
                                                </div>
                                                <div className={styles.desc}>
                                                    {intl.formatMessage({ id: description })}
                                                </div>
                                            </RadioButton>
                                        )}
                                    />
                                )
                            })}
                        </Card>
                    )}

                    <ErrorMessage>{error}</ErrorMessage>
                </Form>
            </Content>

            <Footer layer>
                <FooterAction>
                    <Button
                        design="accent"
                        type="submit"
                        form="create-account-form"
                        disabled={!formState.isValid}
                        loading={loading}
                    >
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
