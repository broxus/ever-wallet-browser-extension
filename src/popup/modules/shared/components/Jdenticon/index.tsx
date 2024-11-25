import * as React from 'react'
import { toSvg } from 'jdenticon'
import classNames from 'classnames'

import styles from './index.module.scss'

type Props = {
    value: string
    size?: number
    className?: string
}

export const Jdenticon: React.FC<Props> = ({
    value,
    size = 40,
    className,
}) => {
    const svg = React.useMemo(() => toSvg(value, size, {
        backColor: '#fff',
    }), [value, size])

    return (
        <img
            alt=""
            className={classNames(styles.root, className)}
            src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
        />
    )
}
