import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import {
    Button,
    ButtonGroup,
    Container,
    Content,
    CopyButton,
    ErrorMessage,
    Footer,
    Header,
    Hint,
    Input,
    SeedList,
    useViewModel,
} from '@app/popup/modules/shared'

import { ExportSeedViewModel, Step } from './ExportSeedViewModel'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    onClose(): void;
}

export const ExportSeed = observer(({ keyEntry, onClose }: Props): JSX.Element => {
    const vm = useViewModel(ExportSeedViewModel, (model) => {
        model.keyEntry = keyEntry
    })
    const intl = useIntl()

    const { register, handleSubmit, formState } = useForm<{ password: string }>()

    return (
        <>
            {vm.step.is(Step.PasswordRequest) && (
                <Container key="passwordRequest" className="accounts-management">
                    <Header>
                        <h2>{intl.formatMessage({ id: 'EXPORT_SEED_PANEL_HEADER' })}</h2>
                    </Header>

                    <Content>
                        <form id="password-request" onSubmit={handleSubmit(vm.onSubmit)}>
                            <div className="accounts-management__content-form-rows">
                                <div className="accounts-management__content-form-row">
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
                                    </ErrorMessage>
                                    <ErrorMessage>
                                        {vm.error}
                                    </ErrorMessage>
                                </div>
                            </div>
                        </form>
                    </Content>

                    <Footer>
                        <ButtonGroup>
                            <Button
                                group="small"
                                design="secondary"
                                disabled={vm.loading}
                                onClick={onClose}
                            >
                                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                            </Button>
                            <Button type="submit" form="password-request" disabled={vm.loading}>
                                {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                            </Button>
                        </ButtonGroup>
                    </Footer>
                </Container>
            )}

            {vm.step.is(Step.CopySeedPhrase) && (
                <Container key="copySeedPhrase" className="accounts-management">
                    <Header>
                        <h2>{intl.formatMessage({ id: 'SAVE_THE_SEED_PHRASE' })}</h2>
                    </Header>

                    <Content className="accounts-management__content">
                        <p className="accounts-management__export-seed-warning">
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
