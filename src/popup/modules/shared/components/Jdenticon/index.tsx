import * as React from 'react'
import { type JdenticonConfig, toSvg } from 'jdenticon'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import styles from './index.module.scss'
import { useResolve } from '../../hooks'
import { AccountabilityStore } from '../../store'

type Props = {
    value: string
    size?: number
    className?: string
}

export const Jdenticon: React.FC<Props> = observer(({
    value,
    size = 40,
    className,
}) => {
    const accountability = useResolve(AccountabilityStore)
    const color = accountability.accountsColor[value] ?? JDENTICON_COLORS.Blue
    const svg = React.useMemo(() => toSvg(value, size, color ? getJdenticonConfig(color as JDENTICON_COLORS) : {
        backColor: '#fff',
    }), [value, size, color])

    return (
        <img
            alt=""
            className={classNames(styles.root, className)}
            src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
        />
    )
})

export enum JDENTICON_COLORS {
    Blue = 'Blue',
    Green = 'Green',
    Purple = 'Purple',
    Pink = 'Pink',
    Orange = 'Orange',
}

const getJdenticonConfig = (color: JDENTICON_COLORS) => {
    const config: JdenticonConfig = {
        lightness: {
            color: [0.17, 0.17],
            grayscale: [0.18, 0.18],
        },
        saturation: {
            color: 0.99,
            grayscale: 1.00,
        },
    }
    return { ...config, ...configMap[color] }
}

const configMap: Record<JDENTICON_COLORS, JdenticonConfig> = {
    [JDENTICON_COLORS.Blue]: {
        hues: [254],
        backColor: '#3c6ade',
    },
    [JDENTICON_COLORS.Green]: {
        hues: [107],
        backColor: '#80de3c',
    },
    [JDENTICON_COLORS.Purple]: {
        hues: [267],
        backColor: '#7c3cde',
    },
    [JDENTICON_COLORS.Pink]: {
        hues: [309],
        backColor: '#fe76df',
    },
    [JDENTICON_COLORS.Orange]: {
        hues: [19],
        backColor: '#ff6f2f',
    },
}
