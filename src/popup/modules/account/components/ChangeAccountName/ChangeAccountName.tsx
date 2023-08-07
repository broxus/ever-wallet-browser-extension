import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useForm } from 'react-hook-form'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Button, Container, Content, Footer, Form, FormControl, Input, useViewModel } from '@app/popup/modules/shared'

import { ChangeAccountNameViewModel, FormValue } from './ChangeAccountNameViewModel'

interface Props {
    account: nt.AssetsList;
}

export const ChangeAccountName = observer(({ account }: Props): JSX.Element => {
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
            vm.notification.show({
                type: 'success',
                message: (
                    <>
                        {Icons.snackSuccess}
                        {intl.formatMessage({ id: 'CHANGE_ACCOUNT_NAME_SUCCESS_NOTIFICATION' })}
                    </>
                ),
            })
            vm.handle.close()
        }
        catch {
            setError('name', {})
        }
    }, [account])

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'CHANGE_ACCOUNT_NAME_TITLE' })}</h2>
                <Form id="change-name-form" onSubmit={handleSubmit(submit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'CHANGE_ACCOUNT_NAME_INPUT_LABEL' })}
                        invalid={!!formState.errors.name}
                    >
                        <Input
                            autoFocus
                            type="text"
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
