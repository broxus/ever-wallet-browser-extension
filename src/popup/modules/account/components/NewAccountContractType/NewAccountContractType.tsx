import type nt from '@wallet/nekoton-wasm'
import { memo, useMemo } from 'react'
import { useIntl } from 'react-intl'

import {
    Button,
    ButtonGroup,
    Container,
    Content,
    CONTRACT_TYPES,
    CONTRACT_TYPES_KEYS,
    ErrorMessage,
    Footer,
    Header,
    RadioButton,
} from '@app/popup/modules/shared'

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

    const activeTypes = useMemo(
        () => CONTRACT_TYPES_KEYS.filter(
            key => !excludedContracts?.includes(key),
        ),
        [excludedContracts],
    )

    return (
        <Container className="accounts-management">
            <Header>
                <h2>{intl.formatMessage({ id: 'CONTRACT_TYPE_PANEL_HEADER' })}</h2>
            </Header>

            <Content>
                <div className="accounts-management__type-list">
                    {activeTypes.map(type => (
                        <RadioButton<nt.ContractType>
                            className="accounts-management__type-list-item"
                            key={type}
                            id={type}
                            disabled={!availableContracts.includes(type)}
                            checked={type === contractType}
                            value={type}
                            onChange={onSelectContractType}
                        >
                            {CONTRACT_TYPES[type]}
                        </RadioButton>
                    ))}
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
