import TonLogo from '@app/popup/assets/img/ton-logo.svg';
import React, { memo } from 'react';

interface Props {
  className?: string;
}

export const TonAssetIcon = memo(({ className }: Props): JSX.Element => (
  <img src={TonLogo} alt="" className={className} />
));
