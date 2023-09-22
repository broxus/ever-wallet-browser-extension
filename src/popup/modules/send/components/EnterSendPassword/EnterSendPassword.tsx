import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { KeyboardEvent, ReactNode, useState } from 'react'
import { useIntl } from 'react-intl'

import { MessageAmount } from '@app/models'
import { Amount, AssetIcon, Button, Container, Content, ErrorMessage, Footer, FormControl, Header, Hint, Input, Navbar, ParamsPanel, Select, Switch, usePasswordCache, useViewModel } from '@app/popup/modules/shared'
import { prepareKey } from '@app/popup/utils'
import { convertCurrency, convertEvers, convertPublicKey } from '@app/shared'

import { EnterSendPasswordViewModel } from './EnterSendPasswordViewModel'
import { Recipient } from './Recipient'
import styles from './EnterSendPassword.module.scss'

interface Props {
    keyEntries: nt.KeyStoreEntry[];
    keyEntry: nt.KeyStoreEntry;
    amount?: MessageAmount;
    recipient?: string;
    fees?: string;
    error?: string;
    balanceError?: string;
    loading: boolean;
    transactionId?: string;
    contractType: nt.ContractType;
    context?: nt.LedgerSignatureContext
    title?: ReactNode;
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
        balanceError,
        loading,
        transactionId,
        context,
        title,
        onSubmit,
        onBack,
        onChangeKeyEntry,
    } = props
    const vm = useViewModel(EnterSendPasswordViewModel)
    const intl = useIntl()

    const [submitted, setSubmitted] = useState(false)
    const [password, setPassword] = useState<string>('')
    const [cache, setCache] = useState(false)
    const passwordCached = usePasswordCache(keyEntry.publicKey)
    const keyName = vm.masterKeysNames[keyEntry.masterKey] || convertPublicKey(keyEntry.masterKey)

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
        <Container>
            <Header>
                <Navbar back={onBack}>
                    {title ?? intl.formatMessage({ id: 'CONFIRM_TRANSACTION_BTN_TEXT' })}
                </Navbar>
            </Header>

            <Content>
                {keyEntries.length > 1 ? (
                    <Select
                        className={styles.field}
                        options={keyEntriesOptions}
                        value={keyEntry.publicKey}
                        onChange={changeKeyEntry}
                    />
                ) : null}
                {keyEntry.signerName !== 'ledger_key' ? (
                    !passwordCached && (
                        <div className={styles.field}>
                            <FormControl label={intl.formatMessage({ id: 'PASSWORD_FIELD_LABEL' })}>
                                <Input
                                    autoFocus
                                    type="password"
                                    disabled={loading}
                                    value={password}
                                    onKeyDown={onKeyDown}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <Hint>
                                    {intl.formatMessage(
                                        { id: 'SEED_PASSWORD_FIELD_HINT' },
                                        { name: keyName },
                                    )}
                                </Hint>
                                <ErrorMessage>
                                    {error}
                                </ErrorMessage>
                                <Switch labelPosition="before" checked={cache} onChange={() => setCache(!cache)}>
                                    {intl.formatMessage({ id: 'SEND_MESSAGE_PASSWORD_CACHE_SWITCHER_LABEL' })}
                                </Switch>
                            </FormControl>
                        </div>
                    )
                ) : (
                    <div className={styles.ledger}>
                        {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_APPROVE_WITH_LEDGER_HINT' })}
                    </div>
                )}

                <ParamsPanel>
                    {amount?.type === 'ever_wallet' && (
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })}>
                            <Amount
                                icon={<AssetIcon type="ever_wallet" />}
                                value={convertEvers(amount.data.amount)}
                                currency={vm.nativeCurrency}
                            />
                            <ErrorMessage>{balanceError}</ErrorMessage>
                        </ParamsPanel.Param>
                    )}

                    {amount?.type === 'token_wallet' && (
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })}>
                            <Amount
                                icon={<AssetIcon type="token_wallet" address={amount.data.rootTokenContract} />}
                                value={convertCurrency(amount.data.amount, amount.data.decimals)}
                                currency={amount.data.symbol}
                            />
                            <ErrorMessage>{balanceError}</ErrorMessage>
                        </ParamsPanel.Param>
                    )}

                    {amount?.type === 'token_wallet' && (
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_ATTACHED_AMOUNT' })}>
                            <Amount
                                icon={<AssetIcon type="ever_wallet" />}
                                value={convertEvers(amount.data.attachedAmount)}
                                currency={vm.nativeCurrency}
                            />
                        </ParamsPanel.Param>
                    )}

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_BLOCKCHAIN_FEE' })}>
                        {fees
                            ? (
                                <Amount
                                    approx
                                    icon={<AssetIcon type="ever_wallet" />}
                                    value={convertEvers(fees)}
                                    currency={vm.nativeCurrency}
                                />
                            )
                            : intl.formatMessage({ id: 'CALCULATING_HINT' })}
                    </ParamsPanel.Param>

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
            </Content>

            <Footer>
                <Button
                    disabled={
                        !!balanceError
                        || (keyEntry.signerName !== 'ledger_key'
                            && !passwordCached
                            && (password == null || password.length === 0))
                        || (submitted && !error)
                        || !fees
                    }
                    loading={loading}
                    onClick={trySubmit}
                >
                    {intl.formatMessage({ id: 'CONFIRM_TRANSACTION_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
