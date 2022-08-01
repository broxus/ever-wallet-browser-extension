import classNames from 'classnames'
import { memo } from 'react'

import { DisplayType } from '../../utils'

import './DisplayTypeSelector.scss'

interface Props {
    value: DisplayType;

    onChange(type: DisplayType): void;
}

export const DisplayTypeSelector = memo(({ value, onChange }: Props): JSX.Element => (
    <div className="display-type-selector noselect">
        {Object.values(DisplayType).map(type => (
            <div
                key={type}
                className={classNames('display-type-selector__item', { _active: value === type })}
                onClick={() => onChange(type)}
            >
                {type}
            </div>
        ))}
    </div>
))
