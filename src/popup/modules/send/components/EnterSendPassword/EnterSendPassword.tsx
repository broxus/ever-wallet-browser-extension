import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { KeyboardEvent, ReactNode, useState } from 'react'
import { useIntl } from 'react-intl'

import { MessageAmount } from '@app/models'
import {
    Amount,
    AssetIcon,
    Button,
    Card,
    ConnectionStore,
    Container,
    Content,
    ErrorMessage,
    Footer,
    FormControl,
    Header,
    KeySelect,
    Navbar,
    PasswordInput,
    Space,
    TransactionTreeSimulationErrorPanel,
    usePasswordCache,
    useResolve,
    UserInfo,
    useViewModel,
} from '@app/popup/modules/shared'
import { prepareKey } from '@app/popup/utils'
import { convertCurrency, convertEvers } from '@app/shared'
import { Data } from '@app/popup/modules/shared/components/Data'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

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
    buttonText?: string;
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
        buttonText,
        withHeader = true, // TODO: refactor
        onSubmit,
        onBack,
        onChangeKeyEntry,
    } = props
    const vm = useViewModel(EnterSendPasswordViewModel, (model) => {
        model.keyEntry = keyEntry
    }, [keyEntry])
    const intl = useIntl()
    const { symbol } = useResolve(ConnectionStore)

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

                    <Card size="s" bg="layer-1" padding="xs">
                        <UserInfo account={account} />
                    </Card>

                    {recipient && (
                        <Recipient recipient={recipient} />
                    )}

                    <hr />

                    {amount?.type === 'ever_wallet' && (
                        <Data
                            dir="v"
                            label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })}
                            value={(
                                <Space direction="column" gap="xs">
                                    <Amount
                                        icon={<AssetIcon type="ever_wallet" />}
                                        value={convertEvers(amount.data.amount)}
                                        currency={vm.nativeCurrency}
                                    />
                                    <ErrorMessage>{balanceError}</ErrorMessage>
                                </Space>
                            )}
                        />
                    )}

                    {amount?.type === 'token_wallet' && (
                        <>
                            <Data
                                dir="v"
                                label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })}
                                value={(
                                    <Space direction="column" gap="xs">
                                        <Amount
                                            icon={<AssetIcon type="token_wallet" address={amount.data.rootTokenContract} />}
                                            value={convertCurrency(amount.data.amount, amount.data.decimals)}
                                            currency={amount.data.symbol}
                                        />
                                        <ErrorMessage>{balanceError}</ErrorMessage>
                                    </Space>
                                )}
                            />

                            <hr />

                            <Data
                                dir="v"
                                label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_ATTACHED_AMOUNT' })}
                                value={(
                                    <Amount
                                        precise
                                        icon={<AssetIcon type="ever_wallet" />}
                                        value={convertEvers(amount.data.attachedAmount)}
                                        currency={vm.nativeCurrency}
                                    />
                                )}
                            />
                        </>
                    )}

                    {!balanceError && (
                        <>
                            <hr />
                            <Data
                                dir="v"
                                label={intl.formatMessage({ id: 'NETWORK_FEE' })}
                                value={(
                                    fees
                                        ? <Amount approx value={convertEvers(fees)} currency={symbol} />
                                        : intl.formatMessage({ id: 'CALCULATING_HINT' })
                                )}
                            />
                        </>
                    )}

                    {transactionId && (
                        <Data
                            dir="v"
                            label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_TRANSACTION_ID' })}
                            value={transactionId}
                        />
                    )}

                    {(keyEntry.signerName === 'ledger_key' || passwordCached) && (
                        <ErrorMessage>{error}</ErrorMessage>
                    )}
                </Space>
            </Content>

            <Footer layer>
                <Space direction="column" gap="l">
                    {hasTxError && (
                        <TransactionTreeSimulationErrorPanel
                            errors={txErrors}
                            symbol={vm.nativeCurrency}
                            confirmed={txErrorConfirmed}
                            onConfirmChange={setTxErrorConfirmed}
                        />
                    )}

                    {keyEntry.signerName !== 'ledger_key' && !passwordCached && (
                        <FormControl>
                            <PasswordInput
                                autoFocus
                                size="xs"
                                disabled={loading}
                                value={password}
                                invalid={!!error}
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

                    {/* TODO: redesign */}
                    {(keyEntry.signerName === 'ledger_key' || passwordCached) && (
                        <KeySelect value={keyEntry} keyEntries={keyEntries} onChange={onChangeKeyEntry} />
                    )}

                    <FooterAction>
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
                            width={200}
                        >
                            {buttonText ?? (keyEntry.signerName === 'ledger_key'
                                ? intl.formatMessage({ id: 'CONFIRM_ON_LEDGER_BTN_TEXT' })
                                : intl.formatMessage({ id: 'CONFIRM_TRANSACTION_BTN_TEXT' }))}
                        </Button>
                    </FooterAction>
                </Space>
            </Footer>
        </Container>
    )
})
