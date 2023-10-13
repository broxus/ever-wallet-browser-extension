/* eslint-disable */
import type * as nt from '@broxus/ever-wallet-wasm'
import { ForwardedRef, forwardRef, useCallback, useImperativeHandle, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { convertPublicKey } from '@app/shared'

import { usePasswordCache, useResolve } from '../../hooks'
import { AccountabilityStore } from '../../store'
import { ErrorMessage } from '../ErrorMessage'
import { Form } from '../Form'
import { FormControl } from '../FormControl'
import { Select } from '../Select'
import { PasswordInput } from '../PasswordInput'
import { Hint } from '../Hint'
import { Switch } from '../Switch'

interface Props {
    id?: string;
    className?: string;
    keyEntry: nt.KeyStoreEntry;
    keyEntries?: nt.KeyStoreEntry[];
    error?: string;
    allowCache?: boolean;
    onSubmit(password?: string, cache?: boolean): void;
    onChangeKeyEntry?(keyEntry: nt.KeyStoreEntry): void;
}

interface FormValue {
    password: string;
    cache: boolean;
}

export interface PasswordFormRef {
    submit(): void;
}

function PasswordFormInner(props: Props, ref: ForwardedRef<PasswordFormRef>): JSX.Element | null {
    const {
        id = 'password-form',
        allowCache = true,
        className,
        keyEntry,
        keyEntries,
        error,
        onSubmit,
        onChangeKeyEntry,
    } = props
    const passwordCached = usePasswordCache(keyEntry.publicKey)
    const { masterKeysNames } = useResolve(AccountabilityStore)
    const intl = useIntl()
    const { register, handleSubmit, formState, control } = useForm<FormValue>({
        defaultValues: { password: '', cache: false },
    })

    const options = useMemo(() => keyEntries?.map(({ name, publicKey }) => ({
        label: name,
        value: publicKey,
    })), [keyEntries])
    const handleChangeKeyEntry = useCallback((value: string) => {
        const key = keyEntries?.find(k => k.publicKey === value)
        if (key) {
            onChangeKeyEntry?.(key)
        }
    }, [keyEntries, onChangeKeyEntry])

    const submit = useCallback(({ password, cache }: FormValue) => onSubmit(password, cache), [onSubmit])

    // TODO: refactor? usePasswordForm?
    useImperativeHandle(ref, () => ({
        submit: () => {
            if (keyEntry?.signerName === 'ledger_key' || passwordCached) {
                onSubmit()
            }
            else {
                handleSubmit(submit)()
            }
        },
    }))

    if (passwordCached == null || passwordCached || keyEntry?.signerName === 'ledger_key') return null

    return (
        <Form id={id} className={className} onSubmit={handleSubmit(submit)}>
            {/* {!!keyEntries && keyEntries.length > 1 && (
                <FormControl>
                    <Select
                        options={options}
                        value={keyEntry.publicKey}
                        onChange={handleChangeKeyEntry}
                    />
                </FormControl>
            )} */}

            <FormControl
                label={intl.formatMessage({ id: 'PASSWORD_FIELD_PLACEHOLDER' })}
                invalid={!!formState.errors.password}
            >
                <PasswordInput
                    autoFocus
                    {...register('password', {
                        required: true,
                    })}
                />
                <Hint>
                    {intl.formatMessage(
                        { id: 'SEED_PASSWORD_FIELD_HINT' },
                        { name: masterKeysNames[keyEntry.masterKey] || convertPublicKey(keyEntry.masterKey) },
                    )}
                </Hint>
                <ErrorMessage>
                    {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
                </ErrorMessage>
                <ErrorMessage>{error}</ErrorMessage>
            </FormControl>
        </Form>
    )
}

export const PasswordForm = observer(forwardRef<PasswordFormRef, Props>(PasswordFormInner))
