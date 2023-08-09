import type * as nt from '@broxus/ever-wallet-wasm'
import { useIntl } from 'react-intl'
import { memo } from 'react'

import { Icons } from '@app/popup/icons'

import { List } from '../List'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    active: boolean;
    keys: number;
    onClick(key: nt.KeyStoreEntry): void;
}

export const SeedListItem = memo(({ keyEntry, active, keys, onClick }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <List.Item
            icon={Icons.seed}
            active={active}
            name={keyEntry.name}
            info={intl.formatMessage({ id: 'PUBLIC_KEYS_PLURAL' }, { count: keys })}
            onClick={() => onClick(keyEntry)}
        />
    )
})
