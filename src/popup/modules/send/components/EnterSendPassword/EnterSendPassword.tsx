import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { KeyboardEvent, useState } from 'react'
import { useIntl } from 'react-intl'

import CopyIcon from '@app/popup/assets/icons/copy.svg'
import { MessageAmount } from '@app/models'
import {
    Button,
    ButtonGroup, Checkbox,
    Container,
    Content, CopyText,
    ErrorMessage,
    Footer,
    Hint,
    Input,
    ParamsPanel,
    Select,
    Switch,
    usePasswordCache,
    useViewModel,
} from '@app/popup/modules/shared'
import { prepareKey } from '@app/popup/utils'
import { BROXUS_SUPPORT_LINK, convertAddress, convertCurrency, convertEvers, convertPublicKey, convertTokenName } from '@app/shared'

import { EnterSendPasswordViewModel } from './EnterSendPasswordViewModel'
import { Recipient } from './Recipient'
import './EnterSendPassword.scss'

interface Props {
    keyEntries: nt.KeyStoreEntry[];
    keyEntry: nt.KeyStoreEntry;
    amount?: MessageAmount;
    recipient?: string;
    fees?: string;
    error?: string;
    txErrors?: nt.TransactionTreeSimulationError[];
    balanceError?: string;
    disabled: boolean;
    transactionId?: string;
    contractType: nt.ContractType;
    context?: nt.LedgerSignatureContext
    onSubmit(password: nt.KeyPassword): void;
    onBack(): void;
    onChangeKeyEntry(keyEntry: nt.KeyStoreEntry): void;
}

export const EnterSendPassword = observer((props: Props): JSX.Element | null => {
    const {
        contractType,
        keyEntries,
        keyEntry,
        amount,
        recipient,
        fees,
        error,
        txErrors,
        balanceError,
        disabled,
        transactionId,
        context,
        onSubmit,
        onBack,
        onChangeKeyEntry,
    } = props
    const vm = useViewModel(EnterSendPasswordViewModel)
    const intl = useIntl()

    const [submitted, setSubmitted] = useState(false)
    const [password, setPassword] = useState<string>('')
    const [txErrorConfirmed, setTxErrorConfirmed] = useState(false)
    const [cache, setCache] = useState(false)
    const passwordCached = usePasswordCache(keyEntry.publicKey)

    if (passwordCached == null) {
        return null
    }

    const hasTxError = txErrors && txErrors.length > 0
    const canFixTxError = hasTxError && txErrors?.some(
        (item) => 'code' in item.error && (item.error.code === -14 || item.error.code === -37),
    )

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
        const wallet = contractType

        onSubmit(prepareKey({ keyEntry, password, context, cache, wallet }))
        setSubmitted(true)
    }

    const onKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
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
                                        name: vm.masterKeysNames[keyEntry.masterKey]
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
                            ? `~${convertEvers(fees)} ${vm.nativeCurrency}`
                            : intl.formatMessage({ id: 'CALCULATING_HINT' })}
                    </ParamsPanel.Param>

                    {amount?.type === 'token_wallet' && (
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })} row>
                            <div className="enter-send-password__params-amount">
                                <span className="token-amount-text">
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
                                <span className="token-amount-text">
                                    {convertEvers(
                                        amount.type === 'ever_wallet'
                                            ? amount.data.amount
                                            : amount.data.attachedAmount,
                                    )}
                                </span>
                                &nbsp;
                                <span className="root-token-name">
                                    {vm.nativeCurrency}
                                </span>
                            </div>
                        </ParamsPanel.Param>
                    )}

                    {recipient && (
                        <Recipient recipient={recipient} />
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
                {hasTxError && (
                    <div className="enter-send-password__warning">
                        <div className="enter-send-password__warning-message">
                            Tokens may be lost!
                        </div>
                        <ul className="enter-send-password__warning-list">
                            {...txErrors?.map(({ address, error }) => {
                                const copyAddress = (
                                    <CopyText
                                        className="enter-send-password__warning-address"
                                        place="top"
                                        text={address}
                                    >
                                        {convertAddress(address)}
                                        <CopyIcon />
                                    </CopyText>
                                )
                                if (error.type === 'compute_phase') {
                                    return (
                                        <li>Transaction tree execution may fail, because execution failed on {copyAddress} with exit code {error.code}.</li>
                                    )
                                }
                                if (error.type === 'action_phase') {
                                    return (
                                        <li>Transaction tree execution may fail, because action phase failed on {copyAddress} with exit code {error.code}.</li>
                                    )
                                }
                                if (error.type === 'frozen') {
                                    return (
                                        <li>Transaction tree execution may fail, because account {copyAddress} will be frozen due to storage fee debt.</li>
                                    )
                                }
                                if (error.type === 'deleted') {
                                    return (
                                        <li>Transaction tree execution may fail, because account {copyAddress} will be deleted due to storage fee debt.</li>
                                    )
                                }
                                return null
                            })}
                        </ul>
                        {canFixTxError ? (
                            <div className="enter-send-password__warning-hint">
                                Send 0.2 {vm.nativeCurrency} to this address or contact <a href={BROXUS_SUPPORT_LINK} target="_blank" rel="nofollow noopener noreferrer">technical support</a>.
                            </div>
                        ) : (
                            <div className="enter-send-password__warning-hint">
                                Contact <a href={BROXUS_SUPPORT_LINK} target="_blank" rel="nofollow noopener noreferrer">technical support</a>.
                            </div>
                        )}
                        <label className="enter-send-password__warning-label">
                            <Checkbox checked={txErrorConfirmed} onChange={setTxErrorConfirmed} />
                            <span>Send it anyway. I accept the risks.</span>
                        </label>
                    </div>
                )}

                <ButtonGroup>
                    <Button
                        group="small" design="secondary" disabled={submitted && !error}
                        onClick={onBack}
                    >
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button
                        design={hasTxError ? 'error' : 'primary'}
                        disabled={
                            disabled
                            || !!balanceError
                            || (keyEntry.signerName !== 'ledger_key'
                                && !passwordCached
                                && (password == null || password.length === 0))
                            || (submitted && !error)
                            || !fees
                            || (hasTxError && !txErrorConfirmed)
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
