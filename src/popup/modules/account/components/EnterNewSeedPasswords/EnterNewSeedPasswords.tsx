import { memo, useCallback } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Header, Hint, Icon, Navbar, PasswordInput, Space, Switch, Tooltip } from '@app/popup/modules/shared'
import { PWD_MIN_LENGTH } from '@app/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import classNames from 'classnames'
import s from './EnterNewPassword.module.scss'

interface Props {
    loading?: boolean;
    error?: string;
    onSubmit(password: string, cache: boolean): void;
    onBack(): void;
}

interface FormValue {
    password: string;
    passwordConfirm: string;
    cache: boolean;
}

type HintState = 'password' | 'confirm' | 'success'

export const EnterNewSeedPasswords = memo(({ loading, error, onBack, onSubmit }: Props) => {
    const intl = useIntl()
    const { register, handleSubmit, formState, control } = useForm<FormValue>({
        mode: 'onChange',
    })

    const submit = useCallback(({ password, cache }: FormValue) => onSubmit(password, cache), [onSubmit])

    const [password, passwordConfirmValue] = useWatch({ name: ['password', 'passwordConfirm'], control })

    const getHintState = (): HintState => {
        if (formState.errors.password || !password?.length) {
            return 'password'
        }

        if (formState.errors.passwordConfirm || !passwordConfirmValue?.length) {
            return 'confirm'
        }

        return 'success'
    }

    const hintState = getHintState()

    return (
        <Container>
            <Header>
                <Navbar back={onBack}>{intl.formatMessage({ id: 'CREATE_PASSWORD' })}</Navbar>
            </Header>

            <Content>
                <Space gap="l" direction="column">
                    <Space direction="column" gap="s">
                        <p className={s.text}>{intl.formatMessage({ id: 'CREATE_PASSWORD_SUBTITLE_1' })}</p>
                        <p className={s.text}>{intl.formatMessage({ id: 'CREATE_PASSWORD_SUBTITLE_2' })}</p>
                    </Space>
                    <Form id="password" onSubmit={handleSubmit(submit)}>
                        <FormControl>
                            <PasswordInput
                                autoFocus
                                size="xs"
                                placeholder={intl.formatMessage({ id: 'PASSWORD_FIELD_LABEL' })}
                                autoComplete="new-password"
                                {...register('password', {
                                    required: true,
                                    minLength: PWD_MIN_LENGTH,
                                    validate: (value) => value.trim().length > 0,
                                })}
                            />
                        </FormControl>
                        <FormControl>
                            <PasswordInput
                                size="xs"
                                placeholder={intl.formatMessage({ id: 'PASSWORD_CONFIRM_FIELD_PLACEHOLDER' })}
                                autoComplete="new-password"
                                {...register('passwordConfirm', {
                                    required: true,
                                    validate: (value, { password }) => value === password,
                                })}
                            />
                        </FormControl>
                        <FormControl>
                            <Controller
                                name="cache"
                                control={control}
                                defaultValue={false}
                                render={({ field }) => (
                                    <Switch labelPosition="before" {...field} checked={field.value}>
                                        <div className={s.switch}>
                                            {intl.formatMessage({ id: 'PASSWORD_SETTINGS_SWITCH_LABEL' })}
                                                                                        &nbsp;
                                            <Icon icon="info" id="cache-tooltip" />
                                        </div>
                                        <Tooltip design="primary" anchorSelect="#cache-tooltip">
                                            {intl.formatMessage({ id: 'ONBOARDING_PASSWORD_SETTINGS_SWITCH_TOOLTIP' })}
                                        </Tooltip>
                                    </Switch>
                                )}
                            />
                        </FormControl>
                        <ErrorMessage>{error}</ErrorMessage>
                    </Form>
                    {hintState === 'password' && (
                        <Space direction="column" gap="s">
                            <span className={s.hint}>
                                <Icon icon="passwordMatch" />
                                {intl.formatMessage({ id: 'PWD_MSG_START' })}
                            </span>
                            <Hint>{intl.formatMessage({ id: 'PWD_MSG_MIN_LENGTH' }, { length: PWD_MIN_LENGTH })}</Hint>
                        </Space>
                    )}

                    {hintState === 'confirm' && (
                        <Space direction="column" gap="s">
                            <span className={s.hint}>
                                <Icon icon="passwordMatchError" />
                                {intl.formatMessage({ id: 'PWD_MSG_SECOND_START' })}
                            </span>
                            <Hint>{intl.formatMessage({ id: 'PWD_MSG_SECOND_START_DESCRIPTION' })}</Hint>
                        </Space>
                    )}

                    {hintState === 'success' && (
                        <Space direction="column" gap="s">
                            <span className={classNames(s.hint, s.hint__success)}>
                                <Icon icon="passwordMatchSuccess" />
                                {intl.formatMessage({ id: 'PWD_MSG_CONFIRM' })}
                            </span>
                            <Hint>{intl.formatMessage({ id: 'PWD_MSG_CONFIRM_DESCRIPTION' })}</Hint>
                        </Space>
                    )}
                </Space>
            </Content>

            <Footer layer>
                <FooterAction>
                    <Button design="accent" form="password" type="submit" loading={loading}>
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
