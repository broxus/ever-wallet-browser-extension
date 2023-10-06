import type * as nt from '@broxus/ever-wallet-wasm'
import { useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { convertPublicKey } from '@app/shared'

import { Button } from '../Button'
import { ErrorMessage } from '../ErrorMessage'
import { PasswordInput } from '../PasswordInput'
import { Container, Content, Footer } from '../layout'
import { Switch } from '../Switch'
import { Hint } from '../Hint'
import { Form } from '../Form'
import { FormControl } from '../FormControl'
import { AccountabilityStore } from '../../store'
import { useResolve } from '../../hooks/useResolve'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    loading?: boolean;
    error?: string;
    allowCache?: boolean;
    onSubmit(password: string, cache: boolean): void;
}

interface FormValue {
    password: string;
    cache: boolean;
}

export const EnterPassword = observer((props: Props): JSX.Element => {
    const {
        allowCache = true,
        keyEntry,
        loading,
        error,
        onSubmit,
    } = props
    const { masterKeysNames } = useResolve(AccountabilityStore)
    const intl = useIntl()
    const { register, handleSubmit, formState, control } = useForm<FormValue>({
        defaultValues: { password: '', cache: false },
    })

    const submit = useCallback(({ password, cache }: FormValue) => onSubmit(password, cache), [onSubmit])

    return (
        <Container>
            <Content>
                {keyEntry?.signerName === 'ledger_key' ? (
                    <>
                        <h2>
                            {intl.formatMessage({ id: 'APPROVE_ENTER_PASSWORD_CONFIRM_WITH_LEDGER' })}
                        </h2>
                        <ErrorMessage>{error}</ErrorMessage>
                    </>
                ) : (
                    <>
                        <h2>{intl.formatMessage({ id: 'APPROVE_ENTER_PASSWORD_DRAWER_HEADER' })}</h2>
                        <Form id="password" onSubmit={handleSubmit(submit)}>
                            <FormControl label={intl.formatMessage({ id: 'PASSWORD_FIELD_PLACEHOLDER' })}>
                                <PasswordInput
                                    autoFocus
                                    {...register('password', {
                                        required: true,
                                    })}
                                />
                                <Hint>
                                    {intl.formatMessage(
                                        { id: 'SEED_PASSWORD_FIELD_HINT' },
                                        { name: masterKeysNames[keyEntry.masterKey]
                                                || convertPublicKey(keyEntry.masterKey) },
                                    )}
                                </Hint>
                                <ErrorMessage>
                                    {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
                                </ErrorMessage>
                            </FormControl>
                            <ErrorMessage>{error}</ErrorMessage>

                            {allowCache && (
                                <FormControl>
                                    <Controller
                                        name="cache"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch labelPosition="before" {...field} checked={field.value}>
                                                {intl.formatMessage({ id: 'PASSWORD_CACHE_SWITCHER_LABEL' })}
                                            </Switch>
                                        )}
                                    />
                                </FormControl>
                            )}
                        </Form>
                    </>
                )}
            </Content>

            <Footer>
                {keyEntry?.signerName !== 'ledger_key' && (
                    <Button type="submit" form="password" loading={loading}>
                        {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                    </Button>
                )}
                {keyEntry?.signerName === 'ledger_key' && (
                    <Button loading={loading} onClick={handleSubmit(submit)}>
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                )}
            </Footer>
        </Container>
    )
})
