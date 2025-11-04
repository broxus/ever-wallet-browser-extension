import classNames from 'classnames'
import { HTMLAttributes, ReactNode, Ref } from 'react'

import styles from './RoundedIcon.module.scss'

type Props = HTMLAttributes<HTMLDivElement> & {
    icon: ReactNode;
    ref?: Ref<HTMLDivElement>
};

export const RoundedIcon = ({ icon, className, ...props }: Props) => (
    <div
        {...props}
        className={classNames(styles.roundedIcon, className)}
    >
        {icon}
    </div>
)
