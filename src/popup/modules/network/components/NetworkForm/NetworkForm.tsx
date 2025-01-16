import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useCallback, useMemo } from 'react'

import { Icons } from '@app/popup/icons'
import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Header, Input, Navbar, RadioButton, Switch, useResolve } from '@app/popup/modules/shared'
import type { ConnectionDataItem } from '@app/models'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { isValidURL } from '../../utils'
import { TokenManifestInput } from './TokenManifestInput'
import { Endpoints } from './Endpoints'
import { NetworkFormValue, NetworkFormViewModel } from './NetworkFormViewModel'
import './NetworkForm.scss'

const options = [
    { label: 'JRPC', value: 'jrpc' },
    { label: 'PROTO', value: 'proto' },
    { label: 'GraphQL', value: 'graphql' },
]

export const NetworkForm = observer((): JSX.Element => {
    const vm = useResolve(NetworkFormViewModel)
    const intl = useIntl()
    const defaultValues = useMemo(() => getDefaultValues(vm.network), [vm.network])
    const form = useForm<NetworkFormValue>({
        defaultValues,
        mode: 'onChange',
    })
    const { handleSubmit, register, control, watch, getValues, setValue, formState } = form
    const type = watch('type')

    const handleTypeChange = useCallback((type: NetworkFormValue['type']) => {
        if (type === 'jrpc' || type === 'proto') {
            setValue('type', type)
            setValue('endpoints', [getValues('endpoints')[0]])
        }
        else {
            setValue('type', 'graphql')
        }
    }, [])

    const loading = formState.isSubmitting || vm.loading

    return (
        <Container className="network-form">
            <Header>
                <Navbar back="/">
                    {vm.network?.name ?? intl.formatMessage({ id: 'NETWORK_ADD_HEADER' })}
                </Navbar>
            </Header>
            <Content>
                <FormProvider {...form}>
                    <Form id="network-form" onSubmit={handleSubmit(vm.handleSubmit)}>
                        <FormControl label={intl.formatMessage({ id: 'NETWORK_TYPE' })}>
                            <div className="network-form__radios">
                                {options.map(option => (
                                    <RadioButton
                                        disabled={vm.network?.group === 'mainnet'}
                                        labelPosition="after"
                                        key={option.value}
                                        value={option.value as NetworkFormValue['type']}
                                        checked={option.value === type}
                                        onChange={handleTypeChange}
                                    >
                                        {option.label}
                                    </RadioButton>
                                ))}
                            </div>
                        </FormControl>

                        <FormControl
                            label={intl.formatMessage({ id: 'NETWORK_NAME' })}
                        >
                            <Input
                                autoFocus
                                size="xs"
                                type="text"
                                invalid={!!formState.errors.name}
                                placeholder={intl.formatMessage({ id: 'NETWORK_NAME_PLACEHOLDER' })}
                                {...register('name', {
                                    required: true,
                                    maxLength: 64,
                                })}
                            />
                        </FormControl>

                        <FormControl
                            label={intl.formatMessage({ id: 'NETWORK_ENDPOINT' })}
                            invalid={!!formState.errors.endpoints}
                        >
                            <Endpoints />
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
                        >
                            <Input
                                size="xs"
                                type="text"
                                invalid={!!formState.errors.config?.symbol}
                                placeholder={intl.formatMessage({ id: 'NETWORK_SYMBOL_PLACEHOLDER' })}
                                {...register('config.symbol', {
                                    required: false,
                                    maxLength: 64,
                                })}
                            />
                        </FormControl>

                        <FormControl
                            label={intl.formatMessage({ id: 'NETWORK_EXPLORER_URL' })}
                        >
                            <Input
                                size="xs"
                                type="text"
                                inputMode="url"
                                invalid={!!formState.errors.config?.explorerBaseUrl}
                                placeholder={intl.formatMessage({ id: 'NETWORK_EXPLORER_URL_PLACEHOLDER' })}
                                {...register('config.explorerBaseUrl', {
                                    required: false,
                                    validate: isValidURL,
                                })}
                            />
                        </FormControl>

                        <FormControl
                            label={intl.formatMessage({ id: 'NETWORK_TOKEN_LIST' })}
                        >
                            <TokenManifestInput />
                        </FormControl>

                        {vm.network?.custom && vm.network?.connectionId >= 1000 && (
                            <FooterAction>
                                <Button design="destructive" disabled={loading || !vm.canDelete} onClick={vm.handleDelete}>
                                    {Icons.delete}
                                    {intl.formatMessage({ id: 'NETWORK_DELETE_BTN_TEXT' })}
                                </Button>
                            </FooterAction>
                        )}

                        {vm.network?.custom && vm.network?.connectionId < 1000 && (
                            <FooterAction>
                                <Button design="neutral" disabled={loading} onClick={vm.handleReset}>
                                    {intl.formatMessage({ id: 'NETWORK_RESET_BTN_TEXT' })}
                                </Button>
                            </FooterAction>
                        )}

                        {vm.error && <ErrorMessage>{vm.error}</ErrorMessage>}
                    </Form>
                </FormProvider>
            </Content>

            <Footer layer>
                <FooterAction>
                    <Button
                        design="accent" type="submit" form="network-form"
                        loading={loading}
                    >
                        {vm.network
                            ? intl.formatMessage({ id: 'NETWORK_EDIT_BTN_TEXT' })
                            : intl.formatMessage({ id: 'NETWORK_ADD_CUSTOM_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})

function getDefaultValues(network?: ConnectionDataItem): NetworkFormValue {
    let endpoints = [{ value: '' }]

    if (network) {
        endpoints = (network.type === 'jrpc' || network.type === 'proto')
            ? [{ value: network.data.endpoint }]
            : network.data.endpoints.map((value) => ({ value }))
    }

    return {
        endpoints,
        type: network?.type ?? 'jrpc',
        local: network?.type === 'graphql' ? network.data.local : false,
        name: network?.name ?? '',
        config: network?.config ?? {},
    }
}
