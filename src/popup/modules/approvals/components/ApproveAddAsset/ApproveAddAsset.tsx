import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import TrustedTokenIcon from '@app/popup/assets/img/trusted-token.svg'
import UntrustedTokenIcon from '@app/popup/assets/img/untrusted-token.svg'
import { Amount, Button, Card, Container, Content, Footer, Header, Navbar, PageLoader, Space, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { convertCurrency, TOKENS_MANIFEST_REPO } from '@app/shared'
import { Data } from '@app/popup/modules/shared/components/Data'
import { Alert } from '@app/popup/modules/shared/components/Alert/Alert'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { WebsiteIcon } from '../WebsiteIcon'
import { ApproveAddAssetViewModel, PhishingAttempt } from './ApproveAddAssetViewModel'
import styles from './ApproveAddAsset.module.scss'

export const ApproveAddAsset = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveAddAssetViewModel)
    const intl = useIntl()

    const { details } = vm.approval.requestData

    useEffect(() => {
        if (!vm.account && !vm.loading) {
            vm.onReject()
        }
    }, [!!vm.account, vm.loading])

    if (!vm.account) return <PageLoader />

    return (
        <Container>
            <Header className={styles.header}>
                <Navbar>
                    {intl.formatMessage({ id: 'ADD_TOKEN' })}
                </Navbar>
            </Header>

            <Content>
                <Card size="s" bg="layer-1" className={styles.user}>
                    <UserInfo account={vm.account} />
                </Card>

                <Space direction="column" gap="m">
                    <Data
                        dir="v"
                        label={intl.formatMessage({
                            id: 'WEBSITE',
                        })}
                        value={(
                            <WebsiteIcon iconSize="m" origin={vm.approval.origin} />
                        )}
                    />

                    <hr />

                    <Space direction="column" gap="s">
                        <Data
                            label={intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_NAME' })}
                            value={(
                                <Space direction="row" gap="s">
                                    {details.name}
                                    {vm.tokens && (
                                        <img src={vm.token ? TrustedTokenIcon : UntrustedTokenIcon} alt="" />
                                    )}
                                </Space>
                            )}
                        />
                        {vm.tokens && !vm.token && (
                            <Alert
                                size="s"
                                showIcon={false}
                                type="warning"
                                body={(
                                    <FormattedMessage
                                        id="APPROVE_ADD_ASSET_NOT_PUBLISHED_NOTE"
                                        values={{
                                            br: <br />,
                                            a: (...parts) => <a href={TOKENS_MANIFEST_REPO} target="_blank" rel="nofollow noopener noreferrer">{parts}</a>,
                                        }}
                                    />
                                )}
                            />
                        )}
                    </Space>

                    <hr />

                    <Space direction="column" gap="s">
                        <Data
                            label={intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_SYMBOL' })}
                            value={details.symbol}
                        />
                        {vm.phishingAttempt === PhishingAttempt.Explicit && (
                            <Alert
                                size="s"
                                showIcon={false}
                                type="error"
                                body={(
                                    <FormattedMessage
                                        id="APPROVE_ADD_ASSET_PHISHING_ATTEMPT_EXPLICIT_NOTE"
                                        values={{ br: <br /> }}
                                    />
                                )}
                            />
                        )}
                        {vm.phishingAttempt === PhishingAttempt.SameSymbol && (
                            <Alert
                                size="s"
                                showIcon={false}
                                type="error"
                                body={(
                                    <FormattedMessage
                                        id="APPROVE_ADD_ASSET_PHISHING_ATTEMPT_SAME_SYMBOL_NOTE"
                                        values={{ br: <br /> }}
                                    />
                                )}
                            />
                        )}
                        {vm.phishingAttempt === PhishingAttempt.Suggestion && (
                            <Alert
                                size="s"
                                showIcon={false}
                                type="error"
                                body={(
                                    <FormattedMessage
                                        id="APPROVE_ADD_ASSET_PHISHING_ATTEMPT_SUGGESTION_NOTE"
                                        values={{
                                            br: <br />,
                                            a: (...parts) => <a href={TOKENS_MANIFEST_REPO} target="_blank" rel="nofollow noopener noreferrer">{parts}</a>,
                                        }}
                                    />
                                )}
                            />
                        )}
                    </Space>

                    <hr />

                    <Data
                        label={intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_DECIMALS' })}
                        value={details.decimals}
                    />

                    <hr />

                    <Data
                        dir="v"
                        label={intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_TOKEN_ROOT_CONTRACT_ADDRESS' })}
                        value={details.address}
                    />

                    <hr />

                    <Data
                        label={intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_CURRENT_BALANCE' })}
                        value={vm.balance != null
                            ? <Amount value={convertCurrency(vm.balance, details.decimals)} currency={details.symbol} />
                            : intl.formatMessage({ id: 'CALCULATING_HINT' })}
                    />
                </Space>
            </Content>

            <Footer layer>
                <FooterAction>
                    <Button design="neutral" onClick={vm.onReject}>
                        {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                    </Button>
                    <Button design="accent" loading={vm.loading} onClick={vm.onSubmit}>
                        {intl.formatMessage({ id: 'ADD_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
