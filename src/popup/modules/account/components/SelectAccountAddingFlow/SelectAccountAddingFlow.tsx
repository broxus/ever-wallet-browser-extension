import type nt from '@wallet/nekoton-wasm'
import classNames from 'classnames'
import React, { memo, useCallback } from 'react'
import { useIntl } from 'react-intl'

import {
    Button, ButtonGroup, Container, Content, Footer, Header, Select,
} from '@app/popup/modules/shared'

import { AddAccountFlow } from '../../models'
import { CreateAccountIcon } from './CreateAccountIcon'
import { PlusIcon } from './PlusIcon'

interface Props {
    derivedKey: nt.KeyStoreEntry;
    derivedKeys: nt.KeyStoreEntry[];
    flow: AddAccountFlow

    onChangeDerivedKey(derivedKey: nt.KeyStoreEntry): void;

    onSelect(flow: AddAccountFlow): void

    onNext(): void

    onBack?(): void
}

export const SelectAccountAddingFlow = memo((props: Props): JSX.Element => {
    const { derivedKey, derivedKeys, flow, onChangeDerivedKey, onSelect, onNext, onBack } = props
    const intl = useIntl()

    const getPopupContainer = useCallback((trigger: any): HTMLElement => { // eslint-disable-line arrow-body-style
        return trigger.closest('.sliding-panel__content')
            ?? document.getElementById('root')
            ?? document.body
    }, [])

    const derivedKeysOptions = React.useMemo(
        () => derivedKeys
            .sort((a, b) => a.accountId - b.accountId)
            .map(key => ({ label: key.name, value: key.publicKey })),
        [derivedKeys],
    )

    const handleChangeDerivedKey = useCallback((value: string) => {
        const derivedKey = derivedKeys.find(({ publicKey }) => publicKey === value)

        if (derivedKey) {
            onChangeDerivedKey(derivedKey)
        }
    }, [derivedKeys, onChangeDerivedKey])

    return (
        <Container className="accounts-management">
            <Header>
                <h2>{intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_HEADER' })}</h2>
            </Header>

            <Content>
                <div className="accounts-management__content-form-rows">
                    <div className="accounts-management__content-form-row">
                        <Select
                            options={derivedKeysOptions}
                            value={derivedKey?.publicKey}
                            getPopupContainer={getPopupContainer}
                            onChange={handleChangeDerivedKey}
                        />
                    </div>
                </div>

                <div className="accounts-management__add-options">
                    <div
                        className={classNames('accounts-management__add-options-option', {
                            'accounts-management__add-options-option-selected': flow === AddAccountFlow.CREATE,
                        })}
                        onClick={() => onSelect(AddAccountFlow.CREATE)}
                    >
                        <CreateAccountIcon className="accounts-management__add-options-icon" />
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_LABEL' })}
                    </div>
                    <div
                        className={classNames('accounts-management__add-options-option', {
                            'accounts-management__add-options-option-selected': flow === AddAccountFlow.IMPORT,
                        })}
                        onClick={() => onSelect(AddAccountFlow.IMPORT)}
                    >
                        <PlusIcon className="accounts-management__add-options-icon" />
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_AN_EXISTING_LABEL' })}
                    </div>
                </div>
            </Content>

            <Footer>
                <ButtonGroup>
                    {onBack && (
                        <Button group="small" design="secondary" onClick={onBack}>
                            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                        </Button>
                    )}
                    <Button onClick={onNext}>
                        {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
