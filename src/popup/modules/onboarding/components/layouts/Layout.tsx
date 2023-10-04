import { Outlet } from 'react-router'

import { Space } from '@app/popup/modules/shared'
import logo from '@app/popup/assets/img/welcome/logo.svg'

import { LanguageSelector } from '../LanguageSelector'
import styles from './Layout.module.scss'

export function Layout(): JSX.Element {
    return (
        <div className={styles.layout}>
            <div className={styles.header}>
                <div>
                    <img src={logo} alt="logo" />
                </div>
                <div>
                    <Space direction="row" gap="m">
                        {/* <IconButton
                            design="secondary"
                            size="m"
                            icon={Icons.headpods}
                            className={styles.icon}
                        /> */}
                        <LanguageSelector />
                    </Space>
                </div>
            </div>
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    )
}
