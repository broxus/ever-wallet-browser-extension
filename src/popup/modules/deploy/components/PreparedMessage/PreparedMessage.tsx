import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useCallback } from 'react'
import { useIntl } from 'react-intl'

import { convertEvers } from '@app/shared'
import {
    Button,
    ButtonGroup,
    Container,
    Content,
    Footer,
    useEnterPassword,
    usePasswordCache,
} from '@app/popup/modules/shared'

import './PreparedMessage.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    currencyName: string;
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
        balance,
        custodians,
        disabled,
        error,
        fees,
        currencyName,
        onSubmit,
        onBack,
    } = props

    const intl = useIntl()
    const enterPassword = useEnterPassword({ keyEntry, error, disabled, onSubmit })
    const passwordCached = usePasswordCache(keyEntry.publicKey)

    const handleDeploy = useCallback(() => {
        if (passwordCached) {
            onSubmit()
        }
        else {
            enterPassword.show()
        }
    }, [passwordCached, onSubmit])

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
                            {`${convertEvers(balance).toLocaleString()} ${currencyName}`}
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
                                ? `${convertEvers(fees)} ${currencyName}`
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
        </Container>
    )
})
