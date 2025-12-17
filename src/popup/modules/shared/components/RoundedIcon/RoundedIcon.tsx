import classNames from 'classnames'
import { type HTMLAttributes, type ReactNode, type Ref } from 'react'

import styles from './RoundedIcon.module.scss'

type Props = HTMLAttributes<HTMLDivElement> & {
    icon: ReactNode;
    ref?: Ref<HTMLDivElement>
}

export const RoundedIcon = ({ icon, className, ...props }: Props) => (
    <div
        {...props}
        className={classNames(styles.roundedIcon, className)}
    >
        {icon}
    </div>
)
