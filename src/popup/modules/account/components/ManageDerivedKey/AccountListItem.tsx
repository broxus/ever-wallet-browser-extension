import type * as nt from '@broxus/ever-wallet-wasm'
import { memo } from 'react'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { convertAddress } from '@app/shared'
import { IconButton } from '@app/popup/modules/shared'
import { Jdenticon } from '@app/popup/modules/shared/components/Jdenticon'

import { List } from '../List'

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
            icon={<Jdenticon value={account.tonWallet.address} />}
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
                    className="tooltip-anchor-element"
                    size="xs"
                    design="ghost"
                    data-visible={visible}
                    disabled={active}
                    icon={visible ? Icons.eyeOff : Icons.eye}
                    onClick={() => onChangeVisibility(account)}
                />
            )}
            onClick={() => onClick(account)}
        />
    )
})
