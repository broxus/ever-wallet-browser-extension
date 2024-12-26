import * as React from 'react'
import QR from 'react-qr-code'
import classNames from 'classnames'

import styles from './index.module.scss'

type Props = {
    value: string
    size: number
    bgColor?: string
    fgColor?: string
    className?: string
}

export const QRCode: React.FC<Props> = ({
    value,
    size,
    bgColor = '#000',
    fgColor = '#fff',
    className,
}) => (
    <div className={classNames(styles.root, className)}>
        <svg
            className={styles.border}
            width="132" height="132" viewBox="0 0 132 132"
            fill="none" xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M116 0.5H125.5C128.814 0.5 131.5 3.18629 131.5 6.5V16M16 0.5H6.5C3.18629 0.5 0.5 3.18629 0.5 6.5V16M0.5 116V125.5C0.5 128.814 3.18629 131.5 6.5 131.5H16M116 131.5H125.5C128.814 131.5 131.5 128.814 131.5 125.5V116" stroke="currentColor" />
        </svg>
        <QR
            value={value}
            size={size}
            bgColor={bgColor}
            fgColor={fgColor}
        />
    </div>
)
