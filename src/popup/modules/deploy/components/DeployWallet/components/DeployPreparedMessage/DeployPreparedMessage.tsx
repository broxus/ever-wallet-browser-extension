import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useState } from 'react'
import { useIntl } from 'react-intl'

import {
    Amount,
    AssetIcon,
    Button,
    Card,
    ConnectionStore,
    Container,
    Content,
    Footer,
    PasswordForm,
    Space,
    usePasswordForm,
    useResolve,
    UserInfo,
} from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { convertEvers } from '@app/shared'
import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'

import styles from './DeployPreparedMessage.module.scss'
import { DeploySuccess } from '../../../DeploySuccess'

interface Props {
    keyEntry: nt.KeyStoreEntry | undefined;
    account: nt.AssetsList | undefined;
    fees?: string;
    balance?: string;
    error?: string;
    loading?: boolean;
    onSubmit(password?: string): Promise<boolean>;
    onClose(): void;
}

export const DeployPreparedMessage = memo((props: Props): JSX.Element => {
    const { keyEntry, account, loading, error, fees, onClose, onSubmit, balance } = props
    const connection = useResolve(ConnectionStore)

    const intl = useIntl()
    const { form, isValid, handleSubmit } = usePasswordForm(keyEntry)

    const [showPassword, setShowPassword] = useState(false)
    const [isDeployed, setIsDeployed] = useState(false)

    const handleConfirm = async (password?: string) => {
        if (!fees || !isValid) return
        const isSuccess = await onSubmit(password)

        if (isSuccess) {
            setIsDeployed(true)
        }
    }

    if (isDeployed) {
        return <DeploySuccess onSuccess={onClose} />
    }

    return (
        <>
            <SlidingPanelHeader
                title={intl.formatMessage({ id: 'DEPLOY_WALLET_HEADER' })}
                onClose={onClose}
            />
            <Container>
                <Content>
                    <Space direction="column" gap="m">
                        <Card
                            size="s" bg="layer-3" padding="xs"
                        >
                            {account && <UserInfo account={account} />}
                        </Card>

                        {showPassword ? (
                            <PasswordForm
                                form={form}
                                error={error}
                                keyEntry={keyEntry}
                                onSubmit={handleSubmit(handleConfirm)}
                            />
                        ) : (
                            <Space direction="column" gap="xs">
                                <span>{intl.formatMessage({ id: 'DEPLOY_WALLET_FUNDS' })}</span>
                                <Space direction="row" gap="xs" className={styles.row}>
                                    <span className={styles.label}>
                                        {intl.formatMessage({ id: 'DEPLOY_WALLET_DETAILS_TERM_BALANCE' })}
                                    </span>

                                    <Amount
                                        precise
                                        icon={<AssetIcon type="ever_wallet" />}
                                        className={styles.amount}
                                        value={convertEvers(connection.decimals, balance || '0')}
                                    />
                                </Space>
                                <Space direction="row" gap="xs" className={styles.row}>
                                    <span className={styles.label}> {intl.formatMessage({ id: 'NETWORK_FEE' })}</span>

                                    <Amount
                                        precise
                                        icon={<AssetIcon type="ever_wallet" />}
                                        className={styles.amount}
                                        value={`-${convertEvers(connection.decimals, fees || '0')}`}
                                    />
                                </Space>
                            </Space>
                        )}
                    </Space>
                </Content>

                <Footer>
                    <FooterAction>
                        {showPassword ? (
                            <Button
                                disabled={!fees || !isValid}
                                loading={loading}
                                onClick={handleSubmit(handleConfirm)}
                            >
                                {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                            </Button>
                        ) : (
                            <Button key="next" design="accent" onClick={() => setShowPassword(true)}>
                                {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
                            </Button>
                        )}
                    </FooterAction>
                </Footer>
            </Container>
        </>
    )
})
