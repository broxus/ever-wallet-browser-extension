import { Outlet } from 'react-router'

import { Button, Space } from '@app/popup/modules/shared'
import logo from '@app/popup/assets/img/welcome/logo.svg'
import { Icons } from '@app/popup/icons'

import { LanguageSelector } from '../LanguageSelector'
import s from './Layout.module.scss'

export function Layout(): JSX.Element {
    return (
        <div className={s.layout}>
            <div className={s.header}>
                <div className={s.logo}>
                    <img src={logo} alt="logo" />
                </div>
                <div className={s.controller}>
                    <Space direction="row" gap="m">
                        <Button className={s.headpodsIcon} design="secondary">
                            {Icons.headpodsIcon}
                        </Button>
                        <LanguageSelector />
                    </Space>
                </div>
            </div>
            <div className={s.outlet}>
                <Outlet />
            </div>
        </div>
    )
}
