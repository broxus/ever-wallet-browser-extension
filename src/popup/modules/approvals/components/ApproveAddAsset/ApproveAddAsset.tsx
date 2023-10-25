import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import classNames from 'classnames'

import TrustedTokenIcon from '@app/popup/assets/img/trusted-token.svg'
import UntrustedTokenIcon from '@app/popup/assets/img/untrusted-token.svg'
import { Amount, Button, Container, Content, Footer, PageLoader, ParamsPanel, Space, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { convertCurrency, TOKENS_MANIFEST_REPO } from '@app/shared'

import { ApprovalNetwork } from '../ApprovalNetwork'
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
            <Content>
                <ApprovalNetwork />

                <ParamsPanel className={styles.panel}>
                    <ParamsPanel.Param>
                        <UserInfo account={vm.account} />
                    </ParamsPanel.Param>
                    <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ORIGIN_TITLE' })}>
                        <WebsiteIcon origin={vm.approval.origin} />
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_NAME' })}>
                        <div className={styles.token}>
                            <div className={styles.name}>{details.name}</div>
                            {vm.tokens && (
                                <img className={styles.trusted} src={vm.token ? TrustedTokenIcon : UntrustedTokenIcon} alt="" />
                            )}
                        </div>
                        {vm.tokens && !vm.token && (
                            <div className={classNames(styles.notification, styles._warning)}>
                                <FormattedMessage
                                    id="APPROVE_ADD_ASSET_NOT_PUBLISHED_NOTE"
                                    values={{
                                        br: <br />,
                                        a: (...parts) => <a href={TOKENS_MANIFEST_REPO} target="_blank" rel="nofollow noopener noreferrer">{parts}</a>,
                                    }}
                                />
                            </div>
                        )}
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_SYMBOL' })}>
                        {details.symbol}
                        {vm.phishingAttempt === PhishingAttempt.Explicit && (
                            <div className={classNames(styles.notification, styles._error)}>
                                <FormattedMessage
                                    id="APPROVE_ADD_ASSET_PHISHING_ATTEMPT_EXPLICIT_NOTE"
                                    values={{ br: <br /> }}
                                />
                            </div>
                        )}
                        {vm.phishingAttempt === PhishingAttempt.SameSymbol && (
                            <div className={classNames(styles.notification, styles._error)}>
                                <FormattedMessage
                                    id="APPROVE_ADD_ASSET_PHISHING_ATTEMPT_SAME_SYMBOL_NOTE"
                                    values={{ br: <br /> }}
                                />
                            </div>
                        )}
                        {vm.phishingAttempt === PhishingAttempt.Suggestion && (
                            <div className={classNames(styles.notification, styles._warning)}>
                                <FormattedMessage
                                    id="APPROVE_ADD_ASSET_PHISHING_ATTEMPT_SUGGESTION_NOTE"
                                    values={{
                                        br: <br />,
                                        a: (...parts) => <a href={TOKENS_MANIFEST_REPO} target="_blank" rel="nofollow noopener noreferrer">{parts}</a>,
                                    }}
                                />
                            </div>
                        )}
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_DECIMALS' })}>
                        {details.decimals}
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_TOKEN_ROOT_CONTRACT_ADDRESS' })}>
                        {details.address}
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_CURRENT_BALANCE' })}>
                        {vm.balance != null
                            ? <Amount value={convertCurrency(vm.balance, details.decimals)} currency={details.symbol} />
                            : intl.formatMessage({ id: 'CALCULATING_HINT' })}
                    </ParamsPanel.Param>
                </ParamsPanel>
            </Content>

            <Footer>
                <Space direction="row" gap="s">
                    <Button design="secondary" onClick={vm.onReject}>
                        {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                    </Button>
                    <Button loading={vm.loading} onClick={vm.onSubmit}>
                        {intl.formatMessage({ id: 'ADD_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
