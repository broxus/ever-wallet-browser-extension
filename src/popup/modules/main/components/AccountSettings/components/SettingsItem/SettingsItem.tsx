import { memo } from 'react'
import classNames from 'classnames'

import { Icon } from '@app/popup/modules/shared'
import { Icons } from '@app/popup/icons'

import styles from './SettingsItem.module.scss'

export interface SettingsItemProps {
    label: string;
    icon: keyof typeof Icons;
    onClick: () => void
    danger?: boolean;
}

export const SettingsItem = memo(({ label, icon, danger, onClick }: SettingsItemProps) => (
    <div className={classNames(styles.main, { [styles._danger]: danger })} onClick={onClick}>
        <div className={styles.text}>
            {label}
        </div>
        <div>
            <Icon
                icon={icon}
                width={20}
                height={20}
            />
        </div>
    </div>
))
