import { observer } from 'mobx-react-lite'
import ReactFocusLock from 'react-focus-lock'

import { Banner, useResolve } from '@app/popup/modules/shared'

import { AccountsList } from '../../AccountsList/AccountsList'
import { WalletV5R1BannerViewModel } from './WalletV5R1BannerViewModel'
import styles from './WalletV5R1Banner.module.scss'

export const WalletV5R1Banner = observer((): JSX.Element | null => {
    const { visible, panel } = useResolve(WalletV5R1BannerViewModel)

    const onButtonClick = () => {
        panel.open({
            showClose: false,
            render: () => <AccountsList />,
        })
    }

    return visible ? (
        <ReactFocusLock
            autoFocus
            returnFocus
        >
            <div className={styles.backdrop}>

                <Banner
                    title="V5R1 wallet not supported"
                    subtitle="Unavailable in Ever/Venom networks"
                    buttonText="Switch Account"
                    onButtonClick={onButtonClick}
                />
            </div>
        </ReactFocusLock>
    ) : null
})
