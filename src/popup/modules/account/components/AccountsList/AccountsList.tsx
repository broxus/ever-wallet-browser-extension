import Arrow from '@app/popup/assets/img/arrow.svg';
import { UserAvatar } from '@app/popup/modules/shared';
import { convertAddress } from '@app/shared';
import type nt from '@wallet/nekoton-wasm';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';

interface Props {
  items: nt.AssetsList[];
  selectedAccountAddress: string | undefined;
  accountsVisibility: Record<string, boolean>;
  onClick(account: nt.AssetsList): void;
}

export const AccountsList = observer(({ items, selectedAccountAddress, accountsVisibility, onClick }: Props): JSX.Element => {
  const intl = useIntl();

  return (
    <ul className="accounts-management__list">
      {items.map((account) => (
        <li key={account.tonWallet.address}>
          <div
            role="button"
            className={classNames('accounts-management__list-item', {
              _active: account.tonWallet.address === selectedAccountAddress,
            })}
            onClick={() => onClick(account)}
          >
            <UserAvatar
              className="accounts-management__list-item-icon"
              address={account.tonWallet.address}
              small
            />
            <div className="accounts-management__list-item-title">
              {account.name || convertAddress(account.tonWallet.address)}
            </div>
            <div className="accounts-management__list-item-visibility">
              {accountsVisibility[account.tonWallet.address] ?
                intl.formatMessage({ id: 'DISPLAYED' }) :
                intl.formatMessage({ id: 'HIDDEN' })}
            </div>
            <img src={Arrow} alt="" style={{ height: 24, width: 24 }} />
          </div>
        </li>
      ))}
    </ul>
  );
});
