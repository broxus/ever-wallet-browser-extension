import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Button, Container, Content, CopyButton, ErrorMessage, Footer, Form, FormControl, Header, Hint, Input, Navbar, SeedList, useViewModel } from '@app/popup/modules/shared'

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

    return (
        <>
            {vm.step.is(Step.PasswordRequest) && (
                <Container key="passwordRequest">
                    <Header>
                        <Navbar back={() => vm.handle.close()} />
                    </Header>

                    <Content>
                        <h2>{intl.formatMessage({ id: 'PASSWORD_FORM_HEADER' })}</h2>

                        <Form id="password-request" onSubmit={handleSubmit(vm.onSubmit)}>
                            <FormControl
                                label={intl.formatMessage({ id: 'PASSWORD_FIELD_PLACEHOLDER' })}
                                invalid={!!formState.errors.password || !!vm.error}
                            >
                                <Input
                                    autoFocus
                                    type="password"
                                    disabled={vm.loading}
                                    placeholder={intl.formatMessage({
                                        id: 'ENTER_SEED_PASSWORD_FIELD_PLACEHOLDER',
                                    })}
                                    {...register('password', {
                                        required: true,
                                        minLength: 6,
                                    })}
                                />
                                <Hint>
                                    {intl.formatMessage(
                                        { id: 'SEED_PASSWORD_FIELD_HINT' },
                                        { name: vm.masterKeyName },
                                    )}
                                </Hint>
                                <ErrorMessage>
                                    {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
                                    {vm.error}
                                </ErrorMessage>
                            </FormControl>
                        </Form>
                    </Content>

                    <Footer>
                        <Button type="submit" form="password-request" loading={vm.loading}>
                            {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                        </Button>
                    </Footer>
                </Container>
            )}

            {vm.step.is(Step.CopySeedPhrase) && (
                <Container key="copySeedPhrase">
                    <Header>
                        <Navbar close={() => vm.handle.close()} />
                    </Header>

                    <Content>
                        <h2>{intl.formatMessage({ id: 'SAVE_THE_SEED_PHRASE' })}</h2>
                        <p className={styles.hint}>
                            {intl.formatMessage({ id: 'EXPORT_SEED_WARNING_TEXT' })}
                        </p>
                        <SeedList words={vm.seedPhrase} />
                    </Content>

                    <Footer>
                        <CopyButton text={vm.seedPhrase.join(' ')}>
                            <Button>
                                {intl.formatMessage({ id: 'COPY_ALL_WORDS_BTN_TEXT' })}
                            </Button>
                        </CopyButton>
                    </Footer>
                </Container>
            )}
        </>
    )
})
