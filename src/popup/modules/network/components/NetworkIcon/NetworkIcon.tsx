import * as React from 'react'
import classNames from 'classnames'

import sparxSrc from '@app/popup/assets/img/networks/sparx.svg'
import type { ConnectionConfig } from '@app/shared'

import styles from './NetworkIcon.module.scss'

type Props = {
    networkGroup: string;
    className?: string;
    config: ConnectionConfig
};

export const NetworkIcon: React.FC<Props> = ({ networkGroup, config, className }) => (
    <img
        alt="" width={24} height={24}
        className={classNames(styles.root, className)}
        src={config.blockchainsByGroup[networkGroup]?.icons?.network ?? sparxSrc}
    />
)
