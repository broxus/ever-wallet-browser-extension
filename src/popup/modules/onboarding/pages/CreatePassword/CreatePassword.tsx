import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { observer } from 'mobx-react-lite'

import { PWD_MIN_LENGTH } from '@app/shared'
import { ErrorMessage, Form, FormControl, Hint, PasswordInput, Space, useResolve } from '@app/popup/modules/shared'

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
                    <Space direction="column" gap="m">
                        <h2 className={s.title}>
                            {intl.formatMessage({ id: 'CREATE_PASSWORD_TITLE' })}
                        </h2>
                        <p className={s.text}>
                            {intl.formatMessage({ id: 'CREATE_PASSWORD_SUBTITLE' })}
                        </p>
                    </Space>
                </div>
                <Space direction="column" gap="s" className={s.fields}>
                    <Form id="change-name-form">
                        <FormControl
                            label={intl.formatMessage({ id: 'PASSWORD_FIELD_LABEL' })}
                        >
                            <PasswordInput
                                autoFocus
                                autoComplete="new-password"
                                size="xs"
                                invalid={!!formState.errors.password}
                                placeholder={intl.formatMessage({ id: 'PASSWORD_FIELD_LABEL' })}
                                {...register('password', {
                                    required: {
                                        value: true,
                                        message: intl.formatMessage({
                                            id: 'PWD_MSG_REQUIRED',
                                        }),
                                    },
                                    minLength: {
                                        value: PWD_MIN_LENGTH,
                                        message: intl.formatMessage({
                                            id: 'PWD_MSG_MIN_LENGTH',
                                        }, {
                                            length: PWD_MIN_LENGTH,
                                        }),
                                    },
                                    validate: (value) => (
                                        value.trim().length > 0
                                            ? true
                                            : intl.formatMessage({
                                                id: 'PWD_MSG_MIN_LENGTH',
                                            }, {
                                                length: PWD_MIN_LENGTH,
                                            })
                                    ),
                                })}
                            />
                            <Hint>
                                {`At least ${PWD_MIN_LENGTH} characters.`}
                            </Hint>
                            <ErrorMessage>
                                {formState.errors.password?.message}
                            </ErrorMessage>
                        </FormControl>

                        <FormControl
                            label={intl.formatMessage({ id: 'PASSWORD_CONFIRM_FIELD_PLACEHOLDER' })}
                        >
                            <PasswordInput
                                size="xs"
                                invalid={!!formState.errors.passwordConfirm}
                                autoComplete="new-password"
                                placeholder={intl.formatMessage({ id: 'PASSWORD_CONFIRM_FIELD_PLACEHOLDER' })}
                                {...register('passwordConfirm', {
                                    required: {
                                        value: true,
                                        message: intl.formatMessage({
                                            id: 'PWD_MSG_CONFIRM_REQUIRED',
                                        }),
                                    },
                                    validate: (value, { password }) => (
                                        value === password
                                            ? true
                                            : intl.formatMessage({
                                                id: 'PWD_MSG_CONFIRM_NOT_MATCH',
                                            })
                                    ),
                                })}
                            />
                            <ErrorMessage>
                                {formState.errors.passwordConfirm?.message}
                            </ErrorMessage>
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
