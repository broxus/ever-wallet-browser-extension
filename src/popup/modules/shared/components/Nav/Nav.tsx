import React, { memo } from 'react';
import Right from '@app/popup/assets/img/right-arrow-blue.svg';
import Left from '@app/popup/assets/img/left-arrow-blue.svg';

import './Nav.scss';

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
            <img src={Left} alt="" />
          </div>
        )}
        {showNext && (
          <div className="nav__button" onClick={onClickNext}>
            <img src={Right} alt="" />
          </div>
        )}
      </div>
    )}
  </div>
));
