import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { KeyboardEvent, ReactNode, useState } from 'react'
import { useIntl } from 'react-intl'

import { MessageAmount } from '@app/models'
import {
    Amount,
    AmountWithFees,
    AssetIcon,
    Button,
    Container,
    Content,
    ErrorMessage,
    Footer,
    FormControl,
    Header,
    KeySelect,
    Navbar,
    ParamsPanel,
    PasswordInput,
    Space,
    TransactionTreeSimulationErrorPanel,
    usePasswordCache,
    UserInfo,
    useViewModel,
} from '@app/popup/modules/shared'
import { prepareKey } from '@app/popup/utils'
import { convertCurrency, convertEvers } from '@app/shared'

import { EnterSendPasswordViewModel } from './EnterSendPasswordViewModel'
import { Recipient } from './Recipient'

interface Props {
    account: nt.AssetsList;
    keyEntries: nt.KeyStoreEntry[];
    keyEntry: nt.KeyStoreEntry;
    amount?: MessageAmount;
    recipient?: string;
    fees?: string;
    error?: string;
    txErrors?: nt.TransactionTreeSimulationError[];
    balanceError?: string;
    loading: boolean;
    transactionId?: string;
    context?: nt.LedgerSignatureContext
    title?: ReactNode;
    withHeader?: boolean;
    onSubmit(password: nt.KeyPassword): void;
    onBack(): void;
    onChangeKeyEntry(keyEntry: nt.KeyStoreEntry): void;
}

export const EnterSendPassword = observer((props: Props): JSX.Element | null => {
    const {
        account,
        keyEntries,
        keyEntry,
        amount,
        recipient,
        fees,
        error,
        txErrors,
        balanceError,
        loading,
        transactionId,
        context,
        title,
        withHeader = true, // TODO: refactor
        onSubmit,
        onBack,
        onChangeKeyEntry,
    } = props
    const vm = useViewModel(EnterSendPasswordViewModel, (model) => {
        model.keyEntry = keyEntry
    }, [keyEntry])
    const intl = useIntl()

    const [submitted, setSubmitted] = useState(false)
    const [password, setPassword] = useState<string>('')
    const [txErrorConfirmed, setTxErrorConfirmed] = useState(false)
    const passwordCached = usePasswordCache(keyEntry.publicKey)
    const hasTxError = txErrors && txErrors.length > 0

    const trySubmit = async () => {
        const wallet = account.tonWallet.contractType

        onSubmit(prepareKey({
            cache: vm.cache,
            keyEntry,
            password,
            context,
            wallet,
        }))
        setSubmitted(true)
    }

    const onKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
        const keyCode = event.which || event.keyCode
        if (keyCode === 13) {
            await trySubmit()
        }
    }

    return (
        <Container>
            {withHeader && (
                <Header>
                    <Navbar back={onBack}>
                        {title ?? intl.formatMessage({ id: 'CONFIRM_TRANSACTION_BTN_TEXT' })}
                    </Navbar>
                </Header>
            )}

            <Content>
                <Space direction="column" gap="m">
                    {!withHeader && (
                        <h2>{title ?? intl.formatMessage({ id: 'CONFIRM_TRANSACTION_BTN_TEXT' })}</h2>
                    )}

                    <ParamsPanel>
                        <ParamsPanel.Param>
                            <UserInfo account={account} />
                        </ParamsPanel.Param>
                        {amount?.type === 'ever_wallet' && (
                            <ParamsPanel.Param bold label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })}>
                                <AmountWithFees
                                    icon={<AssetIcon type="ever_wallet" />}
                                    value={convertEvers(amount.data.amount)}
                                    currency={vm.nativeCurrency}
                                    fees={fees}
                                    error={balanceError && <ErrorMessage>{balanceError}</ErrorMessage>}
                                />
                            </ParamsPanel.Param>
                        )}

                        {amount?.type === 'token_wallet' && (
                            <ParamsPanel.Param bold label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })}>
                                <AmountWithFees
                                    icon={<AssetIcon type="token_wallet" address={amount.data.rootTokenContract} />}
                                    value={convertCurrency(amount.data.amount, amount.data.decimals)}
                                    currency={amount.data.symbol}
                                    fees={fees}
                                    error={balanceError && <ErrorMessage>{balanceError}</ErrorMessage>}
                                />
                                <ErrorMessage>{balanceError}</ErrorMessage>
                            </ParamsPanel.Param>
                        )}

                        {amount?.type === 'token_wallet' && (
                            <ParamsPanel.Param bold label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_ATTACHED_AMOUNT' })}>
                                <Amount
                                    precise
                                    icon={<AssetIcon type="ever_wallet" />}
                                    value={convertEvers(amount.data.attachedAmount)}
                                    currency={vm.nativeCurrency}
                                />
                            </ParamsPanel.Param>
                        )}

                        {transactionId && (
                            <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_TRANSACTION_ID' })}>
                                {transactionId}
                            </ParamsPanel.Param>
                        )}

                        {recipient && (
                            <Recipient recipient={recipient} />
                        )}
                    </ParamsPanel>

                    {(keyEntry.signerName === 'ledger_key' || passwordCached) && (
                        <ErrorMessage>{error}</ErrorMessage>
                    )}
                </Space>
            </Content>

            <Footer background>
                <Space direction="column" gap="m">
                    {hasTxError && (
                        <TransactionTreeSimulationErrorPanel
                            errors={txErrors}
                            symbol={vm.nativeCurrency}
                            confirmed={txErrorConfirmed}
                            onConfirmChange={setTxErrorConfirmed}
                        />
                    )}

                    {keyEntry.signerName !== 'ledger_key' && !passwordCached && (
                        <FormControl invalid={!!error}>
                            <PasswordInput
                                autoFocus
                                disabled={loading}
                                value={password}
                                suffix={(
                                    <KeySelect
                                        appearance="button"
                                        value={keyEntry}
                                        keyEntries={keyEntries}
                                        onChange={onChangeKeyEntry}
                                    />
                                )}
                                onKeyDown={onKeyDown}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <ErrorMessage>
                                {error}
                            </ErrorMessage>
                        </FormControl>
                    )}

                    {(keyEntry.signerName === 'ledger_key' || passwordCached) && (
                        <KeySelect value={keyEntry} keyEntries={keyEntries} onChange={onChangeKeyEntry} />
                    )}
                    <Button
                        disabled={
                            !!balanceError
                            || (keyEntry.signerName !== 'ledger_key'
                                && !passwordCached
                                && (password == null || password.length === 0))
                            || (submitted && !error)
                            || !fees
                            || (hasTxError && !txErrorConfirmed)
                        }
                        loading={loading}
                        onClick={trySubmit}
                    >
                        {keyEntry.signerName === 'ledger_key'
                            ? intl.formatMessage({ id: 'CONFIRM_ON_LEDGER_BTN_TEXT' })
                            : intl.formatMessage({ id: 'CONFIRM_TRANSACTION_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
