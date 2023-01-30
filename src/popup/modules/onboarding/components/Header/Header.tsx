import { memo, useMemo } from 'react'
import classNames from 'classnames'

import EverWalletImg from '@app/popup/assets/img/welcome/ever-wallet.svg'
import { LOCALES } from '@app/popup/modules/shared'

interface Props {
    selectedLocale: string;
    setLocale(value: string): void;
}

export const Header = memo(({ selectedLocale, setLocale }: Props): JSX.Element => {
    const title = useMemo(() => LOCALES.find(({ name }) => name === selectedLocale)?.title ?? '', [selectedLocale])

    return (
        <header className="header">
            <div className="container">
                <div className="header__wrap">
                    <div className="header__logo">
                        <img src={EverWalletImg} alt="EVER Wallet" />
                    </div>
                    <div className="lang">
                        <div className="lang__main">
                            {title}
                        </div>
                        <div className="lang__drop">
                            <ul className="lang__list">
                                {LOCALES.map(({ name, title }) => (
                                    <li key={name}>
                                        <button
                                            type="button"
                                            className={classNames('lang__list-btn', {
                                                active: selectedLocale === name,
                                            })}
                                            onClick={() => setLocale(name)}
                                        >
                                            {title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
})
