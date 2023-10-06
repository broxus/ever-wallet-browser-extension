import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'

import { AccountabilityStore, Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Hint, Input, PasswordInput, Space, useResolve } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

import styles from './AddAccountForm.module.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    name: string;
    loading: boolean;
    error?: string;
    onSubmit(value: AddAccountFormValue): void;
    onBack(): void;
    onManageDerivedKey(): void;
}

export interface AddAccountFormValue {
    name: string;
    password: string;
}

export const AddAccountForm = observer((props: Props): JSX.Element => {
    const { keyEntry, name, loading, error, onSubmit, onBack, onManageDerivedKey } = props
    const { masterKeysNames } = useResolve(AccountabilityStore)
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<AddAccountFormValue>({
        defaultValues: { name, password: '' },
    })

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_LABEL' })}</h2>
                <div className={styles.text}>
                    {intl.formatMessage({ id: 'CREATE_NEW_ACCOUNT_PANEL_COMMENT' })}
                    &nbsp;
                    <a onClick={onManageDerivedKey}>
                        {intl.formatMessage({ id: 'CREATE_NEW_ACCOUNT_PANEL_COMMENT_MANAGE_KEY_LINK_LABEL' })}
                    </a>.
                </div>

                <Form id="add-account-form" onSubmit={handleSubmit(onSubmit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'ENTER_ACCOUNT_NAME_FIELD_PLACEHOLDER' })}
                        invalid={!!formState.errors.name}
                    >
                        <Input
                            autoFocus
                            type="text"
                            {...register('name', {
                                required: true,
                                minLength: 1,
                                validate: (value) => value.trim().length > 0,
                            })}
                        />
                    </FormControl>

                    {keyEntry.signerName !== 'ledger_key' && (
                        <FormControl
                            label={intl.formatMessage({ id: 'PASSWORD_FIELD_PLACEHOLDER' })}
                            invalid={!!formState.errors.password || !!error}
                        >
                            <PasswordInput
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
                                {error}
                            </ErrorMessage>
                        </FormControl>
                    )}
                </Form>
            </Content>

            <Footer>
                <Space direction="row" gap="s">
                    <Button design="secondary" onClick={onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button type="submit" form="add-account-form" loading={loading}>
                        {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
