/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import classNames from 'classnames'
import { memo, LabelHTMLAttributes } from 'react'

import styles from './Label.module.scss'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> { }

export const Label = memo((props: LabelProps) => (
    <label
        tabIndex={0}
        {...props}
        className={classNames(props.className, styles.label)}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (e.target as HTMLElement).click()
            }
        }}
    />
))
