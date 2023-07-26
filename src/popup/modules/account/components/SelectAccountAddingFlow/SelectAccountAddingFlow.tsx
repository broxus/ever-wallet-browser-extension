import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'

import PlusIcon from '@app/popup/assets/icons/plus.svg'
import ReceiveIcon from '@app/popup/assets/icons/recieve.svg'
import ChevronIcon from '@app/popup/assets/icons/chevron-right.svg'
import { Button, Container, Content, Footer, Header, Select } from '@app/popup/modules/shared'

import { AddAccountFlow } from '../../models'

import './SelectAccountAddingFlow.scss'

interface Props {
    derivedKey: nt.KeyStoreEntry;
    derivedKeys: nt.KeyStoreEntry[];
    onChangeDerivedKey(derivedKey: nt.KeyStoreEntry): void;
    onFlow(flow: AddAccountFlow): void
    onBack?(): void
}

export const SelectAccountAddingFlow = memo((props: Props): JSX.Element => {
    const { derivedKey, derivedKeys, onChangeDerivedKey, onFlow, onBack } = props
    const intl = useIntl()

    const derivedKeysOptions = useMemo(
        () => derivedKeys.map(key => ({ label: key.name, value: key.publicKey })),
        [derivedKeys],
    )

    const handleChangeDerivedKey = useCallback((value: string) => {
        const derivedKey = derivedKeys.find(({ publicKey }) => publicKey === value)

        if (derivedKey) {
            onChangeDerivedKey(derivedKey)
        }
    }, [derivedKeys, onChangeDerivedKey])

    return (
        <Container className="accounts-flow">
            <Header>
                <h2>{intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_HEADER' })}</h2>
            </Header>

            <Content>
                {derivedKeysOptions.length > 1 && (
                    <Select
                        className="accounts-flow__select"
                        options={derivedKeysOptions}
                        value={derivedKey?.publicKey}
                        onChange={handleChangeDerivedKey}
                    />
                )}

                <div className="accounts-flow__buttons">
                    <button className="accounts-flow__btn" onClick={() => onFlow(AddAccountFlow.CREATE)}>
                        <PlusIcon className="accounts-flow__btn-icon" />
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_LABEL' })}
                        <ChevronIcon className="accounts-flow__btn-arrow" />
                    </button>

                    <button className="accounts-flow__btn" onClick={() => onFlow(AddAccountFlow.IMPORT)}>
                        <ReceiveIcon className="accounts-flow__btn-icon" />
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_ADD_EXTERNAL_LABEL' })}
                        <ChevronIcon className="accounts-flow__btn-arrow" />
                    </button>
                </div>
            </Content>

            {onBack && (
                <Footer>
                    <Button group="small" design="secondary" onClick={onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                </Footer>
            )}
        </Container>
    )
})
