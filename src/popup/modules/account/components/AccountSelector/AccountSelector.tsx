import classNames from 'classnames'
import { memo, useMemo } from 'react'

import { Checkbox, UserAvatar, useViewModel } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

import { AccountSelectorViewModel } from './AccountSelectorViewModel'

import './AccountSelector.scss'

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
    const { preselected, checked, setChecked, publicKey, keyName, index, disabled } = props
    const vm = useViewModel(AccountSelectorViewModel)
    const address = useMemo(() => vm.computeEverWalletAddress(publicKey), [publicKey])

    return (
        <label
            className={classNames('account-selector', {
                _selected: preselected,
            })}
        >
            <Checkbox
                checked={Boolean(checked || preselected)}
                onChange={!preselected ? (e) => setChecked(e.target.checked) : undefined}
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
                {keyName || convertPublicKey(publicKey)}
            </span>
        </label>
    )
})
