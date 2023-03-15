import type nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useForm } from 'react-hook-form'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'

import {
    Button,
    Container,
    Content,
    Footer,
    Form,
    FormControl,
    Header,
    Input,
    useViewModel,
} from '@app/popup/modules/shared'

import { ChangeNameViewModel, FormValue } from './ChangeNameViewModel'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    onClose(): void;
}

export const ChangeName = observer(({ keyEntry, onClose }: Props): JSX.Element => {
    const vm = useViewModel(ChangeNameViewModel)
    const intl = useIntl()
    const { register, handleSubmit, setError, formState } = useForm<FormValue>({
        defaultValues: {
            name: vm.masterKeysNames[keyEntry.masterKey] ?? '',
        },
    })

    const submit = useCallback(async (value: FormValue) => {
        try {
            await vm.submit(keyEntry, value)
            vm.notification.show(intl.formatMessage({ id: 'CHANGE_SEED_NAME_SUCCESS_NOTIFICATION' }))
            onClose()
        }
        catch {
            setError('name', {})
        }
    }, [keyEntry, onClose])

    return (
        <Container className="change-name">
            <Header>
                <h2>{intl.formatMessage({ id: 'CHANGE_SEED_NAME_TITLE' })}</h2>
            </Header>

            <Content>
                <Form id="change-name-form" onSubmit={handleSubmit(submit)}>
                    <FormControl invalid={!!formState.errors.name}>
                        <Input
                            autoFocus
                            type="text"
                            size="s"
                            placeholder={intl.formatMessage({ id: 'ENTER_SEED_FIELD_PLACEHOLDER' })}
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
                <Button type="submit" form="change-name-form" disabled={vm.loading}>
                    {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
