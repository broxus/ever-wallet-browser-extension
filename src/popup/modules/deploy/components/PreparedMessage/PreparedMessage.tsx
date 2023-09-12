import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useCallback } from 'react'
import { useIntl } from 'react-intl'

import { convertEvers } from '@app/shared'
import { Amount, AssetIcon, Button, Container, Content, Footer, Header, Navbar, ParamsPanel, useEnterPassword, usePasswordCache } from '@app/popup/modules/shared'

import styles from './PreparedMessage.module.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    currencyName: string;
    balance?: string;
    custodians?: string[];
    fees?: string;
    error?: string;
    loading?: boolean;
    onSubmit(password?: string, cache?: boolean): void;
    onBack(): void;
}

export const PreparedMessage = memo((props: Props): JSX.Element => {
    const {
        keyEntry,
        balance,
        custodians,
        loading,
        error,
        fees,
        currencyName,
        onSubmit,
        onBack,
    } = props

    const intl = useIntl()
    const enterPassword = useEnterPassword({ keyEntry, error, loading, onSubmit })
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
        <Container>
            <Header>
                <Navbar back={onBack}>
                    {intl.formatMessage({ id: 'DEPLOY_WALLET_HEADER' })}
                </Navbar>
            </Header>

            <Content>
                <ParamsPanel>
                    <ParamsPanel.Param
                        label={(
                            <span className={styles.hint}>
                                {intl.formatMessage({ id: 'DEPLOY_MULTISIG_PANEL_COMMENT' })}
                            </span>
                        )}
                    />

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'DEPLOY_WALLET_DETAILS_TERM_BALANCE' })}>
                        <Amount
                            icon={<AssetIcon type="ever_wallet" />}
                            value={convertEvers(balance)}
                            currency={currencyName}
                        />
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'DEPLOY_WALLET_DETAILS_TERM_FEE' })}>
                        {fees
                            ? (
                                <Amount
                                    icon={<AssetIcon type="ever_wallet" />}
                                    value={convertEvers(fees)}
                                    currency={currencyName}
                                />
                            )
                            : intl.formatMessage({ id: 'CALCULATING_HINT' })}
                    </ParamsPanel.Param>

                    {custodians?.map((custodian, i) => (
                        <ParamsPanel.Param
                            key={custodian}
                            label={intl.formatMessage(
                                { id: 'DEPLOY_MULTISIG_DETAILS_TERM_CUSTODIAN' },
                                { index: i + 1 },
                            )}
                        >
                            {custodian}
                        </ParamsPanel.Param>
                    ))}
                </ParamsPanel>
            </Content>

            <Footer>
                <Button disabled={!fees || passwordCached == null} onClick={handleDeploy}>
                    {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
