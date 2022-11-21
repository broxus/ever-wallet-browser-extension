import type nt from '@wallet/nekoton-wasm'
import { memo, useCallback, useState } from 'react'
import { useIntl } from 'react-intl'

import { convertEvers, NATIVE_CURRENCY } from '@app/shared'
import {
    Button,
    ButtonGroup,
    Container,
    Content,
    EnterPassword,
    Footer,
    SlidingPanel,
    usePasswordCache,
} from '@app/popup/modules/shared'

import './PreparedMessage.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    masterKeysNames: Record<string, string>;
    balance?: string;
    custodians?: string[];
    fees?: string;
    error?: string;
    disabled?: boolean;

    onSubmit(password?: string, cache?: boolean): void;

    onBack(): void;
}

export const PreparedMessage = memo((props: Props): JSX.Element => {
    const {
        keyEntry,
        masterKeysNames,
        balance,
        custodians,
        disabled,
        error,
        fees,
        onSubmit,
        onBack,
    } = props

    const intl = useIntl()
    const [panelActive, setPanelActive] = useState(false)
    const passwordCached = usePasswordCache(keyEntry.publicKey)

    const handleDeploy = useCallback(() => {
        if (passwordCached) {
            onSubmit()
        }
        else {
            setPanelActive(true)
        }
    }, [passwordCached, onSubmit])
    const handleCancel = useCallback(() => setPanelActive(false), [])
    const handleClose = useCallback(() => setPanelActive(false), [])

    return (
        <Container className="prepared-message">
            <Content>
                <div className="prepared-message__details">
                    <div className="prepared-message__details-param">
                        <p className="prepared-message__details-param-desc">
                            {intl.formatMessage({
                                id: 'DEPLOY_WALLET_DETAILS_TERM_BALANCE',
                            })}
                        </p>
                        <p className="prepared-message__details-param-value">
                            {`${convertEvers(balance).toLocaleString()} ${NATIVE_CURRENCY}`}
                        </p>
                    </div>

                    <div className="prepared-message__details-param">
                        <p className="prepared-message__details-param-desc">
                            {intl.formatMessage({
                                id: 'DEPLOY_WALLET_DETAILS_TERM_FEE',
                            })}
                        </p>
                        <p className="prepared-message__details-param-value">
                            {fees
                                ? `${convertEvers(fees)} ${NATIVE_CURRENCY}`
                                : intl.formatMessage({
                                    id: 'CALCULATING_HINT',
                                })}
                        </p>
                    </div>

                    {custodians?.map((custodian, idx) => (
                        <div key={custodian} className="prepared-message__details-param">
                            <p className="prepared-message__details-param-desc">
                                {intl.formatMessage(
                                    {
                                        id: 'DEPLOY_MULTISIG_DETAILS_TERM_CUSTODIAN',
                                    },
                                    { index: idx + 1 },
                                )}
                            </p>
                            <p className="prepared-message__details-param-value">{custodian}</p>
                        </div>
                    ))}
                </div>
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button group="small" design="secondary" onClick={onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button disabled={!fees || passwordCached == null} onClick={handleDeploy}>
                        {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>

            {passwordCached === false && (
                <SlidingPanel active={panelActive} onClose={handleClose}>
                    <EnterPassword
                        keyEntry={keyEntry}
                        masterKeysNames={masterKeysNames}
                        disabled={disabled}
                        error={error}
                        onSubmit={onSubmit}
                        onBack={handleCancel}
                    />
                </SlidingPanel>
            )}
        </Container>
    )
})
