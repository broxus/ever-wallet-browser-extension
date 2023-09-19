import { Outlet } from 'react-router'

import { Space } from '@app/popup/modules/shared'
import logo from '@app/popup/assets/img/welcome/logo.svg'

import { LanguageSelector } from '../LanguageSelector'
import s from './Layout.module.scss'

export function Layout(): JSX.Element {
    return (
        <div className={s.layout}>
            <div className={s.header}>
                <div>
                    <img src={logo} alt="logo" />
                </div>
                <div>
                    <Space direction="row" gap="m">
                        {/* <IconButton
                            design="secondary"
                            size="m"
                            icon={Icons.headpods}
                            className={s.icon}
                        /> */}
                        <LanguageSelector />
                    </Space>
                </div>
            </div>
            <div>
                <Outlet />
            </div>
        </div>
    )
}
