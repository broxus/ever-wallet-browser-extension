import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { observer } from 'mobx-react-lite';

import { PWD_MIN_LENGTH } from '@app/shared';
import {
    Form,
    FormControl,
    Hint,
    Icon,
    PasswordInput,
    Space,
    Switch,
    Tooltip,
    useResolve,
} from '@app/popup/modules/shared';

import s from './CreatePassword.module.scss';
import { NavigationBar } from '../../components/NavigationBar';
import { NewAccountStore } from '../../modules/NewAccount/NewAccountStore';
import { ImportAccountStore } from '../../modules/ImportAccount/ImportAccountStore';
import type { CreatePasswordStore } from '../../modules/CreatePasswordStore';
import { appRoutes } from '../../appRoutes';
import classNames from 'classnames';

interface FormValue {
    password: string;
    passwordConfirm: string;
    cache: boolean;
}

interface Props {
    step: 'import' | 'new';
}

type HintState = 'password' | 'confirm' | 'success';

export const CreatePassword = observer(({ step }: Props) => {
    const intl = useIntl();
    const navigate = useNavigate();
    const { register, formState, trigger, getValues, control } = useForm<FormValue>({ mode: 'onChange' });
    const store: CreatePasswordStore = step === 'import' ? useResolve(ImportAccountStore) : useResolve(NewAccountStore);
    const { submit, loading } = store;

    const [password, passwordConfirmValue] = useWatch({ name: ['password', 'passwordConfirm'], control });

    const trySubmit = async (data: FormValue) => {
        await submit(data.passwordConfirm, data.cache);
    };

    const handleCheckPhrase = useCallback(async () => {
        const isValid = await trigger();
        const data = getValues();

        if (isValid && data.password === data.passwordConfirm) {
            await trySubmit(data);
            navigate(`${appRoutes.newAccount.path}/${appRoutes.confirmation.path}`);
        }
    }, [appRoutes, navigate, trigger, trySubmit, getValues]);

    const handleBack = useCallback(() => {
        if (step === 'import') {
            navigate(`${appRoutes.importAccount.path}/${appRoutes.enterSeed.path}`);
        } else {
            navigate(`${appRoutes.newAccount.path}/${appRoutes.checkSeed.path}`);
        }
    }, [appRoutes]);

    const getHintState = (): HintState => {
        if (formState.errors.password || !password?.length) {
            return 'password';
        }

        if (formState.errors.passwordConfirm || !passwordConfirmValue?.length) {
            return 'confirm';
        }

        return 'success';
    };

    const hintState = getHintState();

    return (
        <div className={s.container}>
            <div>
                <div className={s.header}>
                    <Space direction="column" gap="m">
                        <h2 className={s.title}>{intl.formatMessage({ id: 'CREATE_PASSWORD_TITLE' })}</h2>
                        <p className={s.text}>{intl.formatMessage({ id: 'CREATE_PASSWORD_SUBTITLE_1' })}</p>
                        <p className={s.text}>{intl.formatMessage({ id: 'CREATE_PASSWORD_SUBTITLE_2' })}</p>
                    </Space>
                </div>
                <Space direction="column" gap="l" className={s.fields}>
                    <Form id="change-name-form">
                        <FormControl>
                            <PasswordInput
                                autoFocus
                                autoComplete="new-password"
                                size="xs"
                                placeholder={intl.formatMessage({ id: 'PASSWORD_FIELD_LABEL' })}
                                {...register('password', {
                                    required: true,
                                    minLength: PWD_MIN_LENGTH,
                                    validate: (value) => value.trim().length > 0,
                                })}
                            />
                        </FormControl>

                        <FormControl>
                            <PasswordInput
                                size="xs"
                                autoComplete="new-password"
                                placeholder={intl.formatMessage({ id: 'PASSWORD_CONFIRM_FIELD_PLACEHOLDER' })}
                                {...register('passwordConfirm', {
                                    required: true,
                                    validate: (value, { password }) => value === password,
                                })}
                            />
                        </FormControl>

                        <FormControl>
                            <Controller
                                name="cache"
                                control={control}
                                defaultValue={false}
                                render={({ field }) => (
                                    <Switch labelPosition="before" {...field} checked={field.value}>
                                        <div className={s.switch}>
                                            {intl.formatMessage({ id: 'PASSWORD_SETTINGS_SWITCH_LABEL' })}
                                            &nbsp;
                                            <Icon icon="info" id="cache-tooltip" />
                                        </div>
                                        <Tooltip design="primary" anchorSelect="#cache-tooltip">
                                            {intl.formatMessage({ id: 'ONBOARDING_PASSWORD_SETTINGS_SWITCH_TOOLTIP' })}
                                        </Tooltip>
                                    </Switch>
                                )}
                            />
                        </FormControl>
                    </Form>

                    {hintState === 'password' && (
                        <Space direction="column" gap="s">
                            <span className={s.hint}>
                                <Icon icon="passwordMatch" />
                                {intl.formatMessage({ id: 'PWD_MSG_START' })}
                            </span>
                            <Hint>{intl.formatMessage({ id: 'PWD_MSG_MIN_LENGTH' }, { length: PWD_MIN_LENGTH })}</Hint>
                        </Space>
                    )}

                    {hintState === 'confirm' && (
                        <Space direction="column" gap="s">
                            <span className={s.hint}>
                                <Icon icon="passwordMatchError" />
                                {intl.formatMessage({ id: 'PWD_MSG_SECOND_START' })}
                            </span>
                            <Hint>{intl.formatMessage({ id: 'PWD_MSG_SECOND_START_DESCRIPTION' })}</Hint>
                        </Space>
                    )}

                    {hintState === 'success' && (
                        <Space direction="column" gap="s">
                            <span className={classNames(s.hint, s.hint__success)}>
                                <Icon icon="passwordMatchSuccess" />
                                {intl.formatMessage({ id: 'PWD_MSG_CONFIRM' })}
                            </span>
                            <Hint>{intl.formatMessage({ id: 'PWD_MSG_CONFIRM_DESCRIPTION' })}</Hint>
                        </Space>
                    )}
                </Space>
            </div>
            <NavigationBar loading={loading} onNext={handleCheckPhrase} onBack={handleBack} />
        </div>
    );
});
