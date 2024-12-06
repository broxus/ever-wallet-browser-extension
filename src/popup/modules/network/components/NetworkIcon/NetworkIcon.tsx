import * as React from 'react'
import classNames from 'classnames'

import { ConnectionDataItem } from '@app/models'
import everscaleSrc from '@app/popup/assets/img/networks/everscale.svg'
// TODO: Add tycho
// import tychoSrc from '@app/popup/assets/img/networks/tycho.svg'
import venomSrc from '@app/popup/assets/img/networks/venom.svg'
import sparxSrc from '@app/popup/assets/img/networks/sparx.svg'

import styles from './NetworkIcon.module.scss'

type Props = {
    network: ConnectionDataItem
    className?: string
}

export const NetworkIcon: React.FC<Props> = ({
    network,
    className,
}) => {
    const src = React.useMemo(() => {
        switch (network.connectionId) {
            case 0:
            case 1:
            case 4:
                return everscaleSrc
            case 8:
                return venomSrc
            default:
                return sparxSrc
        }
    }, [network.connectionId])

    return (
        <img
            alt=""
            className={classNames(styles.root, className)}
            src={src}
        />
    )
}
