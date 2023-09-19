import { memo } from 'react'
import { useIntl } from 'react-intl'

import { Button, Space } from '@app/popup/modules/shared'
import DiscordIcon from '@app/popup/assets/icons/discord.svg'
import TgIcon from '@app/popup/assets/icons/telegram.svg'
import TwitterIcon from '@app/popup/assets/icons/twitter.svg'
import MdIcon from '@app/popup/assets/icons/medium.svg'
import GitIcon from '@app/popup/assets/icons/git.svg'
import BroxusIcon from '@app/popup/assets/icons/broxus.svg'
import FinalImg from '@app/popup/assets/img/final/final-img.png'
import FinalPhone from '@app/popup/assets/img/final/final-phone.png'
import CircleBig from '@app/popup/assets/img/welcome/circle-line-1.png'
import CircleSmall from '@app/popup/assets/img/welcome/circle-line-2.png'

import s from './Confirmation.module.scss'

export const Confirmation = memo((): JSX.Element => {
    const intl = useIntl()

    return (
        <div className={s.checkSeed}>
            <div className={s.container}>
                <div className={s.ellipseOne} />
                <div className={s.ellipseTwo} />
                <img className={s.circleBig} src={CircleBig} alt="circle1" />
                <img className={s.circleSmall} src={CircleSmall} alt="circle2" />
                <div className={s.wrap}>
                    <div className={s.header}>
                        <Space direction="column" gap="l">
                            <h2 className={s.title}>
                                {intl.formatMessage({ id: 'WELCOME_OPEN_WALLET' })}
                            </h2>
                            <p className={s.text}>
                                Follow us in social networks!
                            </p>
                        </Space>
                    </div>

                    <Space direction="row" gap="l" className={s.socialRow}>
                        <Button design="secondary" className={s.buttonSocial}>
                            <TwitterIcon />
                        </Button>
                        <Button design="secondary" className={s.buttonSocial}>
                            <MdIcon />
                        </Button>
                        <Button design="secondary" className={s.buttonSocial}>
                            <DiscordIcon />
                        </Button>
                        <Button design="secondary" className={s.buttonSocial}>
                            <GitIcon />
                        </Button>
                        <Button design="secondary" className={s.buttonSocial}>
                            <TgIcon />
                        </Button>
                        <Button design="secondary" className={s.buttonSocial}>
                            <BroxusIcon />
                        </Button>
                    </Space>
                </div>
                <div className={s.slidePic}>
                    <div className={s.landingSign}>
                        <img src={FinalImg} alt="Follow us in social networks!" />
                    </div>
                    <img src={FinalPhone} alt="" />
                </div>
            </div>
        </div>
    )
})
