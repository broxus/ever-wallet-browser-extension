import { memo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import LedgerImg from '@app/popup/assets/img/welcome/ledger.svg'
import MainBG from '@app/popup/assets/img/welcome/main-img-min.png'
import { WALLET_TERMS_URL } from '@app/shared'

interface Props {
    onCreate(): void;
    onImport(): void;
    onLedger(): void;
    onRestore(): void;
}

export const Welcome = memo(({ onCreate, onImport, onLedger, onRestore }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <div className="slide slide--main active">
            <div className="container">
                <div className="slide__wrap">
                    <div className="slide__content slide__animate">
                        <h1 className="main-title">
                            {intl.formatMessage({ id: 'WELCOME_TO_EVER_WALLET' })}
                        </h1>
                        <p className="main-txt">
                            {intl.formatMessage({ id: 'WELCOME_SUBTITLE' })}
                        </p>
                        <div className="main-bar">
                            <button className="btn btn--primery btn--long" onClick={onCreate}>
                                {intl.formatMessage({ id: 'CREATE_A_NEW_WALLET' })}
                            </button>
                            <button className="btn btn--secondary btn--long" onClick={onImport}>
                                {intl.formatMessage({ id: 'SIGN_IN_WITH_SEED_PHRASE' })}
                            </button>
                            <button className="btn btn--secondary btn--long" onClick={onLedger}>
                                <i><img src={LedgerImg} alt="" /></i>
                                <span>{intl.formatMessage({ id: 'SIGN_IN_WITH_LEDGER' })}</span>
                            </button>
                            <div className="main-upload">
                                <button className="btn btn--ghost btn--long" onClick={onRestore}>
                                    {intl.formatMessage({ id: 'RESTORE_FROM_BACKUP' })}
                                </button>
                            </div>
                        </div>
                        <div className="main-sub">
                            <FormattedMessage
                                id="WELCOME_AGREEMENT"
                                values={{
                                    a: (text) => (<a href={WALLET_TERMS_URL} target="_blank">{text}</a>),
                                }}
                            />
                        </div>
                    </div>

                    <div className="slide__pic slide__animate">
                        <img src={MainBG} alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
})
