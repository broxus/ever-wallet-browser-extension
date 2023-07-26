import type * as nt from '@broxus/ever-wallet-wasm'
import { useIntl } from 'react-intl'
import { memo, ReactNode } from 'react'

import SeedImg from '@app/popup/assets/img/seed.svg'
import ChevronIcon from '@app/popup/assets/icons/chevron-right.svg'
import { IconButton } from '@app/popup/modules/shared'

import { List } from '../List'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    active: boolean;
    keys: number;
    onSelect(key: nt.KeyStoreEntry): void;
    onClick(key: nt.KeyStoreEntry): void;
}

const chevronIcon = <ChevronIcon />
const icon = <img src={SeedImg} alt="" />


export const SeedListItem = memo(({ keyEntry, active, keys, onClick, onSelect }: Props): JSX.Element => {
    const intl = useIntl()

    let name: ReactNode = keyEntry.name
    const info = intl.formatMessage(
        { id: 'PUBLIC_KEYS_PLURAL' },
        { count: keys },
    )
    const addon = !active && (
        <IconButton
            className="tooltip-anchor-element"
            icon={chevronIcon}
            onClick={() => onSelect(keyEntry)}
        />
    )

    if (active) {
        name = (
            <>
                <span>{name}</span>
                <small>{intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ITEM_CURRENT' })}</small>
            </>
        )
    }

    return (
        <List.Item
            key={keyEntry.masterKey}
            icon={icon}
            active={active}
            name={name}
            info={info}
            addon={addon}
            onClick={() => onClick(keyEntry)}
        />
    )
})
