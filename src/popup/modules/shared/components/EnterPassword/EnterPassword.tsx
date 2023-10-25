import type * as nt from '@broxus/ever-wallet-wasm'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button } from '../Button'
import { ErrorMessage } from '../ErrorMessage'
import { PasswordInput } from '../PasswordInput'
import { Container, Content, Footer } from '../layout'
import { Form } from '../Form'
import { FormControl } from '../FormControl'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    loading?: boolean;
    error?: string;
    onSubmit(password: string): void;
}

interface FormValue {
    password: string;
}

export const EnterPassword = observer((props: Props): JSX.Element => {
    const {
        keyEntry,
        loading,
        error,
        onSubmit,
    } = props
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<FormValue>({
        defaultValues: { password: '' },
    })

    const submit = useCallback(({ password }: FormValue) => onSubmit(password), [onSubmit])

    return (
        <Container>
            <Content>
                {keyEntry?.signerName === 'ledger_key' ? (
                    <>
                        <h2>
                            {intl.formatMessage({ id: 'APPROVE_ENTER_PASSWORD_CONFIRM_WITH_LEDGER' })}
                        </h2>
                        <ErrorMessage>{error}</ErrorMessage>
                    </>
                ) : (
                    <>
                        <h2>{intl.formatMessage({ id: 'APPROVE_ENTER_PASSWORD_DRAWER_HEADER' })}</h2>
                        <Form id="password" onSubmit={handleSubmit(submit)}>
                            <FormControl invalid={!!formState.errors.password}>
                                <PasswordInput
                                    autoFocus
                                    {...register('password', {
                                        required: true,
                                    })}
                                />
                                <ErrorMessage>
                                    {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
                                </ErrorMessage>
                            </FormControl>
                            <ErrorMessage>{error}</ErrorMessage>
                        </Form>
                    </>
                )}
            </Content>

            <Footer>
                {keyEntry?.signerName !== 'ledger_key' && (
                    <Button type="submit" form="password" loading={loading}>
                        {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                    </Button>
                )}
                {keyEntry?.signerName === 'ledger_key' && (
                    <Button loading={loading} onClick={handleSubmit(submit)}>
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                )}
            </Footer>
        </Container>
    )
})
