import type nt from '@wallet/nekoton-wasm'
import { memo, useMemo } from 'react'
import { useIntl } from 'react-intl'

import {
    Button,
    ButtonGroup,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header,
    RadioButton,
} from '@app/popup/modules/shared'
import { CONTRACT_TYPE_NAMES, DEFAULT_WALLET_CONTRACTS, OTHER_WALLET_CONTRACTS } from '@app/shared'

interface Props {
    excludedContracts?: nt.ContractType[];
    availableContracts: nt.ContractType[];
    contractType: nt.ContractType;
    error?: string;
    disabled?: boolean;
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
        disabled,
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
                <h2>{intl.formatMessage({ id: 'CONTRACT_TYPE_PANEL_HEADER' })}</h2>
            </Header>

            <Content>
                <div className="accounts-management__type-list">
                    <p className="accounts-management__type-list-subtitle">Default contracts:</p>
                    {DEFAULT_WALLET_CONTRACTS.map(({ type, description }) => {
                        if (excluded.has(type)) return null

                        return (
                            <RadioButton<nt.ContractType>
                                className="accounts-management__type-list-item"
                                key={type}
                                id={type}
                                disabled={!available.has(type)}
                                checked={type === contractType}
                                value={type}
                                onChange={onSelectContractType}
                            >
                                <div className="accounts-management__type-list-item-name">
                                    {CONTRACT_TYPE_NAMES[type]}
                                </div>
                                <div className="accounts-management__type-list-item-description">
                                    {intl.formatMessage({ id: description })}
                                </div>
                            </RadioButton>
                        )
                    })}

                    <p className="accounts-management__type-list-subtitle">Other contracts:</p>
                    {OTHER_WALLET_CONTRACTS.map(({ type, description }) => {
                        if (excluded.has(type)) return null

                        return (
                            <RadioButton<nt.ContractType>
                                className="accounts-management__type-list-item"
                                key={type}
                                id={type}
                                disabled={!available.has(type)}
                                checked={type === contractType}
                                value={type}
                                onChange={onSelectContractType}
                            >
                                <div className="accounts-management__type-list-item-name">
                                    {CONTRACT_TYPE_NAMES[type]}
                                </div>
                                <div className="accounts-management__type-list-item-description">
                                    {intl.formatMessage({ id: description })}
                                </div>
                            </RadioButton>
                        )
                    })}
                </div>

                <ErrorMessage>{error}</ErrorMessage>
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button
                        group="small" design="secondary" disabled={disabled}
                        onClick={onBack}
                    >
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button disabled={disabled || !contractType} onClick={onSubmit}>
                        {intl.formatMessage({ id: 'CREATE_ACCOUNT_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
