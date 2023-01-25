import { memo } from 'react'

import Right from '@app/popup/assets/icons/right-arrow-circle.svg'
import Left from '@app/popup/assets/icons/left-arrow-circle.svg'

import './Nav.scss'

interface Props {
    title?: string;
    hint?: string;
    showPrev?: boolean;
    showNext?: boolean;
    onClickNext?: () => void;
    onClickPrev?: () => void;
}

export const Nav = memo(({ title, hint, showPrev, showNext, onClickNext, onClickPrev }: Props): JSX.Element => (
    <div className="nav">
        {(Boolean(title) || Boolean(hint)) && (
            <span className="nav__header">
                {title && <span className="nav__title">{title}</span>}
                {hint && <span className="nav__title _hint">{hint}</span>}
            </span>
        )}

        {(showPrev || showNext) && (
            <div className="nav__buttons">
                {showPrev && (
                    <div className="nav__button" onClick={onClickPrev}>
                        <Left />
                    </div>
                )}
                {showNext && (
                    <div className="nav__button" onClick={onClickNext}>
                        <Right />
                    </div>
                )}
            </div>
        )}
    </div>
))
