import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button, Card, Container, Content, ErrorMessage, Footer, Form, FormControl, Icon, PasswordInput } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import styles from './index.module.scss'

interface Props {
    seed?: string;
    error?: string;
    loading?: boolean;
    onSubmit(password: string): void;
    onBack(): void;
}

interface FormValue {
    password: string;
}

export const PasswordForm = observer((props: Props): JSX.Element => {
    const { loading, error, seed, onSubmit, onBack } = props
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<FormValue>({
        defaultValues: { password: '' },
    })

    const submit = useCallback(({ password }: FormValue) => onSubmit(password), [onSubmit])

    return (
        <Container>
            <Content className={styles.content}>
                <Card className={styles.seed} size="xs">
                    <Icon icon="lock" width={20} height={20} />
                    {seed}
                </Card>

                <Form id="password" onSubmit={handleSubmit(submit)}>
                    <FormControl invalid={!!formState.errors.password}>
                        <PasswordInput
                            autoFocus
                            size="xs"
                            {...register('password', {
                                required: true,
                            })}
                        />
                        <ErrorMessage>
                            {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
                        </ErrorMessage>
                        <ErrorMessage>{error}</ErrorMessage>
                    </FormControl>
                </Form>
            </Content>

            <Footer>
                <FooterAction
                    buttons={[
                        <Button key="back" design="neutral" onClick={onBack}>
                            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                        </Button>,
                        <Button
                            key="submit" design="accent" loading={loading}
                            onClick={handleSubmit(submit)}
                        >
                            {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
})
