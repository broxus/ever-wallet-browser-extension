import { Container, UserAvatar } from '@app/popup/modules/shared';
import type nt from '@wallet/nekoton-wasm';
import classNames from 'classnames';
import React, { memo } from 'react';
import { WebsiteIcon } from '../WebsiteIcon';

import './Approval.scss';

type Props = React.PropsWithChildren<{
  title: string
  origin: string
  networkName: string
  account: nt.AssetsList
  className?: string
}>;

export const Approval = memo(({ title, origin, account, networkName, className, children }: Props): JSX.Element => (
  <Container className={classNames('approval', className)}>
    <div className="approval__top-panel">
      <div className="approval__top-panel-network">
        <div className="approval__address-entry">
          <UserAvatar address={account.tonWallet.address} small />
          <div className="approval__top-panel-account">{account?.name}</div>
        </div>
        <div className="approval__network">
          {networkName}
        </div>
      </div>
      <div className="approval__top-panel-site">
        <WebsiteIcon origin={origin} />
        <div className="approval__address-entry">{origin}</div>
      </div>
      <h3 className="approval__top-panel-header noselect">{title}</h3>
    </div>
    {children}
  </Container>
));
