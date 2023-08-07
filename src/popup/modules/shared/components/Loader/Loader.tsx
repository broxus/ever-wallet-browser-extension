import { memo } from 'react'
import classNames from 'classnames'

import { Icons } from '@app/popup/icons'

import styles from './Loader.module.scss'

export const Loader = memo(({ className }: { className?: string }) => (
    <Icons.Loader className={classNames(styles.loader, className)} />
))
