import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, ErrorMessage, Footer, Header, Navbar, RadioButton, Switch } from '@app/popup/modules/shared'
import { CONTRACT_TYPE_NAMES, DEFAULT_MS_WALLET_TYPE, DEFAULT_WALLET_TYPE, OTHER_WALLET_CONTRACTS } from '@app/shared'

import styles from './NewAccountContractType.module.scss'

interface Props {
    excludedContracts?: nt.ContractType[];
    availableContracts: nt.ContractType[];
    contractType: nt.ContractType;
    error?: string;
    loading?: boolean;
    onSelectContractType: (type: nt.ContractType) => void;
    onSubmit: () => void;
    onBack: () => void;
}

export const NewAccountContractType = memo((props: Props): JSX.Element => {
    const {
        contractType,
        availableContracts,
        excludedContracts,
        error,
        loading,
        onSelectContractType,
        onSubmit,
        onBack,
    } = props
    const intl = useIntl()

    const [extended, setExtended] = useState(false)

    const excluded = useMemo(
        () => new Set(excludedContracts),
        [excludedContracts],
    )
    const available = useMemo(
        () => new Set(availableContracts),
        [availableContracts],
    )

    return (
        <Container>
            <Header>
                <Navbar back={onBack}>
                    {intl.formatMessage({ id: 'CONTRACT_TYPE_PANEL_HEADER' })}
                </Navbar>
            </Header>

            <Content>
                <div className={styles.pane}>
                    <RadioButton<nt.ContractType>
                        labelPosition="before"
                        className={styles.item}
                        disabled={!available.has(DEFAULT_WALLET_TYPE)}
                        checked={DEFAULT_WALLET_TYPE === contractType}
                        value={DEFAULT_WALLET_TYPE}
                        onChange={onSelectContractType}
                    >
                        <div className={styles.name}>
                            {intl.formatMessage({ id: 'CREATE_ACCOUNT_DEFAULT' })}
                        </div>
                        <div className={styles.desc}>
                            {intl.formatMessage({ id: 'CREATE_ACCOUNT_DEFAULT_HINT' })}
                        </div>
                    </RadioButton>
                    <RadioButton<nt.ContractType>
                        labelPosition="before"
                        className={styles.item}
                        disabled={!available.has(DEFAULT_MS_WALLET_TYPE)}
                        checked={DEFAULT_MS_WALLET_TYPE === contractType}
                        value={DEFAULT_MS_WALLET_TYPE}
                        onChange={onSelectContractType}
                    >
                        <div className={styles.name}>
                            {intl.formatMessage({ id: 'CREATE_ACCOUNT_MULTISIGNATURE' })}
                        </div>
                    </RadioButton>
                </div>

                <div className={styles.switch}>
                    <Switch labelPosition="before" checked={extended} onChange={setExtended}>
                        {intl.formatMessage({ id: 'CREATE_ACCOUNT_OPEN_ALL' })}
                    </Switch>
                </div>

                {extended && (
                    <div className={styles.pane}>
                        {OTHER_WALLET_CONTRACTS.map(({ type, description }) => {
                            if (excluded.has(type)) return null

                            return (
                                <RadioButton<nt.ContractType>
                                    labelPosition="before"
                                    className={styles.item}
                                    key={type}
                                    disabled={!available.has(type)}
                                    checked={type === contractType}
                                    value={type}
                                    onChange={onSelectContractType}
                                >
                                    <div className={styles.name}>
                                        {CONTRACT_TYPE_NAMES[type]}
                                    </div>
                                    <div className={styles.desc}>
                                        {intl.formatMessage({ id: description })}
                                    </div>
                                </RadioButton>
                            )
                        })}
                    </div>
                )}

                <ErrorMessage>{error}</ErrorMessage>
            </Content>

            <Footer>
                <Button disabled={!contractType} loading={loading} onClick={onSubmit}>
                    {intl.formatMessage({ id: 'CREATE_ACCOUNT_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
