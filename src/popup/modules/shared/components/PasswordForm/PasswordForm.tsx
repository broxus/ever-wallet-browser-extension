import type * as nt from '@broxus/ever-wallet-wasm'
import { UseFormReturn } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'

import { usePasswordCache } from '../../hooks'
import { ErrorMessage } from '../ErrorMessage'
import { Form } from '../Form'
import { FormControl } from '../FormControl'
import { PasswordInput } from '../PasswordInput'
import { KeySelect } from '../KeySelect'

interface Props {
    form: UseFormReturn<PasswordFormValue>;
    id?: string;
    className?: string;
    keyEntry: nt.KeyStoreEntry;
    keyEntries?: nt.KeyStoreEntry[];
    error?: string;
    onSubmit(): void;
    onChangeKeyEntry?(keyEntry: nt.KeyStoreEntry): void;
}

export interface PasswordFormValue {
    password: string;
}

function PasswordFormInner(props: Props): JSX.Element | null {
    const {
        id = 'password-form',
        form,
        className,
        keyEntry,
        keyEntries,
        error,
        onSubmit,
        onChangeKeyEntry,
    } = props
    const passwordCached = usePasswordCache(keyEntry.publicKey)
    const intl = useIntl()
    const { register, formState, setError } = form

    useEffect(() => {
        if (!error) return
        setError('password', {
            type: 'invalid',
            message: error,
        }, { shouldFocus: true })
    }, [error])

    if (passwordCached == null) return null

    return (
        <Form id={id} className={className} onSubmit={onSubmit}>
            {keyEntry.signerName !== 'ledger_key' && !passwordCached && (
                <FormControl invalid={!!formState.errors.password}>
                    <PasswordInput
                        autoFocus
                        size="xs"
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
                        {formState.errors.password?.type === 'required' && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
                        {formState.errors.password?.type === 'invalid' && formState.errors.password.message}
                    </ErrorMessage>
                </FormControl>
            )}

            {(keyEntry.signerName === 'ledger_key' || passwordCached) && (
                <>
                    <KeySelect value={keyEntry} keyEntries={keyEntries} onChange={onChangeKeyEntry} />
                    <ErrorMessage>{error}</ErrorMessage>
                </>
            )}
        </Form>
    )
}

export const PasswordForm = observer(PasswordFormInner)
