import { memo, useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'
import { Controller, useForm } from 'react-hook-form'

import { Form, FormControl, Input, Space, useResolve } from '@app/popup/modules/shared'

import s from './CreatePassword.module.scss'
import { NavigationBar } from '../../components/NavigationBar'
import { appRoutes } from '../..'
import { NewAccountStore } from '../../modules/NewAccount/NewAccountStore'
import { ImportAccountStore } from '../../modules/ImportAccount/ImportAccountStore'

interface FormValue {
    password: string;
    passwordConfirm: string;
}


interface Props {
    step: 'import' | 'new';
}

const FIRST_ACCOUNT_NAME = 'Account 1'

export const CreatePassword = memo(({ step }: Props): JSX.Element => {
    const intl = useIntl()
    const navigate = useNavigate()
    const { register, watch, formState, control, trigger } = useForm<FormValue>()
    const { submit } = step === 'import' ? useResolve(ImportAccountStore) : useResolve(NewAccountStore)

    const trySubmit = async (data: FormValue) => {
        await submit(FIRST_ACCOUNT_NAME, data.passwordConfirm)
    }

    const handleCheckPhrase = useCallback(async () => {
        const isValid = await trigger()
        if (isValid && watch('password') === watch('passwordConfirm')) {
            await trySubmit(watch())
            navigate(`${appRoutes.newAccount.path}/${appRoutes.confirmation.path}`)
        }

    }, [appRoutes, navigate, trigger, trySubmit, watch])

    const handleBack = useCallback(() => {
        if (step === 'import') {
            navigate(`${appRoutes.importAccount.path}/${appRoutes.enterSeed.path}`)
        }
        else {
            navigate(`${appRoutes.newAccount.path}/${appRoutes.checkSeed.path}`)
        }
    }, [appRoutes])

    return (
        <div className={s.createPassword}>
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
                                label={intl.formatMessage({ id: 'PASSWORD_FIELD_PLACEHOLDER' })}
                                invalid={!!formState.errors.password}
                                prefix={`(least ${(watch('password')?.length || 0) <= 8 ? 8 - (watch('password')?.length || 0) : 0} symbols)`}
                            >
                                <Controller
                                    control={control}
                                    rules={{ required: 'Password is required' }}
                                    {...register('password', {
                                        required: true,
                                        minLength: 8,
                                        validate: (value) => value.trim().length > 0,
                                    })}
                                    render={({ field }) => (
                                        <Input
                                            autoFocus
                                            type="password"
                                            placeholder={intl.formatMessage({ id: 'PASSWORD_FIELD_PLACEHOLDER' })}
                                            {...field}
                                        />
                                    )}
                                />
                            </FormControl>
                            <FormControl
                                label={intl.formatMessage({ id: 'PASSWORD_CONFIRM_FIELD_PLACEHOLDER' })}
                                invalid={!!formState.errors.passwordConfirm}
                                prefix={`(least ${(watch('passwordConfirm')?.length || 0) <= 8 ? 8 - (watch('passwordConfirm')?.length || 0) : 0} symbols)`}
                            >
                                <Controller
                                    control={control}
                                    rules={{ required: 'Password is required' }}
                                    {...register('passwordConfirm', {
                                        required: true,
                                        minLength: 8,
                                        validate: (value) => value.trim().length > 0,
                                    })}
                                    render={({ field }) => (
                                        <Input
                                            type="password"
                                            placeholder={intl.formatMessage({ id: 'PASSWORD_CONFIRM_FIELD_PLACEHOLDER' })}
                                            {...field}
                                        />
                                    )}
                                />
                            </FormControl>
                        </Form>
                    </Space>
                </div>
                <NavigationBar
                    onNext={handleCheckPhrase}
                    onBack={handleBack}
                />
            </div>
        </div>
    )
})
