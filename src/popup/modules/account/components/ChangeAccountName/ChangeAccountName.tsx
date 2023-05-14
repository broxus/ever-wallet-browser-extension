import type * as nt from '@broxus/ever-wallet-wasm'
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

import { ChangeAccountNameViewModel, FormValue } from './ChangeAccountNameViewModel'

interface Props {
    account: nt.AssetsList;
    onClose(): void;
}

export const ChangeAccountName = observer(({ account, onClose }: Props): JSX.Element => {
    const vm = useViewModel(ChangeAccountNameViewModel)
    const intl = useIntl()
    const { register, handleSubmit, setError, formState } = useForm<FormValue>({
        defaultValues: {
            name: account.name,
        },
    })

    const submit = useCallback(async (value: FormValue) => {
        try {
            await vm.updateAccountName(account, value)
            vm.notification.show(intl.formatMessage({ id: 'CHANGE_ACCOUNT_NAME_SUCCESS_NOTIFICATION' }))

            onClose()
        }
        catch {
            setError('name', {})
        }
    }, [account, onClose])

    return (
        <Container>
            <Header>
                <h2>{intl.formatMessage({ id: 'CHANGE_ACCOUNT_NAME_TITLE' })}</h2>
            </Header>

            <Content>
                <Form id="change-name-form" onSubmit={handleSubmit(submit)}>
                    <FormControl invalid={!!formState.errors.name}>
                        <Input
                            autoFocus
                            type="text"
                            size="s"
                            placeholder={intl.formatMessage({ id: 'ENTER_ACCOUNT_NAME_FIELD_PLACEHOLDER' })}
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
