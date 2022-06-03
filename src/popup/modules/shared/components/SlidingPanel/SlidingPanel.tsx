import React, { memo } from 'react';
import { CSSTransition } from 'react-transition-group';
import { DomHolder } from '../DomHolder';

import './SlidingPanel.scss';

type Props = React.PropsWithChildren<{
  active: boolean;
  onClose: () => void;
}>;

export const SlidingPanel = memo(({ active, onClose, children }: Props): JSX.Element => (
  <CSSTransition mountOnEnter unmountOnExit in={active} timeout={300} classNames="transition">
    <div className="sliding-panel">
      <div className="sliding-panel__backdrop" onClick={onClose} />
      <div className="sliding-panel__container">
        <div className="sliding-panel__content">
          <div className="sliding-panel__close">
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <button className="sliding-panel__close-button" type="button" onClick={onClose} />
          </div>
          <DomHolder>
            {children}
          </DomHolder>
        </div>
      </div>
    </div>
  </CSSTransition>
));
