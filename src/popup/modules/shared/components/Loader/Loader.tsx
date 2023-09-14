import { memo } from 'react'
import classNames from 'classnames'

import { Icon } from '../Icon'
import styles from './Loader.module.scss'

interface Props {
    className?: string;
    large?: boolean;
}

export const Loader = memo(({ className, large }: Props) => (
    large
        ? <Icon icon="loaderLarge" className={classNames(styles.loader, styles._large, className)} />
        : <Icon icon="loader" className={classNames(styles.loader, className)} />
))
