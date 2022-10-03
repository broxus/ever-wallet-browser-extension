import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import TrustedTokenIcon from '@app/popup/assets/img/trusted-token.svg'
import UntrustedTokenIcon from '@app/popup/assets/img/untrusted-token.svg'
import {
    AssetIcon, Button, ButtonGroup, Content, Footer, useViewModel,
} from '@app/popup/modules/shared'
import { convertCurrency, convertTokenName, TOKENS_MANIFEST_REPO } from '@app/shared'

import { Approval } from '../Approval'
import {
    ApproveAddAssetViewModel,
    PhishingAttempt,
    TokenNotificationType,
} from './ApproveAddAssetViewModel'

import './ApproveAddAsset.scss'

export const ApproveAddAsset = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveAddAssetViewModel)
    const intl = useIntl()

    const { details } = vm.approval.requestData

    useEffect(() => {
        if (!vm.account && !vm.loading) {
            vm.onReject()
        }
    }, [!!vm.account, vm.loading])

    if (!vm.account) return null

    return (
        <Approval
            className="approval--add-tip3-token"
            title={intl.formatMessage({ id: 'APPROVE_ADD_ASSET_APPROVAL_TITLE' })}
            account={vm.account}
            origin={vm.approval.origin}
            networkName={vm.selectedConnection.name}
        >
            <Content>
                <div className="approval__spend-details">
                    <div className="approval__spend-details-param">
                        <span className="approval__spend-details-param-desc">
                            {intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_NAME' })}
                        </span>
                        <div className="approval__spend-details-param-value approval--add-tip3-token__token-name">
                            <AssetIcon
                                className="root-token-icon noselect"
                                type="token_wallet"
                                address={details.address}
                                old={details.version !== 'Tip3'}
                            />
                            <div className="root-token-name">{details.name}</div>
                            {vm.tokensMeta && (
                                <img src={vm.manifestData ? TrustedTokenIcon : UntrustedTokenIcon} alt="" />
                            )}
                        </div>
                        {vm.tokensMeta && !vm.manifestData && (
                            <div className={getTokenNotificationClassName(TokenNotificationType.Error)}>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: intl.formatMessage(
                                            { id: 'APPROVE_ADD_ASSET_NOT_PUBLISHED_NOTE' },
                                            { url: TOKENS_MANIFEST_REPO },
                                            { ignoreTag: true },
                                        ),
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="approval__spend-details-param">
                        <span className="approval__spend-details-param-desc">
                            {intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_SYMBOL' })}
                        </span>
                        <span className="approval__spend-details-param-value">
                            {details.symbol}
                        </span>
                        {vm.phishingAttempt === PhishingAttempt.Explicit && (
                            <div className={getTokenNotificationClassName(TokenNotificationType.Error)}>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: intl.formatMessage(
                                            { id: 'APPROVE_ADD_ASSET_PHISHING_ATTEMPT_EXPLICIT_NOTE' },
                                            undefined,
                                            { ignoreTag: true },
                                        ),
                                    }}
                                />
                            </div>
                        )}
                        {vm.phishingAttempt === PhishingAttempt.SameSymbol && (
                            <div className={getTokenNotificationClassName(TokenNotificationType.Error)}>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: intl.formatMessage(
                                            { id: 'APPROVE_ADD_ASSET_PHISHING_ATTEMPT_SAME_SYMBOL_NOTE' },
                                            undefined,
                                            { ignoreTag: true },
                                        ),
                                    }}
                                />
                            </div>
                        )}
                        {vm.phishingAttempt === PhishingAttempt.Suggestion && (
                            <div className={getTokenNotificationClassName(TokenNotificationType.Warning)}>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: intl.formatMessage(
                                            { id: 'APPROVE_ADD_ASSET_PHISHING_ATTEMPT_SUGGESTION_NOTE' },
                                            { url: TOKENS_MANIFEST_REPO },
                                            { ignoreTag: true },
                                        ),
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="approval__spend-details-param">
                        <span className="approval__spend-details-param-desc">
                            {intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_DECIMALS' })}
                        </span>
                        <span className="approval__spend-details-param-value">
                            {details.decimals}
                        </span>
                    </div>
                    <div className="approval__spend-details-param">
                        <span className="approval__spend-details-param-desc">
                            {intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_TOKEN_ROOT_CONTRACT_ADDRESS' })}
                        </span>
                        <span className="approval__spend-details-param-value">
                            {details.address}
                        </span>
                    </div>
                    <div className="approval__spend-details-param">
                        <span className="approval__spend-details-param-desc">
                            {intl.formatMessage({ id: 'APPROVE_ADD_ASSET_TERM_CURRENT_BALANCE' })}
                        </span>
                        <span className="approval__spend-details-param-value">
                            {vm.balance != null
                                ? `${convertCurrency(
                                    vm.balance,
                                    details.decimals,
                                )} ${convertTokenName(details.symbol)}`
                                : intl.formatMessage({ id: 'CALCULATING_HINT' })}
                        </span>
                    </div>
                </div>
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button design="secondary" onClick={vm.onReject}>
                        {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                    </Button>
                    <Button disabled={vm.loading} onClick={vm.onSubmit}>
                        {intl.formatMessage({ id: 'ADD_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Approval>
    )
})

function getTokenNotificationClassName(type: TokenNotificationType): string {
    const baseClass = 'approval__spend-details-param-notification'
    const typeName = type === TokenNotificationType.Error ? 'error' : 'warning'

    return `${baseClass} ${baseClass}--${typeName}`
}
