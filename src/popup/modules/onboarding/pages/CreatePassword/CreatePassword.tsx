import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { observer } from 'mobx-react-lite'

import { PWD_MIN_LENGTH } from '@app/shared'
import { Form, FormControl, Input, Space, useResolve } from '@app/popup/modules/shared'

import s from './CreatePassword.module.scss'
import { NavigationBar } from '../../components/NavigationBar'
import { NewAccountStore } from '../../modules/NewAccount/NewAccountStore'
import { ImportAccountStore } from '../../modules/ImportAccount/ImportAccountStore'
import { appRoutes } from '../../appRoutes'

interface FormValue {
    password: string;
    passwordConfirm: string;
}

interface Props {
    step: 'import' | 'new';
}

const FIRST_ACCOUNT_NAME = 'Account 1'

export const CreatePassword = observer(({ step }: Props): JSX.Element => {
    const intl = useIntl()
    const navigate = useNavigate()
    const { register, formState, trigger, getValues } = useForm<FormValue>()
    const { submit, loading } = step === 'import' ? useResolve(ImportAccountStore) : useResolve(NewAccountStore)

    const trySubmit = async (data: FormValue) => {
        await submit(FIRST_ACCOUNT_NAME, data.passwordConfirm)
    }

    const handleCheckPhrase = useCallback(async () => {
        const isValid = await trigger()
        const data = getValues()

        if (isValid && data.password === data.passwordConfirm) {
            await trySubmit(data)
            navigate(`${appRoutes.newAccount.path}/${appRoutes.confirmation.path}`)
        }

    }, [appRoutes, navigate, trigger, trySubmit, getValues])

    const handleBack = useCallback(() => {
        if (step === 'import') {
            navigate(`${appRoutes.importAccount.path}/${appRoutes.enterSeed.path}`)
        }
        else {
            navigate(`${appRoutes.newAccount.path}/${appRoutes.checkSeed.path}`)
        }
    }, [appRoutes])

    return (
        <div className={s.container}>
            <div>
                <div className={s.header}>
                    <Space direction="column" gap="l">
                        <h2 className={s.title}>
                            {intl.formatMessage({ id: 'CREATE_PASSWORD' })}
                        </h2>
                        <p className={s.text}>
                            {intl.formatMessage({ id: 'CREATE_PASSWORD_SUBTITLE' })}
                        </p>
                    </Space>
                </div>
                <Space direction="column" gap="s">
                    <Form id="change-name-form">
                        <FormControl
                            label={(
                                <div className={s.label}>
                                    {intl.formatMessage({ id: 'PASSWORD_FIELD_PLACEHOLDER' })}
                                    {/* TODO: move to json */}
                                    <span>{`(least ${PWD_MIN_LENGTH} symbols)`}</span>
                                </div>
                            )}
                            invalid={!!formState.errors.password}
                        >
                            <Input
                                autoFocus
                                type="password"
                                placeholder={intl.formatMessage({ id: 'PASSWORD_FIELD_PLACEHOLDER' })}
                                {...register('password', {
                                    required: true,
                                    minLength: PWD_MIN_LENGTH,
                                    validate: (value) => value.trim().length > 0,

                                })}
                            />
                        </FormControl>
                        <FormControl
                            label={(
                                <div className={s.label}>
                                    {intl.formatMessage({ id: 'PASSWORD_CONFIRM_FIELD_PLACEHOLDER' })}
                                    {/* TODO: move to json */}
                                    <span>{`(least ${PWD_MIN_LENGTH} symbols)`}</span>
                                </div>
                            )}
                            invalid={!!formState.errors.passwordConfirm}
                        >
                            <Input
                                type="password"
                                placeholder={intl.formatMessage({ id: 'PASSWORD_CONFIRM_FIELD_PLACEHOLDER' })}
                                {...register('passwordConfirm', {
                                    required: true,
                                    minLength: PWD_MIN_LENGTH,
                                    validate: (value) => value.trim().length > 0,
                                })}
                            />
                        </FormControl>
                    </Form>
                </Space>
            </div>
            <NavigationBar
                loading={loading}
                onNext={handleCheckPhrase}
                onBack={handleBack}
            />
        </div>
    )
})
