import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { FormattedMessage, useIntl } from 'react-intl'
import { Controller, useForm } from 'react-hook-form'
import { CSSProperties, useCallback } from 'react'

import { PWD_MIN_LENGTH } from '@app/shared'
import { Button, Container, Content, Footer, Form, FormControl, Icon, PasswordInput, Switch, Tooltip, useViewModel } from '@app/popup/modules/shared'

import { FormValue, PasswordSettingsViewModel } from './PasswordSettingsViewModel'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'
import styles from './PasswordSettings.module.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
}

const tooltipStyle: CSSProperties = {
    width: 244,
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
        catch {
            setError('oldPassword', {})
        }
    }, [])

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'PASSWORD_SETTINGS_PANEL_HEADER' })}</h2>
                <Form id="change-password-form" onSubmit={handleSubmit(submit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'CURRENT_PASSWORD_FIELD' })}
                        invalid={!!formState.errors.oldPassword}
                    >
                        <PasswordInput
                            autoFocus
                            placeholder=""
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
                                    span: (...parts) => <span className={styles.hint}>{parts}</span>,
                                }}
                            />
                        )}
                        invalid={!!formState.errors.newPassword}
                    >
                        <PasswordInput
                            placeholder=""
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
                                    span: (...parts) => <span className={styles.hint}>{parts}</span>,
                                }}
                            />
                        )}
                        invalid={!!formState.errors.newPassword2}
                    >
                        <PasswordInput
                            placeholder=""
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
                                        <Icon icon="info" id="cache-tooltip" />
                                    </div>
                                    <Tooltip design="primary" anchorSelect="#cache-tooltip" style={tooltipStyle}>
                                        {intl.formatMessage({ id: 'PASSWORD_SETTINGS_SWITCH_TOOLTIP' })}
                                    </Tooltip>
                                </Switch>
                            )}
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
                    {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
