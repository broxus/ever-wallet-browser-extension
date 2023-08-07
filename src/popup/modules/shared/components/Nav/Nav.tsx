import { memo } from 'react'

import { Icons } from '@app/popup/icons'

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
                        {Icons.leftArrowCircle}
                    </div>
                )}
                {showNext && (
                    <div className="nav__button" onClick={onClickNext}>
                        {Icons.rightArrowCircle}
                    </div>
                )}
            </div>
        )}
    </div>
))
