import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useRef } from 'react'
import { useIntl } from 'react-intl'

import { convertEvers } from '@app/shared'
import { AmountWithFees, AssetIcon, Button, Container, Content, Footer, ParamsPanel, PasswordForm, PasswordFormRef, Space } from '@app/popup/modules/shared'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    currencyName: string;
    balance?: string;
    fees?: string;
    error?: string;
    loading?: boolean;
    onSubmit(password?: string, cache?: boolean): void;
    onBack(): void;
}

export const DeployPreparedMessage = memo((props: Props): JSX.Element => {
    const {
        keyEntry,
        balance,
        loading,
        error,
        fees,
        currencyName,
        onSubmit,
        onBack,
    } = props

    const intl = useIntl()
    const ref = useRef<PasswordFormRef>(null)

    return (
        <Container>
            <Content>
                <Space direction="column" gap="m">
                    <h2>{intl.formatMessage({ id: 'DEPLOY_WALLET_HEADER' })}</h2>

                    <ParamsPanel>
                        <ParamsPanel.Param bold label={intl.formatMessage({ id: 'DEPLOY_WALLET_DETAILS_TERM_BALANCE' })}>
                            <AmountWithFees
                                icon={<AssetIcon type="ever_wallet" />}
                                value={convertEvers(balance)}
                                currency={currencyName}
                                fees={fees}
                            />
                        </ParamsPanel.Param>
                    </ParamsPanel>
                </Space>
            </Content>

            <Footer background>
                <Space direction="column" gap="m">
                    <PasswordForm
                        ref={ref}
                        error={error}
                        allowCache={false}
                        keyEntry={keyEntry}
                        onSubmit={onSubmit}
                    />

                    <Space direction="row" gap="s">
                        <Button design="secondary" onClick={onBack}>
                            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                        </Button>
                        <Button
                            disabled={!fees}
                            loading={loading}
                            onClick={() => ref.current?.submit()}
                        >
                            {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
                        </Button>
                    </Space>
                </Space>
            </Footer>
        </Container>
    )
})
