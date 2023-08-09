import classNames from 'classnames'
import { forwardRef, HTMLAttributes, ReactNode } from 'react'

import styles from './RoundedIcon.module.scss'

type Props = HTMLAttributes<HTMLDivElement> & {
    icon: ReactNode;
};

export const RoundedIcon = forwardRef<HTMLDivElement, Props>(({ icon, className, ...props }, ref) => (
    <div
        {...props}
        ref={ref}
        className={classNames(styles.roundedIcon, className)}
    >
        {icon}
    </div>
))
