/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import classNames from 'classnames'
import { memo, HTMLAttributes } from 'react'

import styles from './Box.module.scss'

interface BoxProps extends HTMLAttributes<HTMLDivElement> {}

export const Box = memo((props: BoxProps) => (
    <div
        {...props}
        className={classNames(props.className, styles.box)}
        tabIndex={0}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (e.target as HTMLElement).click()
            }
        }}
    />
))
