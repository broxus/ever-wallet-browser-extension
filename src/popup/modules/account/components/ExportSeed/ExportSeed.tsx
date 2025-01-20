import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { useEffect } from 'react'

import { Button, Container, Content, CopyButton, ErrorMessage, Footer, Form, FormControl, PasswordInput, SeedList, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { ExportSeedViewModel, Step } from './ExportSeedViewModel'
import styles from './ExportSeed.module.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
}

export const ExportSeed = observer(({ keyEntry }: Props): JSX.Element => {
    const vm = useViewModel(ExportSeedViewModel, (model) => {
        model.keyEntry = keyEntry
    })
    const intl = useIntl()

    const { register, handleSubmit, formState } = useForm<{ password: string }>()

    useEffect(() => {
        vm.handle.update({
            title: vm.step.is(Step.PasswordRequest)
                ? intl.formatMessage({ id: 'PASSWORD_FORM_HEADER' })
                : intl.formatMessage({ id: 'SAVE_THE_SEED_PHRASE' }),
        })
    }, [vm.step])

    return (
        <>
            {vm.step.is(Step.PasswordRequest) && (
                <Container key="passwordRequest">
                    <Content>
                        <Form id="password-request" onSubmit={handleSubmit(vm.onSubmit)}>
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
                                design="accent" type="submit" form="password-request"
                                loading={vm.loading}
                            >
                                {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                            </Button>
                        </FooterAction>
                    </Footer>
                </Container>
            )}

            {vm.step.is(Step.CopySeedPhrase) && (
                <Container key="copySeedPhrase">
                    <Content>
                        <p className={styles.hint}>
                            {intl.formatMessage({ id: 'EXPORT_SEED_WARNING_TEXT' })}
                        </p>
                        <SeedList words={vm.seedPhrase} />
                    </Content>

                    <Footer>
                        <FooterAction>
                            <CopyButton text={vm.seedPhrase.join(' ')}>
                                <Button design="accent">
                                    {intl.formatMessage({ id: 'COPY_ALL_WORDS_BTN_TEXT' })}
                                </Button>
                            </CopyButton>
                        </FooterAction>
                    </Footer>
                </Container>
            )}
        </>
    )
})
