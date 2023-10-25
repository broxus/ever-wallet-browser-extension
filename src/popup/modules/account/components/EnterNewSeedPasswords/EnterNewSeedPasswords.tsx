import { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Header, Navbar, PasswordInput } from '@app/popup/modules/shared'
import { PWD_MIN_LENGTH } from '@app/shared'

interface Props {
    loading?: boolean;
    error?: string;
    onSubmit(password: string): void;
    onBack(): void;
}

interface FormValue {
    password: string;
    passwordConfirm: string;
}

export const EnterNewSeedPasswords = memo(({ loading, error, onBack, onSubmit }: Props): JSX.Element => {
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<FormValue>()

    const submit = useCallback(({ password }: FormValue) => onSubmit(password), [onSubmit])

    return (
        <Container>
            <Header>
                <Navbar back={onBack}>
                    {intl.formatMessage({ id: 'IMPORT_SEED_PANEL_CONFIRM_HEADER' })}
                </Navbar>
            </Header>

            <Content>
                <Form id="password" onSubmit={handleSubmit(submit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'PASSWORD_FIELD_LABEL' })}
                        invalid={!!formState.errors.password}
                    >
                        <PasswordInput
                            autoFocus
                            autoComplete="new-password"
                            {...register('password', {
                                required: true,
                                minLength: PWD_MIN_LENGTH,
                            })}
                        />
                        <ErrorMessage>
                            {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED' })}
                        </ErrorMessage>
                    </FormControl>
                    <FormControl
                        label={intl.formatMessage({ id: 'PASSWORD_CONFIRM_FIELD_PLACEHOLDER' })}
                        invalid={!!formState.errors.passwordConfirm}
                    >
                        <PasswordInput
                            autoComplete="new-password"
                            {...register('passwordConfirm', {
                                required: true,
                                validate: (value, { password }) => value === password,
                            })}
                        />
                        <ErrorMessage>
                            {formState.errors.passwordConfirm && intl.formatMessage({ id: 'ERROR_PASSWORD_DOES_NOT_MATCH' })}
                        </ErrorMessage>
                    </FormControl>
                    <ErrorMessage>{error}</ErrorMessage>
                </Form>
            </Content>

            <Footer>
                <Button form="password" type="submit" loading={loading}>
                    {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
