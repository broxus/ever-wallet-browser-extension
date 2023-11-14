import { observer } from 'mobx-react-lite'

import { Icons } from '@app/popup/icons'
import { convertPublicKey } from '@app/shared'
import { IconButton, useViewModel } from '@app/popup/modules/shared'

import { RenameCustodian } from '../RenameCustodian'
import { CustodianListViewModel } from './CustodianListViewModel'
import styles from './CustodianList.module.scss'

interface Props {
    address: string;
    className?: string;
}

export const CustodianList = observer(({ address, className }: Props): JSX.Element | null => {
    const vm = useViewModel(CustodianListViewModel, (model) => {
        model.address = address
    })

    const handleRenameCustodian = (publicKey: string) => vm.panel.open({
        render: () => <RenameCustodian publicKey={publicKey} />,
    })

    return (
        <div className={className}>
            {vm.custodians.map((publicKey) => {
                const name = vm.storedKeys[publicKey]?.name || vm.contacts[publicKey]?.name
                const formatedPK = convertPublicKey(publicKey)

                return (
                    <div key={publicKey} className={styles.item}>
                        <div className={styles.wrap}>
                            <div className={styles.name}>
                                {name ?? formatedPK}
                            </div>
                            <div className={styles.key}>
                                {formatedPK}
                            </div>
                        </div>
                        <IconButton
                            design="ghost"
                            size="s"
                            icon={Icons.edit}
                            className={styles.rename}
                            onClick={() => handleRenameCustodian(publicKey)}
                        />
                    </div>
                )
            })}
        </div>
    )
})
