import { observer } from 'mobx-react-lite'
import React from 'react'
import { useIntl } from 'react-intl'

import {
    Button,
    ButtonGroup,
    Container,
    Content,
    Footer,
    Header,
    Input,
    Select,
    useViewModel,
} from '@app/popup/modules/shared'
import { LedgerAccountManager } from '@app/popup/modules/ledger'

import { CheckNewSeedPhrase } from '../CheckNewSeedPhrase'
import { EnterNewSeedPasswords } from '../EnterNewSeedPasswords'
import { ImportSeed } from '../ImportSeed'
import { NewSeedPhrase } from '../NewSeedPhrase'
import {
    AddSeedFlow, CreateSeedViewModel, OptionType, Step,
} from './CreateSeedViewModel'

export const CreateSeed = observer((): JSX.Element => {
    const vm = useViewModel(CreateSeedViewModel)
    const intl = useIntl()

    const flowOptions = React.useMemo<OptionType[]>(() => [
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
                <Container key="index" className="accounts-management">
                    <Header>
                        <h2>{intl.formatMessage({ id: 'ADD_SEED_PANEL_HEADER' })}</h2>
                    </Header>

                    <Content>
                        <div className="accounts-management__content-form-rows">
                            <div className="accounts-management__content-form-row">
                                <Input
                                    type="text"
                                    placeholder={intl.formatMessage({ id: 'ENTER_SEED_FIELD_PLACEHOLDER' })}
                                    value={vm.name ?? ''}
                                    onChange={vm.onNameChange}
                                />
                            </div>

                            <div className="accounts-management__content-form-row">
                                <Select<AddSeedFlow>
                                    options={flowOptions}
                                    value={vm.flow}
                                    onChange={vm.onFlowChange}
                                />
                            </div>
                        </div>
                    </Content>

                    <Footer>
                        <ButtonGroup>
                            <Button
                                group="small" design="secondary" disabled={vm.loading}
                                onClick={vm.onBack}
                            >
                                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                            </Button>
                            <Button type="submit" onClick={vm.onNext}>
                                {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                            </Button>
                        </ButtonGroup>
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
                    onSubmit={vm.onNext}
                    onBack={vm.onBack}
                />
            )}

            {vm.step.is(Step.PasswordRequest) && (
                <EnterNewSeedPasswords
                    key="passwordRequest"
                    disabled={vm.loading}
                    error={vm.error}
                    onSubmit={vm.onSubmit}
                    onBack={vm.onBack}
                />
            )}

            {vm.step.is(Step.ImportPhrase) && (
                <ImportSeed
                    key="importSeed"
                    wordsCount={vm.flow === AddSeedFlow.ImportLegacy ? 24 : 12}
                    error={vm.error}
                    getBip39Hints={vm.getBip39Hints}
                    onSubmit={vm.onNextWhenImport}
                    onBack={vm.onBack}
                />
            )}

            {vm.step.is(Step.ConnectLedger) && <LedgerAccountManager name={vm.name} onBack={vm.onBack} />}
        </>
    )
})
