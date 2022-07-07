import { useViewModel } from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { WebsiteIconViewModel } from './WebsiteIconViewModel';

import './WebsiteIcon.scss';

interface Props {
  origin: string;
}

export const WebsiteIcon = observer(({ origin }: Props) => {
  const vm = useViewModel(WebsiteIconViewModel);

  return (
    <img
      className="website-icon noselect"
      src={vm.domainMetadata[origin]?.icon}
      alt="page"
    />
  );
});
