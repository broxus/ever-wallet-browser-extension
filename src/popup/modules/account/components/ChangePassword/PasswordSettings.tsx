import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { FormattedMessage, useIntl } from 'react-intl'
import { Controller, useForm } from 'react-hook-form'
import { useCallback } from 'react'

import { PWD_MIN_LENGTH } from '@app/shared'
import { Button, Container, Content, Footer, Form, FormControl, Icon, PasswordInput, Switch, Tooltip, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { FormValue, PasswordSettingsViewModel } from './PasswordSettingsViewModel'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'
import styles from './PasswordSettings.module.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
}

export const PasswordSettings = observer(({ keyEntry }: Props): JSX.Element => {
    const vm = useViewModel(PasswordSettingsViewModel, (model) => {
        model.keyEntry = keyEntry
    }, [keyEntry])
    const { register, handleSubmit, formState, setError, control } = useForm<FormValue>()
    const intl = useIntl()

    const submit = useCallback(async (value: FormValue) => {
        try {
            await vm.submit(value)
            vm.notification.show(intl.formatMessage({ id: 'PASSWORD_SETTINGS_SUCCESS_NOTIFICATION' }))
            vm.handle.close()
        }
        catch (e) {
            console.error(e)
            setError('oldPassword', {})
        }
    }, [])

    return (
        <Container>
            <Content>
                <Form id="change-password-form" onSubmit={handleSubmit(submit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'CURRENT_PASSWORD_FIELD' })}
                    >
                        <PasswordInput
                            autoFocus
                            placeholder=""
                            size="xs"
                            invalid={!!formState.errors.oldPassword}
                            autoComplete="current-password"
                            {...register('oldPassword', {
                                validate: (value, { newPassword }) => (newPassword ? !!value : true),
                            })}
                        />
                    </FormControl>

                    <FormControl
                        label={(
                            <FormattedMessage
                                id="NEW_PASSWORD_FIELD"
                                values={{
                                    count: PWD_MIN_LENGTH,
                                    span: (...parts) => parts,
                                }}
                            />
                        )}
                    >
                        <PasswordInput
                            placeholder=""
                            size="xs"
                            invalid={!!formState.errors.newPassword}
                            autoComplete="new-password"
                            {...register('newPassword', {
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
                                    span: (...parts) => parts,
                                }}
                            />
                        )}
                    >
                        <PasswordInput
                            placeholder=""
                            size="xs"
                            invalid={!!formState.errors.newPassword2}
                            autoComplete="new-password"
                            {...register('newPassword2', {
                                validate: (value, { newPassword }) => value === newPassword,
                            })}
                        />
                    </FormControl>

                    <FormControl>
                        <Controller
                            name="cache"
                            control={control}
                            defaultValue={vm.cachePassword}
                            render={({ field }) => (
                                <Switch labelPosition="before" {...field} checked={field.value}>
                                    <div className={styles.switch}>
                                        {intl.formatMessage({ id: 'PASSWORD_SETTINGS_SWITCH_LABEL' })}
                                        &nbsp;
                                        <Icon icon="info" id="cache-tooltip" />
                                    </div>
                                    <Tooltip design="primary" anchorSelect="#cache-tooltip">
                                        {intl.formatMessage({ id: 'PASSWORD_SETTINGS_SWITCH_TOOLTIP' })}
                                    </Tooltip>
                                </Switch>
                            )}
                        />
                    </FormControl>
                </Form>
            </Content>

            <Footer>
                <FooterAction>
                    <Button design="neutral" onClick={vm.handle.close}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button
                        design="accent"
                        type="submit"
                        form="change-password-form"
                        loading={vm.loading}
                    >
                        {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
