import { observer } from 'mobx-react-lite'

import { Container, Header, Navbar, useViewModel } from '@app/popup/modules/shared'

import { SettingsViewModel } from './SettingsViewModel'

import './Settings.scss'

export const Settings = observer((): JSX.Element | null => {
    const vm = useViewModel(SettingsViewModel)

    return (
        <Container>
            <Header>
                <Navbar back="/" />
            </Header>
        </Container>
    )
})
