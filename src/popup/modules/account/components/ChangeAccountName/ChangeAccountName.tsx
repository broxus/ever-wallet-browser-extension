import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useForm } from 'react-hook-form'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Input, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

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
            vm.notification.success(intl.formatMessage({ id: 'CHANGE_ACCOUNT_NAME_SUCCESS_NOTIFICATION' }))
            vm.handle.close()
        }
        catch {
            setError('name', {})
        }
    }, [account])

    return (
        <Container>
            <Content>
                <Form id="change-name-form" onSubmit={handleSubmit(submit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'CHANGE_ACCOUNT_NAME_INPUT_LABEL' })}
                        invalid={!!formState.errors.name}
                    >
                        <Input
                            autoFocus
                            size="xs"
                            type="text"
                            {...register('name', {
                                required: true,
                                minLength: 1,
                                maxLength: 64,
                                validate: (value) => value.trim().length > 0,
                            })}
                        />
                        <ErrorMessage>
                            {formState.errors.name?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                            {formState.errors.name?.type === 'maxLength' && intl.formatMessage({ id: 'ERROR_MAX_LENGTH' })}
                        </ErrorMessage>
                    </FormControl>
                </Form>
            </Content>

            <Footer>
                <FooterAction>
                    <Button design="neutral" onClick={vm.handle.close}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button design="accent" type="submit" form="change-name-form">
                        {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
