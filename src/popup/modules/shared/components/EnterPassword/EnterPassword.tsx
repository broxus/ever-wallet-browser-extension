import type * as nt from '@broxus/ever-wallet-wasm'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { Button } from '../Button'
import { ErrorMessage } from '../ErrorMessage'
import { PasswordInput } from '../PasswordInput'
import { Container, Content, Footer } from '../layout'
import { Form } from '../Form'
import { FormControl } from '../FormControl'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    loading?: boolean;
    error?: string;
    onSubmit(password: string): void;
    onClose?: () => void;
}

interface FormValue {
    password: string;
}

export const EnterPassword = observer((props: Props): JSX.Element => {
    const {
        keyEntry,
        loading,
        error,
        onSubmit,
        onClose,
    } = props
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<FormValue>({
        defaultValues: { password: '' },
    })

    const submit = useCallback(({ password }: FormValue) => onSubmit(password), [onSubmit])

    return (
        <>
            <SlidingPanelHeader
                onClose={onClose}
                title={keyEntry?.signerName === 'ledger_key'
                    ? intl.formatMessage({ id: 'APPROVE_ENTER_PASSWORD_CONFIRM_WITH_LEDGER' })
                    : intl.formatMessage({ id: 'APPROVE_ENTER_PASSWORD_DRAWER_HEADER' })}
            />
            <Container>
                <Content>
                    {keyEntry?.signerName === 'ledger_key' ? (
                        <ErrorMessage>{error}</ErrorMessage>
                    ) : (
                        <Form id="password" onSubmit={handleSubmit(submit)}>
                            <FormControl>
                                <PasswordInput
                                    autoFocus
                                    size="xs"
                                    invalid={!!formState.errors.password}
                                    {...register('password', {
                                        required: true,
                                    })}
                                />
                                <ErrorMessage>
                                    {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
                                </ErrorMessage>
                                <ErrorMessage>{error}</ErrorMessage>
                            </FormControl>
                        </Form>
                    )}
                </Content>

                <Footer>
                    <FooterAction>
                        {keyEntry?.signerName !== 'ledger_key' ? (
                            <Button
                                design="accent" type="submit" form="password"
                                loading={loading}
                            >
                                {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                            </Button>
                        ) : (
                            <Button design="accent" loading={loading} onClick={handleSubmit(submit)}>
                                {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                            </Button>
                        )}
                    </FooterAction>
                </Footer>
            </Container>
        </>
    )
})
