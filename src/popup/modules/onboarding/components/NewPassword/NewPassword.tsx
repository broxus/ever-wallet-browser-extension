import { memo } from 'react'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'

import BackImg from '@app/popup/assets/img/welcome/password-back-min.png'
import MainImg from '@app/popup/assets/img/welcome/password-main-min.png'

interface Props {
    disabled: boolean;
    onSubmit: (password: string) => void;
    onBack: () => void;
}

interface FormValue {
    password: string;
    passwordConfirm: string;
}

export const NewPassword = memo(({ disabled, onSubmit, onBack }: Props): JSX.Element => {
    const intl = useIntl()
    const { register, handleSubmit, watch, formState } = useForm<FormValue>()

    const trySubmit = (data: FormValue) => {
        if (!disabled) {
            onSubmit(data.password)
        }
    }

    return (
        <div className="slide slide--form">
            <div className="container">
                <div className="slide__wrap">
                    <div className="slide__content slide__animate">
                        <h2 className="sec-title">
                            {intl.formatMessage({ id: 'CREATE_PASSWORD' })}
                        </h2>
                        <p className="main-txt">
                            {intl.formatMessage({ id: 'CREATE_PASSWORD_SUBTITLE' })}
                        </p>
                        <form className="main-form" id="password" onSubmit={handleSubmit(trySubmit)}>
                            <div className="main-form__main">
                                <label className="main-form__label">
                                    <span className="main-form__title">
                                        {intl.formatMessage({ id: 'PASSWORD_FIELD_PLACEHOLDER' })}
                                    </span>
                                    <input
                                        className="main-form__input"
                                        type="password"
                                        autoFocus
                                        placeholder={intl.formatMessage({ id: 'PASSWORD_FIELD_PLACEHOLDER' })}
                                        disabled={disabled}
                                        {...register('password', {
                                            required: true,
                                            minLength: 6,
                                        })}
                                    />
                                </label>
                                <label className="main-form__label">
                                    <span className="main-form__title">
                                        {intl.formatMessage({ id: 'PASSWORD_CONFIRM_FIELD_PLACEHOLDER' })}
                                    </span>
                                    <input
                                        className="main-form__input"
                                        type="password"
                                        placeholder={intl.formatMessage({ id: 'PASSWORD_CONFIRM_FIELD_PLACEHOLDER' })}
                                        disabled={disabled}
                                        {...register('passwordConfirm', {
                                            required: true,
                                            validate: value => value === watch('password'),
                                        })}
                                    />
                                    {formState.errors.password && (
                                        <div className="main-form__error">
                                            {intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED' })}
                                        </div>
                                    )}
                                    {formState.errors.passwordConfirm && (
                                        <div className="main-form__error">
                                            {intl.formatMessage({ id: 'ERROR_PASSWORD_DOES_NOT_MATCH' })}
                                        </div>
                                    )}
                                </label>
                            </div>
                            <div className="sec-bar">
                                <button
                                    className="btn btn--secondary btn--half"
                                    type="button"
                                    disabled={disabled}
                                    onClick={onBack}
                                >
                                    {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                                </button>
                                <button
                                    className="btn btn--primery btn--half"
                                    type="submit"
                                    form="password"
                                    disabled={disabled}
                                >
                                    {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="slide__pic slide__pic--pass slide__animate">
                        <img src={BackImg} alt="" />
                        <img src={MainImg} alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
})
