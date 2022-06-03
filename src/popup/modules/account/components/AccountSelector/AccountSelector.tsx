import { Checkbox, useResolve } from '@app/popup/modules/shared';
import { convertAddress } from '@app/shared';
import classNames from 'classnames';
import React, { memo, useMemo } from 'react';
import { UserAvatar } from '../UserAvatar';
import { AccountSelectorViewModel } from './AccountSelectorViewModel';

import './AccountSelector.scss';

interface Props {
  preselected?: boolean;
  checked?: boolean;
  setChecked: (checked: boolean) => void;
  publicKey: string;
  keyName?: string;
  index?: string;
  disabled?: boolean;
}

export const AccountSelector = memo((props: Props): JSX.Element => {
  const { preselected, checked, setChecked, publicKey, keyName, index, disabled } = props;
  const vm = useResolve(AccountSelectorViewModel);
  const address = useMemo(() => vm.computeTonWalletAddress(publicKey), [publicKey]);

  return (
    <div
      className={classNames('account-selector', {
        _selected: preselected,
      })}
    >
      <Checkbox
        checked={Boolean(checked || preselected)}
        onChange={!preselected ? setChecked : () => {
        }}
        disabled={disabled}
      />

      <UserAvatar
        className="account-selector__avatar"
        address={address}
      />

      {index && <span className="account-selector__index">{index}</span>}

      <span
        className={classNames('account-selector__public-key', {
          _grey: preselected,
        })}
      >
        {keyName || convertAddress(publicKey)}
      </span>
    </div>
  );
});
