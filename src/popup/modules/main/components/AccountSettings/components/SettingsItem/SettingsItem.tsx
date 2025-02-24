import { memo, ReactNode } from 'react'
import classNames from 'classnames'

import { Box, Icon } from '@app/popup/modules/shared'
import { Icons } from '@app/popup/icons'

import styles from './SettingsItem.module.scss'

export interface SettingsItemProps {
    label: string;
    iconName?: keyof typeof Icons;
    iconElement?: ReactNode;
    onClick: () => void
    danger?: boolean;
}

export const SettingsItem = memo(({ label, iconName, iconElement, danger, onClick }: SettingsItemProps) => (
    <div className={classNames(styles.main, { [styles._danger]: danger })} onClick={onClick}>
        <div className={styles.text}>
            {label}
        </div>
        <div>
            {iconName && (
                <Box>
                    <Icon
                        icon={iconName}
                        width={20}
                        height={20}
                    />
                </Box>
            )}
            {iconElement}
        </div>
    </div>
))
