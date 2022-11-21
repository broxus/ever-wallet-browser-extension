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
    Header, Hint,
    Input,
    SeedList,
    useViewModel,
} from '@app/popup/modules/shared'

import { ExportSeedViewModel, Step } from './ExportSeedViewModel'

interface Props {
    onBack(): void;
}

export const ExportSeed = observer(({ onBack }: Props): JSX.Element => {
    const vm = useViewModel(ExportSeedViewModel)
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
                                group="small" design="secondary" disabled={vm.loading}
                                onClick={onBack}
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

                    <Content>
                        <SeedList words={vm.seedPhrase} />
                    </Content>

                    <Footer>
                        <ButtonGroup>
                            <Button group="small" design="secondary" onClick={onBack}>
                                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                            </Button>

                            {vm.step.is(Step.CopySeedPhrase) && (
                                <CopyButton text={vm.seedPhrase.join(' ')}>
                                    <Button>
                                        {intl.formatMessage({ id: 'COPY_ALL_WORDS_BTN_TEXT' })}
                                    </Button>
                                </CopyButton>
                            )}
                        </ButtonGroup>
                    </Footer>
                </Container>
            )}
        </>
    )
})
