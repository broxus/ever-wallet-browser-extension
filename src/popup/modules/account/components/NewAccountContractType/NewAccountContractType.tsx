import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, ErrorMessage, Footer, Header, Navbar, RadioButton } from '@app/popup/modules/shared'
import { CONTRACT_TYPE_NAMES, DEFAULT_WALLET_CONTRACTS, OTHER_WALLET_CONTRACTS } from '@app/shared'

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

    const excluded = useMemo(
        () => new Set(excludedContracts),
        [excludedContracts],
    )
    const available = useMemo(
        () => new Set(availableContracts),
        [availableContracts],
    )

    return (
        <Container className="accounts-management">
            <Header>
                <Navbar back={onBack} />
            </Header>

            <Content>
                <h2>{intl.formatMessage({ id: 'CONTRACT_TYPE_PANEL_HEADER' })}</h2>

                <div className={styles.pane}>
                    {DEFAULT_WALLET_CONTRACTS.map(({ type, description }) => {
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
