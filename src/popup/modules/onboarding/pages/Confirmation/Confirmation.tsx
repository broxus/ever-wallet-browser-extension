import { memo } from 'react'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Space } from '@app/popup/modules/shared'
import FinalImg from '@app/popup/assets/img/final/final.png'
import CircleBig from '@app/popup/assets/img/welcome/circle-line-1.png'
import CircleSmall from '@app/popup/assets/img/welcome/circle-line-2.png'

import s from './Confirmation.module.scss'

export const Confirmation = memo((): JSX.Element => {
    const intl = useIntl()

    return (
        <div className={s.container}>
            <div className={s.ellipseOne} />
            <div className={s.ellipseTwo} />
            <img className={s.circleBig} src={CircleBig} alt="circle1" />
            <img className={s.circleSmall} src={CircleSmall} alt="circle2" />
            <div className={s.wrap}>
                <div className={s.header}>
                    <h2 className={s.title}>
                        {intl.formatMessage({ id: 'WELCOME_OPEN_WALLET' })}
                    </h2>
                    <p className={s.text}>
                        Follow us in social networks!
                    </p>
                </div>

                <Space direction="row" gap="l" className={s.socialRow}>
                    <button type="button" className={s.buttonSocial}>
                        {Icons.twitter}
                    </button>
                    <button type="button" className={s.buttonSocial}>
                        {Icons.medium}
                    </button>
                    <button type="button" className={s.buttonSocial}>
                        {Icons.discord}
                    </button>
                    <button type="button" className={s.buttonSocial}>
                        {Icons.git}
                    </button>
                    <button type="button" className={s.buttonSocial}>
                        {Icons.telegram}
                    </button>
                    <button type="button" className={s.buttonSocial}>
                        {Icons.broxus}
                    </button>
                </Space>
            </div>
            <img className={s.finalImg} src={FinalImg} alt="Follow us in social networks!" />
        </div>
    )
})
