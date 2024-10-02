import React from 'react'
import { observer } from 'mobx-react-lite'

import { RoundedIcon } from '@app/popup/modules/shared/components/RoundedIcon'
import { Icon } from '@app/popup/modules/shared/components/Icon'

import styles from './index.module.scss'

type Item = {
    icon?: React.ReactNode;
    text: string;
    arrow?: boolean;
    onClick?: () => void;
}

type Props = {
    items: Item[]
}

export const NavMenu: React.FC<Props> = observer(({
    items,
}) => (
    <div className={styles.root}>
        {items.map(item => (
            <button type="button" className={styles.item} onClick={item.onClick}>
                {item.icon && (
                    <RoundedIcon icon={item.icon} />
                )}
                {item.text}
                {item.arrow && (
                    <Icon icon="chevronRight" className={styles.arrow} />
                )}
            </button>
        ))}
    </div>
))
