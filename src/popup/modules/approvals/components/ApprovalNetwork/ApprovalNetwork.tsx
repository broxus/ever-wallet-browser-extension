import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { ConnectionStore, useResolve } from '@app/popup/modules/shared'

import styles from './ApprovalNetwork.module.scss'

export const ApprovalNetwork = observer((): JSX.Element | null => {
    const { selectedConnection: { name }} = useResolve(ConnectionStore)
    const intl = useIntl()

    return (
        <div className={styles.network}>
            <Icons.LogoCircle className={styles.logo} />
            <div className={styles.wrap}>
                <div className={styles.title}>
                    {intl.formatMessage({ id: 'NETWORK_BTN_TITLE' })}
                </div>
                <div className={styles.name} title={name}>
                    {name}
                </div>
            </div>
        </div>
    )
})
