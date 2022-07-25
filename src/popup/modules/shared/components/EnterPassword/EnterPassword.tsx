import type nt from '@wallet/nekoton-wasm'
import React, { memo, useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Button, ButtonGroup } from '../Button'
import { ErrorMessage } from '../ErrorMessage'
import { Input } from '../Input'
import { Container, Content, Footer } from '../layout'
import { Switch } from '../Switch'

import './EnterPassword.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    disabled?: boolean;
    error?: string;

    onSubmit(password: string, cache: boolean): void;

    onBack(): void;
}

interface FormValue {
    password: string;
    cache: boolean;
}

export const EnterPassword = memo((props: Props): JSX.Element => {
    const {
        keyEntry,
        disabled,
        error,
        onSubmit,
        onBack,
    } = props

    const intl = useIntl()
    const { register, handleSubmit, formState, control } = useForm<FormValue>({
        defaultValues: { password: '', cache: false },
    })

    const submit = useCallback(({ password, cache }: FormValue) => onSubmit(password, cache), [onSubmit])

    return (
        <Container className="enter-password">
            <Content>
                {keyEntry?.signerName === 'ledger_key' ? (
                    <div className="enter-password__form">
                        <div className="enter-password__form-ledger">
                            {intl.formatMessage({ id: 'APPROVE_ENTER_PASSWORD_DRAWER_CONFIRM_WITH_LEDGER' })}
                        </div>
                        <ErrorMessage>{error}</ErrorMessage>
                    </div>
                ) : (
                    <div className="enter-password__form">
                        <h2 className="enter-password__form-title">
                            {intl.formatMessage({ id: 'APPROVE_ENTER_PASSWORD_DRAWER_HEADER' })}
                        </h2>
                        <form id="password" onSubmit={handleSubmit(submit)}>
                            <Input
                                type="password"
                                autoFocus
                                disabled={disabled}
                                placeholder={intl.formatMessage({
                                    id: 'APPROVE_ENTER_PASSWORD_DRAWER_PASSWORD_FIELD_PLACEHOLDER',
                                })}
                                {...register('password', {
                                    required: true,
                                    minLength: 6,
                                })}
                            />
                            <ErrorMessage>
                                {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
                            </ErrorMessage>
                            <ErrorMessage>{error}</ErrorMessage>

                            <div className="enter-password__form-switch">
                                <Controller
                                    name="cache"
                                    control={control}
                                    render={({ field }) => (
                                        <Switch {...field} checked={field.value}>
                                            {intl.formatMessage({ id: 'APPROVE_PASSWORD_CACHE_SWITCHER_LABEL' })}
                                        </Switch>
                                    )}
                                />
                            </div>
                        </form>
                    </div>
                )}
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button
                        group="small" design="secondary" disabled={disabled}
                        onClick={() => onBack()}
                    >
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    {keyEntry?.signerName !== 'ledger_key' && (
                        <Button type="submit" form="password" disabled={disabled}>
                            {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                        </Button>
                    )}
                    {keyEntry?.signerName === 'ledger_key' && (
                        <Button disabled={disabled} onClick={handleSubmit(submit)}>
                            {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                        </Button>
                    )}
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
