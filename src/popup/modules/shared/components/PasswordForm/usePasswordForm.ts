import type * as nt from '@broxus/ever-wallet-wasm'
import { useForm } from 'react-hook-form'

import { usePasswordCache, useResolve } from '../../hooks'
import { SettingsStore } from '../../store'
import type { PasswordFormValue } from './PasswordForm'

// TODO: refactor
export function usePasswordForm(keyEntry: nt.KeyStoreEntry | undefined) {
    const passwordCached = usePasswordCache(keyEntry?.publicKey)
    const settings = useResolve(SettingsStore)
    const form = useForm<PasswordFormValue>({
        mode: 'onChange',
        defaultValues: { password: '' },
    })

    return {
        form,
        isValid: keyEntry?.signerName === 'ledger_key' || passwordCached || form.formState.isValid,
        handleSubmit(onSubmit: (password?: string, cache?: boolean) => void): () => void {
            if (keyEntry?.signerName === 'ledger_key' || passwordCached) {
                return () => onSubmit()
            }

            return form.handleSubmit(({ password }: PasswordFormValue) => {
                const cache = settings.data[keyEntry?.masterKey ?? '']?.cache ?? false
                onSubmit(password, cache)
            })
        },
    }
}
