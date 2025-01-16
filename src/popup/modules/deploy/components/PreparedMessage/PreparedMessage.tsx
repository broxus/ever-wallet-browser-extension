import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useState } from 'react'
import { useIntl } from 'react-intl'

import { convertEvers, closeCurrentWindow, convertPublicKey } from '@app/shared'
import { Amount, AssetIcon, Button, Card, Container, Content, Footer, Header, Navbar, SlidingPanel, Space, UserInfo } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import styles from './PreparedMessage.module.scss'
import { Confirm } from './Confirm'
import { MultisigData } from '../../store'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    account?: nt.AssetsList;
    balance?: string;
    fees?: string;
    error?: string;
    loading?: boolean;
    onSubmit(password?: string, cache?: boolean): Promise<boolean>;
    onBack(): void;
    data?: MultisigData;
}

export const PreparedMessage = memo((props: Props): JSX.Element => {
    const { keyEntry, balance, data, loading, account, error, fees, onSubmit, onBack } = props

    const intl = useIntl()

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <SlidingPanel onClose={() => setIsOpen(false)} active={isOpen} showClose={false}>
                <Confirm
                    keyEntry={keyEntry} account={account!} fees={fees}
                    loading={loading} error={error} onSubmit={onSubmit}
                    onClose={closeCurrentWindow}
                />
            </SlidingPanel>

            <Container>
                <Header>
                    <Navbar back={onBack}>{intl.formatMessage({ id: 'CONFIRM_DEPLOY' })}</Navbar>
                </Header>

                <Content>
                    <Space direction="column" gap="l">
                        <Card size="s" bg="layer-1" className={styles.card}>
                            <UserInfo account={account!} />
                        </Card>

                        <Space direction="column" gap="xs">
                            <span>{intl.formatMessage({ id: 'DEPLOY_WALLET_FUNDS' })}</span>
                            <Space direction="row" gap="xs" className={styles.row}>
                                <span className={styles.label}>{intl.formatMessage({ id: 'DEPLOY_WALLET_DETAILS_TERM_BALANCE' })}</span>

                                <Amount
                                    precise icon={<AssetIcon type="ever_wallet" />} className={styles.amount}
                                    value={convertEvers(balance || '0')}
                                />
                            </Space>
                            <Space direction="row" gap="xs" className={styles.row}>
                                <span className={styles.label}> {intl.formatMessage({ id: 'NETWORK_FEE' })}</span>

                                <Amount
                                    precise icon={<AssetIcon type="ever_wallet" />} className={styles.amount}
                                    value={`-${convertEvers(fees || '0')}`}
                                />
                            </Space>
                        </Space>

                        <hr />

                        <Space direction="column" gap="xs">
                            <span>{intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_LIST_CUSTODIANS_HEADER' })}</span>

                            {data?.custodians?.map((item, index) => (
                                <Space direction="row" gap="xs" className={styles.row}>
                                    <span className={styles.label}>#{index + 1}</span>

                                    <span className={styles.value}>{convertPublicKey(item, 12)}</span>
                                </Space>
                            ))}
                        </Space>

                        <hr />

                        {(data?.custodians.length || 0) > 1 && (
                            <>
                                <Space direction="column" gap="xs">
                                    <span>{intl.formatMessage({ id: 'Details' })}</span>

                                    <Space direction="row" gap="xs" className={styles.row}>
                                        <span className={styles.label}>{intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_MINIMUM_CONFIRMATION' })}</span>

                                        <span className={styles.value}>
                                            {data?.reqConfirms} {intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_FIELD_COUNT_HINT' }, { count: data?.custodians.length })}
                                        </span>
                                    </Space>
                                    <Space direction="row" gap="xs" className={styles.row}>
                                        <span className={styles.label}>{intl.formatMessage({ id: 'DEPLOY_MULTISIG_FORM_EXPIRATION_HEADER' })}</span>

                                        <span className={styles.value}>{data?.expirationTime} hours</span>
                                    </Space>
                                </Space>

                                <hr />
                            </>
                        )}
                    </Space>
                </Content>

                <Footer background>
                    <FooterAction>
                        <Button onClick={() => setIsOpen(true)}>{intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}</Button>
                    </FooterAction>
                </Footer>
            </Container>
        </>
    )
})
