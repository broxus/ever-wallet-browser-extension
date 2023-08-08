import { memo } from 'react'
import classNames from 'classnames'

import { Icons } from '@app/popup/icons'

import styles from './Loader.module.scss'

interface Props {
    className?: string;
    large?: boolean;
}

export const Loader = memo(({ className, large }: Props) => (
    large
        ? <Icons.LoaderLarge className={classNames(styles.loader, styles._large, className)} />
        : <Icons.Loader className={classNames(styles.loader, className)} />
))
