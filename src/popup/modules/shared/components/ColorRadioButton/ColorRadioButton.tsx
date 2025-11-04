import classNames from 'classnames'

import styles from './ColorRadioButton.module.scss'
import { Box } from '../Box'
import { JDENTICON_COLORS } from '../Jdenticon'

interface Props {
    color: string,
    size?: 'small' | 'medium',
    selected?: boolean,
    onClick?: () => void,
}

export const ColorRadioButton = ({ color = JDENTICON_COLORS.Blue, size = 'medium', onClick, selected }: Props) => (
    <Box
        className={classNames(styles.content, styles[size], { [styles.selected]: selected })}
        onClick={onClick}
    >
        <div className={classNames(styles.circle, styles[size], styles[color])} />
    </Box>
)
