import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import QRCode from 'react-qr-code'

import {
    Button,
    ButtonGroup,
    Container,
    Content,
    CopyText,
    Footer,
    Header,
    Input,
    Switch,
    useViewModel,
} from '@app/popup/modules/shared'
import KeyIcon from '@app/popup/assets/icons/key.svg'

import { List } from '../List'
import { ManageAccountViewModel } from './ManageAccountViewModel'

const keyIcon = <KeyIcon />

export const ManageAccount = observer((): JSX.Element => {
    const vm = useViewModel(ManageAccountViewModel)
    const intl = useIntl()

    return (
        <Container className="accounts-management">
            <Header>
                <h2>{intl.formatMessage({ id: 'MANAGE_ACCOUNT_PANEL_HEADER' })}</h2>
            </Header>

            <Content>
                <div className="accounts-management__content-header">
                    {intl.formatMessage({ id: 'MANAGE_ACCOUNT_FIELD_NAME_LABEL' })}
                </div>

                <Input
                    type="text"
                    name="seed_name"
                    placeholder={intl.formatMessage({ id: 'ENTER_ACCOUNT_NAME_FIELD_PLACEHOLDER' })}
                    value={vm.name}
                    suffix={vm.isSaveVisible && (
                        <button type="button" className="accounts-management__name-button" onClick={vm.saveName}>
                            {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
                        </button>
                    )}
                    onChange={vm.handleNameInputChange}
                />

                <div className="accounts-management__account-visibility">
                    <Switch
                        disabled={vm.isActive}
                        checked={vm.isVisible}
                        onChange={vm.onToggleVisibility}
                    >
                        {intl.formatMessage({ id: 'MANAGE_ACCOUNT_VISIBILITY_SWITCHER_LABEL' })}
                    </Switch>
                </div>

                {vm.currentAccount && (
                    <div className="accounts-management__address-placeholder">
                        <div className="accounts-management__address-qr-code">
                            <QRCode
                                value={`ton://chat/${vm.currentAccount.tonWallet.address}`}
                                size={80}
                            />
                        </div>
                        <div className="accounts-management__address-text">
                            <CopyText
                                text={vm.currentAccount.tonWallet.address}
                            />
                        </div>
                    </div>
                )}

                {vm.linkedKeys.length > 0 && (
                    <>
                        <div className="accounts-management__content-header">
                            {intl.formatMessage({
                                id: 'MANAGE_ACCOUNT_LIST_LINKED_KEYS_HEADING',
                            })}
                        </div>
                        <div className="accounts-management__divider" />
                        <List>
                            {vm.linkedKeys.map(key => (
                                <List.Item
                                    key={key.publicKey}
                                    icon={keyIcon}
                                    onClick={() => vm.onManageDerivedKey(key)}
                                >
                                    <span title={key.name}>{key.name}</span>
                                </List.Item>
                            ))}
                        </List>
                    </>
                )}
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button group="small" design="secondary" onClick={vm.onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button disabled={!vm.isVisible} onClick={vm.onSelectAccount}>
                        {intl.formatMessage({ id: 'MANAGE_ACCOUNT_GO_TO_ACCOUNT_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
