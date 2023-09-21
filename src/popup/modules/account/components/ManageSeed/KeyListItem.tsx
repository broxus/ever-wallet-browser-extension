import type * as nt from '@broxus/ever-wallet-wasm'
import { useIntl } from 'react-intl'
import { memo } from 'react'

import { Icons } from '@app/popup/icons'
import { convertPublicKey } from '@app/shared'
import { RoundedIcon } from '@app/popup/modules/shared'

import { List } from '../List'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    active: boolean;
    accounts: number;
    onClick(key: nt.KeyStoreEntry): void;
}

const icon = <RoundedIcon icon={Icons.key} />

export const KeyListItem = memo(({ keyEntry, active, accounts, onClick }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <List.Item
            active={active}
            icon={icon}
            name={keyEntry.name}
            info={(
                <>
                    {convertPublicKey(keyEntry.publicKey)}
                    <span>&nbsp;•&nbsp;</span>
                    {intl.formatMessage(
                        { id: 'ACCOUNTS_PLURAL' },
                        { count: accounts },
                    )}
                </>
            )}
            onClick={() => onClick(keyEntry)}
        />
    )
})
