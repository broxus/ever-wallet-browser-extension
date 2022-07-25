import React, { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import {
    Button,
    ButtonGroup,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header,
    Input,
} from '@app/popup/modules/shared'

interface Props {
    error?: string;
    loading?: boolean;
    onSubmit: (password: string) => void;
    onBack: () => void;
}

interface FormValue {
    password: string;
}

export const EnterPasswordForm = memo(({ error, loading, onSubmit, onBack }: Props): JSX.Element => {
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<FormValue>()

    const submit = useCallback(({ password }: FormValue) => onSubmit(password), [onSubmit])

    return (
        <Container className="accounts-management">
            <Header>
                <h2>{intl.formatMessage({ id: 'CREATE_DERIVED_KEY_PANEL_HEADER' })}</h2>
            </Header>

            <Content>
                <form id="enter-password" onSubmit={handleSubmit(submit)}>
                    <div className="accounts-management__content-form-rows">
                        <div className="accounts-management__content-form-row">
                            <Input
                                autoFocus
                                type="password"
                                disabled={loading}
                                placeholder={intl.formatMessage({ id: 'ENTER_SEED_PASSWORD_FIELD_PLACEHOLDER' })}
                                {...register('password', {
                                    required: true,
                                    minLength: 6,
                                })}
                            />

                            <ErrorMessage>
                                {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
                            </ErrorMessage>
                            <ErrorMessage>
                                {error}
                            </ErrorMessage>
                        </div>
                    </div>
                </form>
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button
                        group="small" design="secondary" disabled={loading}
                        onClick={onBack}
                    >
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button form="enter-password" type="submit" disabled={loading}>
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
