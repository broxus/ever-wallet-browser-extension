import type nt from '@broxus/ever-wallet-wasm'
import { memo } from 'react'
import { useIntl } from 'react-intl'

import { convertAddress } from '@app/shared'
import { IconButton, UserAvatar } from '@app/popup/modules/shared'
import EyeIcon from '@app/popup/assets/icons/eye.svg'
import EyeOffIcon from '@app/popup/assets/icons/eye-off.svg'

import { List } from '../List'

const eyeIcon = <EyeIcon />
const eyeOffIcon = <EyeOffIcon />

interface Props {
    account: nt.AssetsList;
    external: boolean;
    visible: boolean;
    active: boolean;
    onChangeVisibility(account: nt.AssetsList): void;
    onClick(account: nt.AssetsList): void;
}

export const AccountListItem = memo((props: Props): JSX.Element => {
    const { account, external, visible, active, onChangeVisibility, onClick } = props
    const intl = useIntl()
    const address = convertAddress(account.tonWallet.address)

    return (
        <List.Item
            active={active}
            icon={<UserAvatar address={account.tonWallet.address} small />}
            name={account.name || address}
            info={(
                <>
                    {address}
                    <span>&nbsp;•&nbsp;</span>
                    {external
                        ? intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_ACCOUNT_EXTERNAL_HINT' })
                        : intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_ACCOUNT_INTERNAL_HINT' })}
                </>
            )}
            addon={(
                <IconButton
                    data-visible={visible}
                    className="tooltip-anchor-element"
                    disabled={active}
                    icon={visible ? eyeOffIcon : eyeIcon}
                    onClick={() => onChangeVisibility(account)}
                />
            )}
            onClick={() => onClick(account)}
        />
    )
})
