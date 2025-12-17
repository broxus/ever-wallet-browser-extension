import { observer } from 'mobx-react-lite'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, PasswordInput, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { LoadingAnimation } from '@app/popup/modules/shared/components/RiveAnimation/Animations/LoadingAnimation'

import { ScanSeedViewModel } from './ScanSeedViewModel'
import styles from './ScanSeed.module.scss'

export const ScanSeed = observer(() => {
    const vm = useViewModel(ScanSeedViewModel)
    const intl = useIntl()

    const { register, handleSubmit, formState } = useForm<{ password: string }>()


    return (
        <Container key="passwordRequest">
            <Content>

                {vm.loading && (
                    <div className={styles.modal}>
                        <LoadingAnimation />
                    </div>
                )}
                <Form id="password-request" onSubmit={handleSubmit(vm.scanSeed)}>
                    <FormControl>
                        <PasswordInput
                            autoFocus
                            size="xs"
                            disabled={vm.loading}
                            invalid={!!formState.errors.password || !!vm.error}
                            placeholder={intl.formatMessage({
                                id: 'ENTER_SEED_PASSWORD_FIELD_PLACEHOLDER',
                            })}
                            {...register('password', {
                                required: true,
                            })}
                        />
                        <ErrorMessage>
                            {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
                            {vm.error}
                        </ErrorMessage>
                    </FormControl>
                </Form>
            </Content>

            <Footer>
                <FooterAction>
                    <Button
                        design="accent"
type="submit"
form="password-request"
                        loading={vm.loading}
                    >
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
