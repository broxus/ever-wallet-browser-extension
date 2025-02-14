import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, Form, FormControl, Header, Input, Navbar, Select, useViewModel } from '@app/popup/modules/shared'
import { LedgerAccountManager } from '@app/popup/modules/ledger'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { CheckNewSeedPhrase } from '../CheckNewSeedPhrase'
import { EnterNewSeedPasswords } from '../EnterNewSeedPasswords'
import { ImportSeed } from '../ImportSeed'
import { NewSeedPhrase } from '../NewSeedPhrase'
import { AddSeedFlow, CreateSeedViewModel, OptionType, Step } from './CreateSeedViewModel'

export const CreateSeed = observer((): JSX.Element => {
    const vm = useViewModel(CreateSeedViewModel)
    const intl = useIntl()

    const flowOptions = useMemo<OptionType[]>(() => [
        {
            key: AddSeedFlow.Create,
            label: intl.formatMessage({ id: 'ADD_SEED_OPTION_CREATE' }),
            value: AddSeedFlow.Create,
        },
        {
            key: AddSeedFlow.Import,
            label: intl.formatMessage({ id: 'ADD_SEED_OPTION_IMPORT' }),
            value: AddSeedFlow.Import,
        },
        {
            key: AddSeedFlow.ImportLegacy,
            label: intl.formatMessage({ id: 'ADD_SEED_OPTION_IMPORT_LEGACY' }),
            value: AddSeedFlow.ImportLegacy,
        },
        {
            key: AddSeedFlow.ConnectLedger,
            label: intl.formatMessage({ id: 'ADD_SEED_OPTION_CONNECT_LEDGER' }),
            value: AddSeedFlow.ConnectLedger,
        },
    ], [])

    return (
        <>
            {vm.step.is(Step.Index) && (
                <Container>
                    <Header>
                        <Navbar back="..">
                            {intl.formatMessage({ id: 'ADD_SEED_PANEL_HEADER' })}
                        </Navbar>
                    </Header>

                    <Content>
                        <Form id="create-seed-flow" onSubmit={vm.onNext}>
                            <FormControl label={intl.formatMessage({ id: 'ENTER_SEED_FIELD_PLACEHOLDER' })}>
                                <Input
                                    type="text"
                                    size="xs"
                                    value={vm.name}
                                    onChange={vm.onNameChange}
                                />
                            </FormControl>

                            <FormControl>
                                <Select<AddSeedFlow>
                                    size="s"
                                    options={flowOptions}
                                    value={vm.flow}
                                    onChange={vm.onFlowChange}
                                />
                            </FormControl>
                        </Form>
                    </Content>

                    <Footer layer>
                        <FooterAction>
                            <Button design="accent" type="submit" form="create-seed-flow">
                                {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                            </Button>
                        </FooterAction>
                    </Footer>
                </Container>
            )}

            {vm.step.is(Step.ShowPhrase) && (
                <NewSeedPhrase
                    key="exportedSeed"
                    seedWords={vm.seedWords}
                    onNext={vm.onNext}
                    onBack={vm.onBack}
                />
            )}

            {vm.step.is(Step.CheckPhrase) && (
                <CheckNewSeedPhrase
                    key="checkSeed"
                    words={vm.seedWords}
                    getBip39Hints={vm.getBip39Hints}
                    onSubmit={vm.onNext}
                    onBack={vm.onBack}
                />
            )}

            {vm.step.is(Step.PasswordRequest) && (
                <EnterNewSeedPasswords
                    key="passwordRequest"
                    loading={vm.loading}
                    error={vm.error}
                    onSubmit={vm.onSubmit}
                    onBack={vm.onBack}
                />
            )}

            {vm.step.is(Step.ImportPhrase) && (
                <ImportSeed
                    key="importSeed"
                    wordsCount={vm.flow === AddSeedFlow.ImportLegacy ? 24 : 12}
                    getBip39Hints={vm.getBip39Hints}
                    onSubmit={vm.onImportSubmit}
                    onBack={vm.onBack}
                />
            )}

            {/* TODO: redesign */}
            {vm.step.is(Step.ConnectLedger) && (
                <LedgerAccountManager
                    name={vm.name}
                    onBack={vm.onBack}
                    onSuccess={vm.onLedgerSuccess}
                />
            )}
        </>
    )
})
