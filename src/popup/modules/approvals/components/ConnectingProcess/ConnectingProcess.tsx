import { memo } from 'react'
import { useIntl } from 'react-intl'

import TonWalletLogo from '@app/popup/assets/img/ton-wallet-logo.svg'
import { WebsiteIcon } from '@app/popup/modules/approvals/components/WebsiteIcon'

import './ConnectingProcess.scss'

export const ConnectingProcess = memo((): JSX.Element => {
    const intl = useIntl()

    return (
        <div className="connecting-process">
            <h2 className="connecting-process__heading">
                {intl.formatMessage({ id: 'CONNECTING_HINT' })}
            </h2>
            <div className="connecting-process__container">
                <WebsiteIcon />
                <p className="connecting-process__animation">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                </p>
                <img src={TonWalletLogo} alt="" />
            </div>
        </div>
    )
})
