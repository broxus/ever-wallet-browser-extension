import { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Header, Navbar, PasswordInput } from '@app/popup/modules/shared'

interface Props {
    error?: string;
    loading?: boolean;
    onSubmit: (password: string) => void;
}

interface FormValue {
    password: string;
}

export const EnterPasswordForm = memo(({ error, loading, onSubmit }: Props): JSX.Element => {
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<FormValue>()

    const submit = useCallback(({ password }: FormValue) => onSubmit(password), [onSubmit])

    return (
        <Container>
            <Header>
                <Navbar back="..">
                    {intl.formatMessage({ id: 'PASSWORD_FORM_HEADER' })}
                </Navbar>
            </Header>

            <Content>
                <Form id="enter-password" onSubmit={handleSubmit(submit)}>
                    <FormControl invalid={!!formState.errors.password}>
                        <PasswordInput
                            autoFocus
                            disabled={loading}
                            {...register('password', {
                                required: true,
                            })}
                        />
                        <ErrorMessage>
                            {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
                            {error}
                        </ErrorMessage>
                    </FormControl>
                </Form>
            </Content>

            <Footer>
                <Button form="enter-password" type="submit" loading={loading}>
                    {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
