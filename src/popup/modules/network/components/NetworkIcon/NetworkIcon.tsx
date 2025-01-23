import * as React from 'react'
import classNames from 'classnames'

import everscaleSrc from '@app/popup/assets/img/networks/everscale.svg'
import tychoSrc from '@app/popup/assets/img/networks/tycho.svg'
import venomSrc from '@app/popup/assets/img/networks/venom.svg'
import sparxSrc from '@app/popup/assets/img/networks/sparx.svg'
import tonSrc from '@app/popup/assets/img/networks/ton.svg'
import { NETWORK_ID } from '@app/shared'

import styles from './NetworkIcon.module.scss'

type Props = {
    connectionId: number;
    className?: string;
};

export const NetworkIcon: React.FC<Props> = ({ connectionId, className }) => {
    const src = React.useMemo(() => {
        switch (connectionId) {
            case NETWORK_ID.EVERSCALE:
                return everscaleSrc
            case NETWORK_ID.VENOM:
                return venomSrc
            case NETWORK_ID.TYCHO_TESTNET:
                return tychoSrc
            case NETWORK_ID.TON:
                return tonSrc
            default:
                return sparxSrc
        }
    }, [connectionId])

    return <img alt="" className={classNames(styles.root, className)} src={src} />
}
