import type nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import * as React from 'react'
import { useIntl } from 'react-intl'

import { MessageAmount } from '@app/models'
import {
    Button,
    ButtonGroup,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Hint,
    Input,
    ParamsPanel,
    Select,
    Switch,
    usePasswordCache,
} from '@app/popup/modules/shared'
import { prepareKey } from '@app/popup/utils'
import {
    convertCurrency,
    convertEvers,
    convertPublicKey,
    convertTokenName,
    NATIVE_CURRENCY,
    NATIVE_CURRENCY_DECIMALS,
} from '@app/shared'

import './EnterSendPassword.scss'

interface Props {
    keyEntries: nt.KeyStoreEntry[];
    keyEntry: nt.KeyStoreEntry;
    amount?: MessageAmount;
    recipient?: string;
    fees?: string;
    error?: string;
    balanceError?: string;
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
        balanceError,
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
            else if (amount.type === 'ever_wallet') {
                context = {
                    address: recipient,
                    amount: amount.data.amount,
                    asset: NATIVE_CURRENCY,
                    decimals: NATIVE_CURRENCY_DECIMALS,
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
                        <div className="enter-send-password__field-password">
                            <Input
                                autoFocus
                                type="password"
                                placeholder={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_PASSWORD_FIELD_PLACEHOLDER' })}
                                disabled={disabled}
                                value={password}
                                onKeyDown={onKeyDown}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <Hint>
                                {intl.formatMessage(
                                    { id: 'SEED_PASSWORD_FIELD_HINT' },
                                    {
                                        name: masterKeysNames[keyEntry.masterKey]
                                            || convertPublicKey(keyEntry.masterKey),
                                    },
                                )}
                            </Hint>
                            <ErrorMessage className="enter-send-password__error-message">
                                {error}
                            </ErrorMessage>
                            <div className="enter-send-password__field-switch">
                                <Switch labelPosition="before" checked={cache} onChange={() => setCache(!cache)}>
                                    {intl.formatMessage({ id: 'APPROVE_PASSWORD_CACHE_SWITCHER_LABEL' })}
                                </Switch>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="enter-send-password__ledger-confirm">
                        {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_APPROVE_WITH_LEDGER_HINT' })}
                    </div>
                )}

                <ParamsPanel className="enter-send-password__params">
                    <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_BLOCKCHAIN_FEE' })} row>
                        {fees
                            ? `~${convertEvers(fees)} ${NATIVE_CURRENCY}`
                            : intl.formatMessage({ id: 'CALCULATING_HINT' })}
                    </ParamsPanel.Param>

                    {amount?.type === 'token_wallet' && (
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })} row>
                            <div className="enter-send-password__params-amount">
                                {/* <AssetIcon
                                    className="root-token-icon noselect"
                                    type="token_wallet"
                                    address={amount.data.rootTokenContract}
                                    old={amount.data.old}
                                /> */}
                                <span className="token-amount-text ">
                                    {convertCurrency(amount.data.amount, amount.data.decimals)}
                                </span>
                                &nbsp;
                                <span className="root-token-name">
                                    {convertTokenName(amount.data.symbol)}
                                </span>
                            </div>
                        </ParamsPanel.Param>
                    )}

                    {amount && (
                        <ParamsPanel.Param
                            row
                            label={amount.type === 'ever_wallet'
                                ? intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })
                                : intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_ATTACHED_AMOUNT' })}
                        >
                            <div className="enter-send-password__params-amount">
                                {/* <EverAssetIcon className="root-token-icon noselect" /> */}
                                {convertEvers(
                                    amount.type === 'ever_wallet'
                                        ? amount.data.amount
                                        : amount.data.attachedAmount,
                                )}
                                &nbsp;
                                {NATIVE_CURRENCY}
                            </div>
                        </ParamsPanel.Param>
                    )}
                    {recipient && (
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT' })}>
                            {recipient}
                        </ParamsPanel.Param>
                    )}
                    {transactionId && (
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_TRANSACTION_ID' })}>
                            {transactionId}
                        </ParamsPanel.Param>
                    )}
                </ParamsPanel>
                <ErrorMessage>{balanceError}</ErrorMessage>
                {(keyEntry.signerName === 'ledger_key' || passwordCached) && (
                    <ErrorMessage>{error}</ErrorMessage>
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
                            || !!balanceError
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
