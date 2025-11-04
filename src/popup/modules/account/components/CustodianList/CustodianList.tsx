import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { convertPublicKey } from '@app/shared'
import { CopyButton, Icon, IconButton, useViewModel } from '@app/popup/modules/shared'

import { RenameCustodian } from '../RenameCustodian'
import { CustodianListViewModel } from './CustodianListViewModel'
import styles from './CustodianList.module.scss'

interface Props {
    address: string;
    className?: string;
}

export const CustodianList = observer(({ address, className }: Props) => {
    const intl = useIntl()

    const vm = useViewModel(CustodianListViewModel, (model) => {
        model.address = address
    })

    const handleRenameCustodian = (publicKey: string) => vm.panel.open({
        title: intl.formatMessage({ id: 'RENAME_CUSTODIAN' }),
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
                            <div className={styles.box}>
                                <div className={styles.key}>
                                    {formatedPK}
                                </div>
                                <CopyButton text={publicKey}>
                                    <button type="button" className={styles.button}>
                                        <Icon icon="copy" width={12} height={12} />
                                    </button>
                                </CopyButton>
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
