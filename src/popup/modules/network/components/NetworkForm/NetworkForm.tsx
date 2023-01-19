import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useCallback, useMemo, useState } from 'react'

import {
    Button,
    ButtonGroup,
    Container,
    Content,
    Footer,
    Header,
    Input,
    RadioButton,
    Switch,
} from '@app/popup/modules/shared'
import type { ConnectionDataItem } from '@app/models'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'

import './NetworkForm.scss'
import { FormControl } from './FormControl'
import { TokenManifestInput } from './TokenManifestInput'
import { NetworkFormValue } from './NetworkFormValue'
import { Endpoints } from './Endpoints'

interface Props {
    network: ConnectionDataItem | undefined;
    onSubmit(value: NetworkFormValue): Promise<void>;
    onReset(): Promise<void>;
    onDelete(): Promise<void>;
    onCancel(): void;
}

const URL_PATTERN = /^https?:\/\/.*$/
const NUMBER_PATTERN = /^\d+$/

export const NetworkForm = observer(({ network, onSubmit, onDelete, onReset, onCancel }: Props): JSX.Element => {
    const [loading, setLoading] = useState(false)
    const intl = useIntl()
    const defaultValues = useMemo(() => getDefaultValues(network), [network])
    const form = useForm<NetworkFormValue>({
        defaultValues,
        mode: 'onChange',
    })
    const { handleSubmit, register, control, watch, getValues, setValue, formState } = form
    const type = watch('type')

    const handleTypeChange = useCallback((type: NetworkFormValue['type']) => {
        if (type === 'jrpc') {
            setValue('type', 'jrpc')
            setValue('endpoints', [getValues('endpoints')[0]])
        }
        else {
            setValue('type', 'graphql')
        }
    }, [])

    const submit = useCallback((value: NetworkFormValue) => {
        setLoading(true)
        onSubmit(value).finally(() => setLoading(false))
    }, [onSubmit])

    const handleDelete = useCallback(() => {
        setLoading(true)
        onDelete().finally(() => setLoading(false))
    }, [onDelete])

    const handleReset = useCallback(() => {
        setLoading(true)
        onReset().finally(() => setLoading(false))
    }, [onReset])

    return (
        <Container className="network-form">
            <Header>
                <h2>
                    {network ? network.name : intl.formatMessage({ id: 'NETWORK_ADD_HEADER' })}
                </h2>
            </Header>

            <Content>
                <FormProvider {...form}>
                    <form id="network-form" className="network-form__form" onSubmit={handleSubmit(submit)}>
                        <FormControl label={intl.formatMessage({ id: 'NETWORK_TYPE' })}>
                            <RadioButton<NetworkFormValue['type']>
                                className="form-control__radio"
                                id="type-jrpc"
                                value="jrpc"
                                checked={type === 'jrpc'}
                                onChange={handleTypeChange}
                            >
                                ADNL
                            </RadioButton>
                            <hr className="form-control__hr" />
                            <RadioButton<NetworkFormValue['type']>
                                className="form-control__radio"
                                id="type-graphql"
                                value="graphql"
                                checked={type === 'graphql'}
                                onChange={handleTypeChange}
                            >
                                GraphQL
                            </RadioButton>
                        </FormControl>

                        <FormControl
                            label={intl.formatMessage({ id: 'NETWORK_NAME' })}
                            invalid={!!formState.errors.name}
                        >
                            <Input
                                autoFocus
                                type="text"
                                size="s"
                                placeholder={intl.formatMessage({ id: 'NETWORK_NAME_PLACEHOLDER' })}
                                {...register('name', {
                                    required: true,
                                    maxLength: 256,
                                })}
                            />
                        </FormControl>

                        <FormControl
                            label={intl.formatMessage({ id: 'NETWORK_ENDPOINT' })}
                            invalid={!!formState.errors.endpoints}
                        >
                            <Endpoints />
                        </FormControl>

                        <FormControl
                            label={intl.formatMessage({ id: 'NETWORK_CHAIN_ID' })}
                            invalid={!!formState.errors.networkId}
                        >
                            <Input
                                type="text"
                                inputMode="numeric"
                                size="s"
                                placeholder={intl.formatMessage({ id: 'NETWORK_CHAIN_ID_PLACEHOLDER' })}
                                {...register('networkId', {
                                    required: true,
                                    pattern: NUMBER_PATTERN,
                                })}
                            />
                        </FormControl>

                        {type === 'graphql' && (
                            <Controller
                                name="local"
                                control={control}
                                render={({ field }) => (
                                    <Switch labelPosition="before" {...field} checked={field.value}>
                                        {intl.formatMessage({ id: 'NETWORK_LOCAL_MODE' })}
                                    </Switch>
                                )}
                            />
                        )}

                        <FormControl
                            label={intl.formatMessage({ id: 'NETWORK_SYMBOL' })}
                            invalid={!!formState.errors.config?.symbol}
                        >
                            <Input
                                type="text"
                                size="s"
                                placeholder={intl.formatMessage({ id: 'NETWORK_SYMBOL_PLACEHOLDER' })}
                                {...register('config.symbol', {
                                    required: false,
                                    maxLength: 64,
                                })}
                            />
                        </FormControl>

                        <FormControl
                            label={intl.formatMessage({ id: 'NETWORK_EXPLORER_URL' })}
                            invalid={!!formState.errors.config?.explorerBaseUrl}
                        >
                            <Input
                                type="url"
                                inputMode="url"
                                size="s"
                                placeholder={intl.formatMessage({ id: 'NETWORK_EXPLORER_URL_PLACEHOLDER' })}
                                {...register('config.explorerBaseUrl', {
                                    required: false,
                                    pattern: URL_PATTERN,
                                })}
                            />
                        </FormControl>

                        <FormControl
                            label={intl.formatMessage({ id: 'NETWORK_TOKEN_LIST' })}
                            invalid={!!formState.errors.config?.tokensManifestUrl}
                        >
                            <TokenManifestInput />
                        </FormControl>

                        {network?.custom && network?.connectionId >= 1000 && (
                            <button
                                type="button"
                                className="network-form__btn _delete"
                                disabled={loading}
                                onClick={handleDelete}
                            >
                                <DeleteIcon />
                                {intl.formatMessage({ id: 'NETWORK_DELETE_BTN_TEXT' })}
                            </button>
                        )}
                        {network?.custom && network?.connectionId < 1000 && (
                            <button
                                type="button"
                                className="network-form__btn _reset"
                                disabled={loading}
                                onClick={handleReset}
                            >
                                {intl.formatMessage({ id: 'NETWORK_RESET_BTN_TEXT' })}
                            </button>
                        )}

                    </form>
                </FormProvider>
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button
                        design="secondary"
                        group="small"
                        disabled={loading}
                        onClick={onCancel}
                    >
                        {intl.formatMessage({ id: 'CANCEL_BTN_TEXT' })}
                    </Button>
                    <Button
                        design="primary"
                        type="submit"
                        form="network-form"
                        disabled={loading}
                    >
                        {network
                            ? intl.formatMessage({ id: 'NETWORK_EDIT_BTN_TEXT' })
                            : intl.formatMessage({ id: 'NETWORK_ADD_CUSTOM_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})

function getDefaultValues(network?: ConnectionDataItem): NetworkFormValue {
    let endpoints = [{ value: '' }]

    if (network) {
        endpoints = network.type === 'jrpc'
            ? [{ value: network.data.endpoint }]
            : network.data.endpoints.map((value) => ({ value }))
    }

    return {
        endpoints,
        type: network?.type ?? 'jrpc',
        networkId: network?.networkId.toString() ?? '1',
        local: network?.type === 'graphql' ? network.data.local : false,
        name: network?.name ?? '',
        config: network?.config ?? {},
    }
}
