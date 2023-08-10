import { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import {
    Button,
    Space,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header,
    Hint,
    Input,
} from '@app/popup/modules/shared'

interface Props {
    masterKeyName: string;
    error?: string;
    loading?: boolean;
    onSubmit: (password: string) => void;
    onBack: () => void;
}

interface FormValue {
    password: string;
}

export const EnterPasswordForm = memo(({ masterKeyName, error, loading, onSubmit, onBack }: Props): JSX.Element => {
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
                            <Hint>
                                {intl.formatMessage(
                                    { id: 'SEED_PASSWORD_FIELD_HINT' },
                                    { name: masterKeyName },
                                )}
                            </Hint>
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
                <Space direction="column" gap="s">
                    <Button design="secondary" disabled={loading} onClick={onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button form="enter-password" type="submit" disabled={loading}>
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
