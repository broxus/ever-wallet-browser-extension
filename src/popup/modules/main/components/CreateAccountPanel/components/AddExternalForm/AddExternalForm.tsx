import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Controller, useForm } from 'react-hook-form'
import { useCallback, useMemo } from 'react'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Input, NekotonToken, Select, Space, useResolve } from '@app/popup/modules/shared'
import { ContactInput } from '@app/popup/modules/contacts'
import { isNativeAddress } from '@app/shared'

interface Props {
    name: string;
    loading: boolean;
    error?: string;
    keyEntry: nt.KeyStoreEntry;
    keyEntries: nt.KeyStoreEntry[];
    onChangeDerivedKey(derivedKey: nt.KeyStoreEntry): void;
    onSubmit(value: AddExternalFormValue): void;
    onBack(): void;
}

export interface AddExternalFormValue {
    name: string;
    address: string;
}

export const AddExternalForm = observer((props: Props): JSX.Element => {
    const { name, loading, error, keyEntry, keyEntries, onChangeDerivedKey, onSubmit, onBack } = props
    const nekoton = useResolve(NekotonToken)
    const intl = useIntl()
    const { register, handleSubmit, formState, control } = useForm<AddExternalFormValue>({
        defaultValues: { name, address: '' },
    })

    const derivedKeysOptions = useMemo(
        () => keyEntries.map(key => ({ label: key.name, value: key.publicKey })),
        [keyEntries],
    )

    const handleChangeDerivedKey = useCallback((value: string) => {
        const derivedKey = keyEntries.find(({ publicKey }) => publicKey === value)

        if (derivedKey) {
            onChangeDerivedKey(derivedKey)
        }
    }, [keyEntries, onChangeDerivedKey])

    const validateAddress = (value: string) => !!value && (nekoton.checkAddress(value) || !isNativeAddress(value))

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_ADD_EXTERNAL_LABEL' })}</h2>

                <Form id="add-external-form" onSubmit={handleSubmit(onSubmit)}>
                    {derivedKeysOptions.length > 1 && (
                        <Select
                            options={derivedKeysOptions}
                            value={keyEntry?.publicKey}
                            onChange={handleChangeDerivedKey}
                        />
                    )}

                    <FormControl
                        label={intl.formatMessage({ id: 'ENTER_ACCOUNT_NAME_FIELD_PLACEHOLDER' })}
                        invalid={!!formState.errors.name}
                    >
                        <Input
                            autoFocus
                            type="text"
                            {...register('name', {
                                required: true,
                                minLength: 1,
                                validate: (value) => value.trim().length > 0,
                            })}
                        />
                    </FormControl>
                    <FormControl
                        label={intl.formatMessage({ id: 'ENTER_MULTISIG_ADDRESS_FIELD_PLACEHOLDER' })}
                        invalid={!!formState.errors.address || !!error}
                    >
                        <Controller
                            name="address"
                            control={control}
                            rules={{
                                required: true,
                                validate: validateAddress,
                            }}
                            render={({ field }) => (
                                <ContactInput {...field} type="address" />
                            )}
                        />
                    </FormControl>
                    <ErrorMessage>{error}</ErrorMessage>
                </Form>
            </Content>

            <Footer>
                <Space direction="row" gap="s">
                    <Button design="secondary" onClick={onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button type="submit" form="add-external-form" loading={loading}>
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
