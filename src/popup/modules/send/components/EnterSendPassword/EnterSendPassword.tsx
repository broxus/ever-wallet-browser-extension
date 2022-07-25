import type nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import React, { RefCallback, useCallback, useState } from 'react'
import { useIntl } from 'react-intl'

import { MessageAmount } from '@app/models'
import {
    AssetIcon,
    Button,
    ButtonGroup,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Input,
    Select,
    Switch,
    EverAssetIcon,
    usePasswordCache,
} from '@app/popup/modules/shared'
import { prepareKey } from '@app/popup/utils'
import {
    convertCurrency, convertPublicKey, convertTokenName, convertEvers, NATIVE_CURRENCY,
} from '@app/shared'

import './EnterSendPassword.scss'

interface Props {
    keyEntries: nt.KeyStoreEntry[];
    keyEntry: nt.KeyStoreEntry;
    amount?: MessageAmount;
    recipient?: string;
    fees?: string;
    error?: string;
    disabled: boolean;
    transactionId?: string;
    masterKeysNames: Record<string, string>;

    onSubmit(password: nt.KeyPassword): void;

    onBack(): void;

    onChangeKeyEntry(keyEntry: nt.KeyStoreEntry): void;
}

export const EnterSendPassword = observer((props: Props): JSX.Element | null => {
    const {
        keyEntries,
        keyEntry,
        amount,
        recipient,
        fees,
        error,
        disabled,
        transactionId,
        masterKeysNames,
        onSubmit,
        onBack,
        onChangeKeyEntry,
    } = props
    const intl = useIntl()

    const [submitted, setSubmitted] = useState(false)
    const [password, setPassword] = useState<string>('')
    const [cache, setCache] = useState(false)
    const passwordCached = usePasswordCache(keyEntry.publicKey)

    const passwordRef = useCallback<RefCallback<HTMLElement>>((ref: HTMLElement) => ref?.scrollIntoView(), [])

    if (passwordCached == null) {
        return null
    }

    const keyEntriesOptions = keyEntries.map(key => ({
        label: key.name,
        value: key.publicKey,
    }))

    const changeKeyEntry = (value: string) => {
        const key = keyEntries.find(k => k.publicKey === value)

        if (key) {
            onChangeKeyEntry(key)
        }
    }

    const trySubmit = async () => {
        let context

        if (recipient && amount) {
            if (amount.type === 'token_wallet') {
                context = {
                    address: recipient,
                    amount: amount.data.amount,
                    asset: amount.data.symbol,
                    decimals: amount.data.decimals,
                }
            }
            else if (amount.type === 'ton_wallet') {
                context = {
                    address: recipient,
                    amount: amount.data.amount,
                    asset: NATIVE_CURRENCY,
                    decimals: 9,
                }
            }
        }

        onSubmit(prepareKey({ keyEntry, password, context, cache }))
        setSubmitted(true)
    }

    const onKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        const keyCode = event.which || event.keyCode
        if (keyCode === 13) {
            await trySubmit()
        }
    }

    return (
        <Container className="enter-send-password">
            <Content>
                <div className="enter-send-password__confirm-details">
                    {recipient && (
                        <div key="recipient" className="enter-send-password__confirm-details-param">
                            <p className="enter-send-password__confirm-details-param-desc">
                                {intl.formatMessage({
                                    id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT',
                                })}
                            </p>
                            <span className="enter-send-password__confirm-details-param-value">
                                {recipient}
                            </span>
                        </div>
                    )}
                    {transactionId && (
                        <div
                            key="transactionId"
                            className="enter-send-password__confirm-details-param"
                        >
                            <p className="enter-send-password__confirm-details-param-desc">
                                {intl.formatMessage({
                                    id: 'APPROVE_SEND_MESSAGE_TERM_TRANSACTION_ID',
                                })}
                            </p>
                            <p className="enter-send-password__confirm-details-param-value">
                                {transactionId}
                            </p>
                        </div>
                    )}
                    {amount?.type === 'token_wallet' && (
                        <div className="enter-send-password__confirm-details-param">
                            <p className="enter-send-password__confirm-details-param-desc">
                                {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })}
                            </p>
                            <div className="enter-send-password__confirm-details-param-value _amount">
                                <AssetIcon
                                    type="token_wallet"
                                    address={amount.data.rootTokenContract}
                                    old={amount.data.old}
                                    className="root-token-icon noselect"
                                />
                                <span className="token-amount-text ">
                                    {convertCurrency(amount.data.amount, amount.data.decimals)}
                                </span>
                                &nbsp;
                                <span className="root-token-name">
                                    {convertTokenName(amount.data.symbol)}
                                </span>
                            </div>
                        </div>
                    )}

                    {amount && (
                        <div className="enter-send-password__confirm-details-param">
                            <p className="enter-send-password__confirm-details-param-desc">
                                {amount.type === 'ton_wallet'
                                    ? intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })
                                    : intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_ATTACHED_AMOUNT' })}
                            </p>
                            <div className="enter-send-password__confirm-details-param-value _amount">
                                <EverAssetIcon className="root-token-icon noselect" />
                                {convertEvers(
                                    amount.type === 'ton_wallet'
                                        ? amount.data.amount
                                        : amount.data.attachedAmount,
                                )}
                                &nbsp;
                                {NATIVE_CURRENCY}
                            </div>
                        </div>
                    )}

                    <div key="convertedFees" className="enter-send-password__confirm-details-param">
                        <p className="enter-send-password__confirm-details-param-desc">
                            {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_BLOCKCHAIN_FEE' })}
                        </p>
                        <div className="enter-send-password__confirm-details-param-value _amount">
                            <EverAssetIcon className="root-token-icon noselect" />
                            {fees
                                ? `~${convertEvers(fees)} ${NATIVE_CURRENCY}`
                                : intl.formatMessage({
                                    id: 'CALCULATING_HINT',
                                })}
                        </div>
                    </div>
                </div>
                {keyEntries.length > 1 ? (
                    <Select
                        className="enter-send-password__field-select"
                        options={keyEntriesOptions}
                        value={keyEntry.publicKey}
                        onChange={changeKeyEntry}
                    />
                ) : null}
                {keyEntry.signerName !== 'ledger_key' ? (
                    !passwordCached && (
                        <>
                            <Input
                                autoFocus
                                className="enter-send-password__field-password"
                                type="password"
                                placeholder={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_PASSWORD_FIELD_PLACEHOLDER' })}
                                ref={passwordRef}
                                disabled={disabled}
                                value={password}
                                onKeyDown={onKeyDown}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <div className="enter-send-password__field-hint">
                                {intl.formatMessage(
                                    { id: 'APPROVE_SEND_MESSAGE_PASSWORD_FIELD_HINT' },
                                    {
                                        name: masterKeysNames[keyEntry.masterKey]
                                            || convertPublicKey(keyEntry.masterKey),
                                    },
                                )}
                            </div>
                            <ErrorMessage className="enter-send-password__error-message">
                                {error}
                            </ErrorMessage>
                            <div className="enter-send-password__field-switch">
                                <Switch checked={cache} onChange={() => setCache(!cache)}>
                                    {intl.formatMessage({ id: 'APPROVE_PASSWORD_CACHE_SWITCHER_LABEL' })}
                                </Switch>
                            </div>
                        </>
                    )
                ) : (
                    <div className="enter-send-password__ledger-confirm">
                        {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_APPROVE_WITH_LEDGER_HINT' })}
                    </div>
                )}
                {(keyEntry.signerName === 'ledger_key' || passwordCached) && (
                    <ErrorMessage>
                        {error}
                    </ErrorMessage>
                )}
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button
                        group="small" design="secondary" disabled={submitted && !error}
                        onClick={onBack}
                    >
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button
                        disabled={
                            disabled
                            || (keyEntry.signerName !== 'ledger_key'
                                && !passwordCached
                                && (password == null || password.length === 0))
                            || (submitted && !error)
                        }
                        onClick={trySubmit}
                    >
                        {intl.formatMessage({ id: 'CONFIRM_TRANSACTION_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
