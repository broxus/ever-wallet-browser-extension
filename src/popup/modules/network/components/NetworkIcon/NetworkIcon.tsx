import * as React from 'react'
import classNames from 'classnames'

import everscaleSrc from '@app/popup/assets/img/networks/everscale.svg'
import tychoSrc from '@app/popup/assets/img/networks/tycho.svg'
import venomSrc from '@app/popup/assets/img/networks/venom.svg'
import sparxSrc from '@app/popup/assets/img/networks/sparx.svg'
import { NETWORK } from '@app/shared'

import styles from './NetworkIcon.module.scss'

type Props = {
    connectionId: number;
    className?: string;
};

export const NetworkIcon: React.FC<Props> = ({ connectionId, className }) => {
    const src = React.useMemo(() => {
        switch (connectionId) {
            case NETWORK.EVERSCALE_RPC:
            case NETWORK.EVERSCALE_GQL:
            case NETWORK.EVERSCALE_TESTNET:
                return everscaleSrc
            case NETWORK.VENOM:
                return venomSrc
            case NETWORK.TYCHO_TESTNET:
                return tychoSrc
            default:
                return sparxSrc
        }
    }, [connectionId])

    return <img alt="" className={classNames(styles.root, className)} src={src} />
}
