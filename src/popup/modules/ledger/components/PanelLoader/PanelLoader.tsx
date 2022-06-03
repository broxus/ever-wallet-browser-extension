import { Loader } from '@app/popup/modules/shared';
import classNames from 'classnames';
import React, { memo } from 'react';

import './PanelLoader.scss';

interface Props {
  paddings?: boolean;
  transparent?: boolean;
}

export const PanelLoader = memo(({ paddings = true, transparent }: Props): JSX.Element => (
  <div
    className={classNames('panel-loader', {
      _paddings: paddings,
      _transparent: transparent,
    })}
  >
    <Loader />
  </div>
));
