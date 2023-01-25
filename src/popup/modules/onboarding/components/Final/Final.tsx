import { memo } from 'react'
import { useIntl } from 'react-intl'

import SignImg from '@app/popup/assets/img/welcome/sign.svg'
import DiscordImg from '@app/popup/assets/img/welcome/discord.svg'
import TgImg from '@app/popup/assets/img/welcome/telegram.svg'
import RedditImg from '@app/popup/assets/img/welcome/reddit.svg'
import TwitterImg from '@app/popup/assets/img/welcome/twitter.svg'
import MdImg from '@app/popup/assets/img/welcome/medium.svg'
import GhImg from '@app/popup/assets/img/welcome/github.svg'
import LandingImg from '@app/popup/assets/img/welcome/landing-min.png'

export const Final = memo((): JSX.Element => {
    const intl = useIntl()

    return (
        <div className="slide slide--landing active">
            <div className="container">
                <div className="slide__wrap">
                    <div className="slide__content slide__animate">
                        <div className="landing-hgroup">
                            <p className="landing-suptitle">
                                {intl.formatMessage({ id: 'WELCOME_WELL_DONE' })}
                            </p>
                            <h1 className="landing-title">
                                {intl.formatMessage({ id: 'WELCOME_OPEN_WALLET' })}
                            </h1>
                        </div>
                        <div className="landing-sign">
                            <img src={SignImg} alt="Follow us in social networks!" />
                        </div>
                        <ul className="soc">
                            <li>
                                <a href="https://discord.gg/6dryaZQNmC" target="_blank" rel="nofollow noopener noreferrer">
                                    <img src={DiscordImg} alt="" />
                                </a>
                            </li>
                            <li>
                                <a href="https://t.me/EVERWallet" target="_blank" rel="nofollow noopener noreferrer">
                                    <img src={TgImg} alt="" />
                                </a>
                            </li>
                            <li>
                                <a href="https://www.reddit.com/r/crypto_is_easy/" target="_blank" rel="nofollow noopener noreferrer">
                                    <img src={RedditImg} alt="" />
                                </a>
                            </li>
                            <li>
                                <a href="https://twitter.com/EVERWallet_en" target="_blank" rel="nofollow noopener noreferrer">
                                    <img src={TwitterImg} alt="" />
                                </a>
                            </li>
                            <li>
                                <a href="https://everwallet.medium.com/about" target="_blank" rel="nofollow noopener noreferrer">
                                    <img src={MdImg} alt="" />
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/broxus/ever-wallet-browser-extension" target="_blank" rel="nofollow noopener noreferrer">
                                    <img src={GhImg} alt="" />
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="slide__pic slide__pic--landing slide__animate">
                        <img src={LandingImg} alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
})
