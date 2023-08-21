import classNames from 'classnames'
import { memo } from 'react'

import { DisplayType } from '../../utils'
import styles from './DisplayTypeSelector.module.scss'

interface Props {
    value: DisplayType;
    onChange(type: DisplayType): void;
}

export const DisplayTypeSelector = memo(({ value, onChange }: Props): JSX.Element => (
    <div className={styles.selector}>
        {Object.values(DisplayType).map(type => (
            <button
                type="button"
                key={type}
                className={classNames(styles.item, { [styles._active]: value === type })}
                onClick={() => onChange(type)}
            >
                {type}
            </button>
        ))}
    </div>
))
