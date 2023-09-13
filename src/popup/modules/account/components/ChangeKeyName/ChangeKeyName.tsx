import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useForm } from 'react-hook-form'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, Form, FormControl, Input, useViewModel } from '@app/popup/modules/shared'

import { ChangeKeyNameViewModel, FormValue } from './ChangeKeyNameViewModel'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    derivedKey?: boolean;
}

export const ChangeKeyName = observer(({ keyEntry, derivedKey }: Props): JSX.Element => {
    const vm = useViewModel(ChangeKeyNameViewModel)
    const intl = useIntl()
    const { register, handleSubmit, setError, formState } = useForm<FormValue>({
        defaultValues: {
            name: derivedKey ? keyEntry.name : (vm.masterKeysNames[keyEntry.masterKey] ?? ''),
        },
    })

    const submit = useCallback(async (value: FormValue) => {
        try {
            if (derivedKey) {
                await vm.updateDerivedKey(keyEntry, value)
                vm.notification.success(intl.formatMessage({ id: 'CHANGE_KEY_NAME_SUCCESS_NOTIFICATION' }))
            }
            else {
                await vm.updateMasterKeyName(keyEntry, value)
                vm.notification.success(intl.formatMessage({ id: 'CHANGE_SEED_NAME_SUCCESS_NOTIFICATION' }))
            }

            vm.handle.close()
        }
        catch {
            setError('name', {})
        }
    }, [keyEntry, derivedKey])

    const header = derivedKey
        ? intl.formatMessage({ id: 'CHANGE_DERIVED_KEY_NAME_TITLE' })
        : intl.formatMessage({ id: 'CHANGE_SEED_NAME_TITLE' })
    const placeholder = derivedKey
        ? intl.formatMessage({ id: 'ENTER_DERIVED_KEY_NAME_FIELD_PLACEHOLDER' })
        : intl.formatMessage({ id: 'ENTER_SEED_FIELD_PLACEHOLDER' })

    return (
        <Container>
            <Content>
                <Form id="change-name-form" onSubmit={handleSubmit(submit)}>
                    <FormControl label={header} invalid={!!formState.errors.name}>
                        <Input
                            autoFocus
                            type="text"
                            placeholder={placeholder}
                            {...register('name', {
                                required: true,
                                minLength: 1,
                                validate: (value) => value.trim().length > 0,
                            })}
                        />
                    </FormControl>
                </Form>
            </Content>

            <Footer>
                <Button type="submit" form="change-name-form">
                    {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
