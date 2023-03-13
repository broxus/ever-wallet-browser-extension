import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import SeedImg from '@app/popup/assets/img/seed.svg'
import KeyIcon from '@app/popup/assets/icons/key.svg'
import PlusIcon from '@app/popup/assets/icons/plus.svg'
import { Button, Container, Content, Footer, Header, useViewModel } from '@app/popup/modules/shared'
import { convertPublicKey, ENVIRONMENT_TYPE_POPUP } from '@app/shared'

import { List } from '../List'
import { SeedDropdownMenu } from '../SeedDropdownMenu'
import { ManageSeedViewModel } from './ManageSeedViewModel'

const keyIcon = <KeyIcon />

export const ManageSeed = observer((): JSX.Element => {
    const vm = useViewModel(ManageSeedViewModel)
    const intl = useIntl()

    return (
        <Container className="accounts-management">
            <Header className="accounts-management__header">
                <img className="accounts-management__header-img" src={SeedImg} alt="" />
                <h2 className="accounts-management__header-title">
                    {intl.formatMessage({ id: 'MANAGE_SEED_PANEL_HEADER' })}
                    &nbsp;
                    <span>{vm.seedName}</span>
                </h2>
                {vm.activeTab?.type !== ENVIRONMENT_TYPE_POPUP && vm.currentMasterKey && (
                    <SeedDropdownMenu keyEntry={vm.currentMasterKey} />
                )}
            </Header>

            <Content>
                <div className="accounts-management__content-header">
                    {intl.formatMessage({ id: 'MANAGE_SEED_LIST_KEYS_HEADING' })}
                </div>

                <List>
                    {vm.derivedKeys.map(key => (
                        <List.Item
                            key={key.publicKey}
                            active={vm.currentDerivedKeyPubKey === key.publicKey}
                            icon={keyIcon}
                            name={key.name}
                            info={
                                <>
                                    {convertPublicKey(key.publicKey)}
                                    <span>&nbsp;•&nbsp;</span>
                                    {intl.formatMessage(
                                        { id: 'ACCOUNTS_PLURAL' },
                                        { count: vm.accountsByKey[key.publicKey] ?? 0 },
                                    )}
                                </>
                            }
                            onClick={() => vm.onManageDerivedKey(key)}
                        />
                    ))}
                </List>

                {vm.signerName !== 'encrypted_key' ? (
                    <button type="button" className="accounts-management__add-btn" onClick={vm.addKey}>
                        <PlusIcon />
                        {intl.formatMessage({ id: 'MANAGE_SEED_LIST_KEYS_ADD_NEW_LINK_TEXT' })}
                    </button>
                ) : (
                    <small>
                        {intl.formatMessage({ id: 'MANAGE_SEED_LIST_KEYS_ONLY_ONE_NOTE' })}
                    </small>
                )}
            </Content>

            <Footer>
                {vm.activeTab?.type !== ENVIRONMENT_TYPE_POPUP && (
                    <Button group="small" design="secondary" onClick={vm.onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                )}
            </Footer>
        </Container>
    )
})
