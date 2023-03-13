import type nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import DeleteIcon from '@app/popup/assets/icons/delete.svg'
import ExternalIcon from '@app/popup/assets/icons/external.svg'
import EditIcon from '@app/popup/assets/icons/edit.svg'
import LockIcon from '@app/popup/assets/icons/lock.svg'
import CheckIcon from '@app/popup/assets/icons/check.svg'
import { DropdownMenu, useSlidingPanel, useViewModel } from '@app/popup/modules/shared'

import { ChangePassword } from '../ChangePassword'
import { ExportSeed } from '../ExportSeed'
import { ChangeName } from '../ChangeName'
import { DeleteSeed } from '../DeleteSeed'
import { SeedDropdownMenuViewModel } from './SeedDropdownMenuViewModel'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    className?: string;
}

const deleteIcon = <DeleteIcon />
const externalIcon = <ExternalIcon />
const editIcon = <EditIcon />
const lockIcon = <LockIcon />
const checkIcon = <CheckIcon />

export const SeedDropdownMenu = observer(({ keyEntry, className }: Props): JSX.Element => {
    const vm = useViewModel(SeedDropdownMenuViewModel)
    const panel = useSlidingPanel()
    const intl = useIntl()

    const handleExport = () => panel.open({
        render: () => <ExportSeed keyEntry={keyEntry} onClose={panel.close} />,
    })
    const handleChangeName = () => panel.open({
        render: () => <ChangeName keyEntry={keyEntry} onClose={panel.close} />,
    })
    const handleChangePwd = () => panel.open({
        render: () => <ChangePassword keyEntry={keyEntry} onClose={panel.close} />,
    })
    const handleDelete = () => panel.open({
        render: () => <DeleteSeed keyEntry={keyEntry} onClose={panel.close} />,
    })

    return (
        <DropdownMenu className={className}>
            {vm.selectedMasterKey !== keyEntry.masterKey && (
                <DropdownMenu.Item icon={checkIcon} onClick={() => vm.selectMasterKey(keyEntry)}>
                    {intl.formatMessage({ id: 'USE_THIS_SEED_BTN_TEXT' })}
                </DropdownMenu.Item>
            )}
            {keyEntry.signerName !== 'ledger_key' && (
                <DropdownMenu.Item icon={externalIcon} onClick={handleExport}>
                    {intl.formatMessage({ id: 'EXPORT_SEED_BTN_TEXT' })}
                </DropdownMenu.Item>
            )}
            <DropdownMenu.Item icon={editIcon} onClick={handleChangeName}>
                {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
            </DropdownMenu.Item>
            {keyEntry.signerName !== 'ledger_key' && (
                <DropdownMenu.Item icon={lockIcon} onClick={handleChangePwd}>
                    {intl.formatMessage({ id: 'CHANGE_PASSWORD_BTN_TEXT' })}
                </DropdownMenu.Item>
            )}
            <DropdownMenu.Item danger icon={deleteIcon} onClick={handleDelete}>
                {intl.formatMessage({ id: 'DELETE_SEED_BTN_TEXT' })}
            </DropdownMenu.Item>
        </DropdownMenu>
    )
})
