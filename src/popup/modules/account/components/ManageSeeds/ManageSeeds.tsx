import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import SeedImg from '@app/popup/assets/img/seed.svg'
import { Button, ButtonGroup, Container, Content, Footer, Header, useViewModel } from '@app/popup/modules/shared'
import { convertAddress } from '@app/shared'

import { List } from '../List'
import { ManageSeedsViewModel } from './ManageSeedsViewModel'

interface Props {
    onBack: () => void;
}

export const ManageSeeds = observer(({ onBack }: Props): JSX.Element => {
    const vm = useViewModel(ManageSeedsViewModel)
    const intl = useIntl()

    return (
        <Container key="manageSeeds" className="accounts-management">
            <Header>
                <h2>{intl.formatMessage({ id: 'MANAGE_SEEDS_PANEL_HEADER' })}</h2>
            </Header>

            <Content>
                <div className="accounts-management__content-header">
                    {intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_HEADING' })}
                    <a className="extra" onClick={vm.addSeed}>
                        {intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ADD_NEW_LINK_TEXT' })}
                    </a>
                </div>

                <div className="accounts-management__divider" />

                {/* <ul className="accounts-management__list"> */}
                <List>
                    {vm.masterKeys.map(key => {
                        let name = vm.masterKeysNames[key.masterKey] || convertAddress(key.masterKey)
                        const active = vm.selectedMasterKey === key.masterKey

                        if (active) {
                            name += ` ${intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ITEM_CURRENT' })}`
                        }

                        return (
                            <List.Item
                                key={key.masterKey}
                                icon={<img src={SeedImg} alt="" />}
                                active={active}
                                onClick={() => vm.onManageMasterKey(key)}
                            >
                                <span title={name}>{name}</span>
                            </List.Item>
                        )
                    })}
                </List>
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button
                        group="small"
                        design="secondary"
                        disabled={vm.backupInProgress}
                        onClick={onBack}
                    >
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button disabled={vm.backupInProgress} onClick={vm.onBackup}>
                        {intl.formatMessage({ id: 'BACKUP_ALL_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
