import type * as nt from '@broxus/ever-wallet-wasm'
import { ForwardedRef, forwardRef, useCallback, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { usePasswordCache, useResolve } from '../../hooks'
import { SettingsStore } from '../../store'
import { ErrorMessage } from '../ErrorMessage'
import { Form } from '../Form'
import { FormControl } from '../FormControl'
import { PasswordInput } from '../PasswordInput'
import { KeySelect } from '../KeySelect'

interface Props {
    id?: string;
    className?: string;
    keyEntry: nt.KeyStoreEntry;
    keyEntries?: nt.KeyStoreEntry[];
    error?: string;
    onSubmit(password?: string, cache?: boolean): void;
    onChangeKeyEntry?(keyEntry: nt.KeyStoreEntry): void;
}

interface FormValue {
    password: string;
}

export interface PasswordFormRef {
    submit(): void;
}

function PasswordFormInner(props: Props, ref: ForwardedRef<PasswordFormRef>): JSX.Element | null {
    const {
        id = 'password-form',
        className,
        keyEntry,
        keyEntries,
        error,
        onSubmit,
        onChangeKeyEntry,
    } = props
    const settings = useResolve(SettingsStore)
    const passwordCached = usePasswordCache(keyEntry.publicKey)
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<FormValue>({
        defaultValues: { password: '' },
    })

    const submit = useCallback(({ password }: FormValue) => {
        onSubmit(password, settings.data[keyEntry.masterKey]?.cache ?? false)
    }, [keyEntry.masterKey, onSubmit])

    // TODO: refactor? usePasswordForm?
    useImperativeHandle(ref, () => ({
        submit: () => {
            if (keyEntry.signerName === 'ledger_key' || passwordCached) {
                onSubmit()
            }
            else {
                handleSubmit(submit)()
            }
        },
    }))

    if (passwordCached == null) return null

    return (
        <Form id={id} className={className} onSubmit={handleSubmit(submit)}>
            {keyEntry.signerName !== 'ledger_key' && !passwordCached && (
                <FormControl invalid={!!formState.errors.password}>
                    <PasswordInput
                        autoFocus
                        suffix={(
                            <KeySelect
                                appearance="button"
                                value={keyEntry}
                                keyEntries={keyEntries}
                                onChange={onChangeKeyEntry}
                            />
                        )}
                        {...register('password', {
                            required: true,
                        })}
                    />

                    <ErrorMessage>
                        {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
                    </ErrorMessage>
                </FormControl>
            )}

            {(keyEntry.signerName === 'ledger_key' || passwordCached) && (
                <KeySelect value={keyEntry} keyEntries={keyEntries} onChange={onChangeKeyEntry} />
            )}

            <ErrorMessage>{error}</ErrorMessage>
        </Form>
    )
}

export const PasswordForm = observer(forwardRef<PasswordFormRef, Props>(PasswordFormInner))
