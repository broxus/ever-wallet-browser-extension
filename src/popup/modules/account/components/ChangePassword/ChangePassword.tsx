import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { FormattedMessage, useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'
import { useCallback } from 'react'

import { PWD_MIN_LENGTH } from '@app/shared'
import { Button, Container, Content, Footer, Form, FormControl, Header, Navbar, PasswordInput, useViewModel } from '@app/popup/modules/shared'

import { ChangePasswordViewModel, FormValue } from './ChangePasswordViewModel'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'
import styles from './ChangePassword.module.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
}

export const ChangePassword = observer(({ keyEntry }: Props): JSX.Element => {
    const vm = useViewModel(ChangePasswordViewModel)
    const { register, handleSubmit, formState, setError, control } = useForm<FormValue>()
    const intl = useIntl()

    const submit = useCallback(async (value: FormValue) => {
        try {
            await vm.submit(keyEntry, value)
            vm.notification.show(intl.formatMessage({ id: 'PWD_CHANGE_SUCCESS_NOTIFICATION' }))
            vm.handle.close()
        }
        catch {
            setError('oldPassword', {})
        }
    }, [keyEntry])

    return (
        <Container>
            <Header>
                <Navbar back={vm.handle.close} />
            </Header>

            <Content>
                <h2>{intl.formatMessage({ id: 'CHANGE_PASSWORD_PANEL_HEADER' })}</h2>
                <Form id="change-password-form" onSubmit={handleSubmit(submit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'CURRENT_PASSWORD_FIELD' })}
                        invalid={!!formState.errors.oldPassword}
                    >
                        <PasswordInput
                            autoFocus
                            autoComplete="current-password"
                            placeholder={intl.formatMessage({ id: 'ENTER_PASSWORD_PLACEHOLDER' })}
                            {...register('oldPassword', {
                                required: true,
                            })}
                        />
                    </FormControl>

                    <FormControl
                        label={(
                            <FormattedMessage
                                id="NEW_PASSWORD_FIELD"
                                values={{
                                    count: PWD_MIN_LENGTH,
                                    span: (...parts) => <span className={styles.hint}>{parts}</span>,
                                }}
                            />
                        )}
                        invalid={!!formState.errors.newPassword}
                    >
                        <PasswordInput
                            autoComplete="new-password"
                            placeholder={intl.formatMessage({ id: 'ENTER_NEW_PASSWORD_PLACEHOLDER' })}
                            {...register('newPassword', {
                                required: true,
                                minLength: PWD_MIN_LENGTH,
                            })}
                        />
                        <PasswordStrengthMeter control={control} />
                    </FormControl>

                    <FormControl
                        label={(
                            <FormattedMessage
                                id="REPEAT_NEW_PASSWORD_FIELD"
                                values={{
                                    count: PWD_MIN_LENGTH,
                                    span: (...parts) => <span className={styles.hint}>{parts}</span>,
                                }}
                            />
                        )}
                        invalid={!!formState.errors.newPassword2}
                    >
                        <PasswordInput
                            autoComplete="new-password"
                            placeholder={intl.formatMessage({ id: 'ENTER_NEW_PASSWORD_PLACEHOLDER' })}
                            {...register('newPassword2', {
                                required: true,
                                validate: (value, { newPassword }) => value === newPassword,
                            })}
                        />
                    </FormControl>
                </Form>
            </Content>

            <Footer>
                <Button
                    design="primary"
                    type="submit"
                    form="change-password-form"
                    loading={vm.loading}
                >
                    {intl.formatMessage({ id: 'CHANGE_PASSWORD_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
