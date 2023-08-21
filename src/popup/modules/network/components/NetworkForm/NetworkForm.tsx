import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useCallback, useMemo } from 'react'

import { Icons } from '@app/popup/icons'
import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Header, Input, Navbar, Select, Switch, useResolve } from '@app/popup/modules/shared'
import type { ConnectionDataItem } from '@app/models'

import { isValidURL } from '../../utils'
import { TokenManifestInput } from './TokenManifestInput'
import { Endpoints } from './Endpoints'
import { NetworkFormValue, NetworkFormViewModel } from './NetworkFormViewModel'
import './NetworkForm.scss'

const options = [
    { label: 'JRPC', value: 'jrpc' },
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
        if (type === 'jrpc') {
            setValue('type', 'jrpc')
            setValue('endpoints', [getValues('endpoints')[0]])
        }
        else {
            setValue('type', 'graphql')
        }
    }, [])

    return (
        <Container className="network-form">
            <Header>
                <Navbar back="/" />
            </Header>
            <Content>
                <h2>
                    {vm.network?.name ?? intl.formatMessage({ id: 'NETWORK_ADD_HEADER' })}
                </h2>

                <FormProvider {...form}>
                    <Form id="network-form" onSubmit={handleSubmit(vm.handleSubmit)}>
                        <FormControl label={intl.formatMessage({ id: 'NETWORK_TYPE' })}>
                            <Select
                                options={options}
                                value={type}
                                onChange={handleTypeChange}
                            />
                        </FormControl>

                        <FormControl
                            label={intl.formatMessage({ id: 'NETWORK_NAME' })}
                            invalid={!!formState.errors.name}
                        >
                            <Input
                                autoFocus
                                type="text"
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
                            invalid={!!formState.errors.config?.symbol}
                        >
                            <Input
                                type="text"
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
                                type="text"
                                inputMode="url"
                                placeholder={intl.formatMessage({ id: 'NETWORK_EXPLORER_URL_PLACEHOLDER' })}
                                {...register('config.explorerBaseUrl', {
                                    required: false,
                                    validate: isValidURL,
                                })}
                            />
                        </FormControl>

                        <FormControl
                            label={intl.formatMessage({ id: 'NETWORK_TOKEN_LIST' })}
                            invalid={!!formState.errors.config?.tokensManifestUrl}
                        >
                            <TokenManifestInput />
                        </FormControl>

                        {vm.network?.custom && vm.network?.connectionId >= 1000 && (
                            <Button design="alert" disabled={vm.loading || !vm.canDelete} onClick={vm.handleDelete}>
                                {Icons.delete}
                                {intl.formatMessage({ id: 'NETWORK_DELETE_BTN_TEXT' })}
                            </Button>
                        )}
                        {vm.network?.custom && vm.network?.connectionId < 1000 && (
                            <Button design="ghost" disabled={vm.loading} onClick={vm.handleReset}>
                                {intl.formatMessage({ id: 'NETWORK_RESET_BTN_TEXT' })}
                            </Button>
                        )}

                        {vm.error && <ErrorMessage>{vm.error}</ErrorMessage>}
                    </Form>
                </FormProvider>
            </Content>

            <Footer>
                <Button type="submit" form="network-form" loading={vm.loading}>
                    {vm.network
                        ? intl.formatMessage({ id: 'NETWORK_EDIT_BTN_TEXT' })
                        : intl.formatMessage({ id: 'NETWORK_ADD_CUSTOM_BTN_TEXT' })}
                </Button>
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
        local: network?.type === 'graphql' ? network.data.local : false,
        name: network?.name ?? '',
        config: network?.config ?? {},
    }
}
