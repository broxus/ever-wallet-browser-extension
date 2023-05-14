import { memo, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Contact } from '@app/models'
import { convertPublicKey } from '@app/shared'
import { Button, Input } from '@app/popup/modules/shared'
import AddUserIcon from '@app/popup/assets/icons/add-user.svg'
import { parseError } from '@app/popup/utils'

interface Props {
    publicKey: string;
    onSubmit(contact: Contact): Promise<void>;
}

interface FormValue {
    name: string;
}

export const CustodianContactForm = memo(({ publicKey, onSubmit }: Props): JSX.Element => {
    const [state, setState] = useState<'initial' | 'form' | 'submitted'>('initial')
    const [loading, setLoading] = useState(false)
    const intl = useIntl()
    const { register, handleSubmit, formState, setError } = useForm<FormValue>()

    const submit = useCallback(({ name }: FormValue) => {
        const contact: Contact = {
            type: 'public_key',
            value: publicKey,
            name,
        }

        setLoading(true)
        onSubmit(contact)
            .then(() => setState('submitted'))
            .catch((e) => setError('name', { message: parseError(e) }))
            .finally(() => setLoading(false))
    }, [publicKey, onSubmit])

    return (
        <div className="deploy-result__custodian">
            <div className="deploy-result__custodian-key" title={publicKey}>
                {convertPublicKey(publicKey)}
            </div>
            <div className="deploy-result__custodian-value">
                {state === 'initial' && (
                    <Button design="primary-light" onClick={() => setState('form')}>
                        <AddUserIcon />
                        {intl.formatMessage({ id: 'CONTACT_ADD_TO_CONTACTS' })}
                    </Button>
                )}

                {state === 'form' && (
                    <form className="deploy-result__form" onSubmit={handleSubmit(submit)}>
                        <Input
                            autoFocus
                            className="deploy-result__form-input"
                            size="s"
                            type="text"
                            placeholder={intl.formatMessage({ id: 'CONTACT_NAME_PLACEHOLDER' })}
                            {...register('name', {
                                required: true,
                                maxLength: 64,
                            })}
                        />
                        <Button
                            className="deploy-result__form-btn"
                            design="primary-light"
                            type="submit"
                            disabled={!formState.isValid || loading}
                        >
                            {intl.formatMessage({ id: 'ADD_BTN_TEXT' })}
                        </Button>
                    </form>
                )}

                {state === 'submitted' && (
                    <div className="deploy-result__submitted">
                        {intl.formatMessage({ id: 'DEPLOY_MULTISIG_RESULT_ADDED' })}
                    </div>
                )}
            </div>
        </div>
    )
})
