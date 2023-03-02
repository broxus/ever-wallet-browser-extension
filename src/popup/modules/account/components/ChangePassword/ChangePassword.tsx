import type nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'
import { useCallback } from 'react'

import { convertPublicKey, PWD_MIN_LENGTH } from '@app/shared'
import {
    Button,
    Container,
    Content,
    Footer,
    Form,
    FormControl,
    Header,
    Hint,
    Input,
    useViewModel,
} from '@app/popup/modules/shared'

import { ChangePasswordViewModel, FormValue } from './ChangePasswordViewModel'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'

import './ChangePassword.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    onResult(): void;
}

export const ChangePassword = observer(({ keyEntry, onResult }: Props): JSX.Element => {
    const vm = useViewModel(ChangePasswordViewModel)
    const { register, handleSubmit, formState, setError, control } = useForm<FormValue>()
    const intl = useIntl()

    const submit = useCallback(async (value: FormValue) => {
        try {
            await vm.submit(keyEntry, value)
            onResult()
        }
        catch {
            setError('oldPassword', {})
        }
    }, [keyEntry, onResult])

    return (
        <Container className="change-password">
            <Header>
                <h2>{intl.formatMessage({ id: 'CHANGE_PASSWORD_PANEL_HEADER' })}</h2>
            </Header>

            <Content>
                <Form id="change-password-form" onSubmit={handleSubmit(submit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'CURRENT_PASSWORD_FIELD' })}
                        invalid={!!formState.errors.oldPassword}
                    >
                        <Input
                            type="password"
                            size="s"
                            autoComplete="current-password"
                            placeholder={intl.formatMessage({ id: 'ENTER_PASSWORD_PLACEHOLDER' })}
                            {...register('oldPassword', {
                                required: true,
                            })}
                        />
                        <Hint>
                            {intl.formatMessage({ id: 'CURRENT_SEED_HINT' })}
                            &nbsp;-&nbsp;
                            {vm.masterKeysNames[keyEntry.masterKey] ?? convertPublicKey(keyEntry.masterKey)}
                        </Hint>
                    </FormControl>

                    <FormControl
                        className="change-password__new-pwd"
                        label={intl.formatMessage({ id: 'NEW_PASSWORD_FIELD' })}
                        invalid={!!formState.errors.newPassword}
                    >
                        <Input
                            type="password"
                            size="s"
                            autoComplete="new-password"
                            placeholder={intl.formatMessage({ id: 'ENTER_NEW_PASSWORD_PLACEHOLDER' })}
                            {...register('newPassword', {
                                required: true,
                                minLength: PWD_MIN_LENGTH,
                            })}
                        />
                        <div className="change-password__row">
                            <Hint>
                                {intl.formatMessage(
                                    { id: 'PWD_MIN_CHARACTERS' },
                                    { count: PWD_MIN_LENGTH },
                                )}
                            </Hint>
                            <PasswordStrengthMeter control={control} />
                        </div>
                    </FormControl>

                    <FormControl
                        label={intl.formatMessage({ id: 'REPEAT_NEW_PASSWORD_FIELD' })}
                        invalid={!!formState.errors.newPassword2}
                    >
                        <Input
                            type="password"
                            size="s"
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
                    disabled={vm.loading}
                >
                    {intl.formatMessage({ id: 'CHANGE_PASSWORD_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
