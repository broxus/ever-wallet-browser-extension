import { memo } from 'react'
import classNames from 'classnames'

import LoaderIcon from '@app/popup/assets/icons/loader.svg'

import styles from './Loader.module.scss'

export const Loader = memo(({ className }: { className?: string }) => (
    <LoaderIcon className={classNames(styles.loader, className)} />
))
