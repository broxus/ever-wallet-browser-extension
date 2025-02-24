import classNames from 'classnames'

import styles from './ColorRadioButton.module.scss'
import { JDENTICON_COLORS } from '../Jdenticon'
import { Box } from '../Box'

interface Props {
    color: JDENTICON_COLORS,
    size?: 'small' | 'medium',
    selected?: boolean,
    onClick?: () => void,
}

export const ColorRadioButton = ({ color, size = 'medium', onClick, selected }: Props): JSX.Element => (
    <Box
        className={classNames(styles.content, styles[size], { [styles.selected]: selected })}
        onClick={onClick}
    >
        <div className={classNames(styles.circle, styles[size], styles[color])} />
    </Box>
)
