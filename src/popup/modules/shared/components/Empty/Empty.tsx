import { memo } from 'react'
import { FormattedMessage } from 'react-intl'

import EmptySrc from '@app/popup/assets/img/empty@2x.png'

import './Empty.scss'


export const Empty = memo(() => (
    <div className="empty">
        <img className="empty__img" src={EmptySrc} alt="" />
        <p className="empty__text">
            <FormattedMessage id="EMPTY_TEXT" values={{ br: <br /> }} />
        </p>
    </div>
))
