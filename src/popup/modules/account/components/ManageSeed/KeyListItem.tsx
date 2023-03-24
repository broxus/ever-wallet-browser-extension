import type nt from '@broxus/ever-wallet-wasm'
import { useIntl } from 'react-intl'
import { CSSProperties, memo, ReactNode } from 'react'

import KeyIcon from '@app/popup/assets/icons/key.svg'
import CopyIcon from '@app/popup/assets/icons/copy.svg'
import { CopyText, IconButton } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

import { List } from '../List'

const keyIcon = <KeyIcon />
const copyIcon = <CopyIcon />

const tooltipStyle: CSSProperties = {
    fontSize: '12px',
    lineHeight: '16px',
    padding: '8px',
    zIndex: 102,
}

interface Props {
    keyEntry: nt.KeyStoreEntry;
    active: boolean;
    accounts: number;
    onClick(key: nt.KeyStoreEntry): void;
}

export const KeyListItem = memo(({ keyEntry, active, accounts, onClick }: Props): JSX.Element => {
    const intl = useIntl()
    let name: ReactNode = keyEntry.name

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
            active={active}
            icon={keyIcon}
            name={name}
            info={
                <>
                    {convertPublicKey(keyEntry.publicKey)}
                    <span>&nbsp;•&nbsp;</span>
                    {intl.formatMessage(
                        { id: 'ACCOUNTS_PLURAL' },
                        { count: accounts },
                    )}
                </>
            }
            addon={(
                <CopyText
                    noArrow
                    text={keyEntry.publicKey}
                    tooltipText={intl.formatMessage({ id: 'COPY_PUBLIC_KEY_BTN_TEXT' })}
                    style={tooltipStyle}
                >
                    <IconButton icon={copyIcon} />
                </CopyText>
            )}
            onClick={() => onClick(keyEntry)}
        />
    )
})
