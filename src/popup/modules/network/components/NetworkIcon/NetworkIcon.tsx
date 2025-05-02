import * as React from 'react'
import classNames from 'classnames'

import sparxSrc from '@app/popup/assets/img/networks/sparx.svg'
import { CONFIG } from '@app/shared'

import styles from './NetworkIcon.module.scss'

type Props = {
    network: string;
    className?: string;
};

export const NetworkIcon: React.FC<Props> = ({ network, className }) => (
    <img
        alt="" width={24} height={24}
        className={classNames(styles.root, className)}
        src={CONFIG.value.blockchains.find(item => item.networkGroup === network)?.icons?.network ?? sparxSrc}
    />
)
