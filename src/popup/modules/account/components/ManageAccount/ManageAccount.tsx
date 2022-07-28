import { observer } from 'mobx-react-lite'
import React from 'react'
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
    useDrawerPanel,
    useViewModel,
} from '@app/popup/modules/shared'
import EverKey from '@app/popup/assets/img/ever-key.svg'
import Arrow from '@app/popup/assets/img/arrow.svg'

import { ManageAccountViewModel } from './ManageAccountViewModel'

export const ManageAccount = observer((): JSX.Element => {
    const drawer = useDrawerPanel()
    const vm = useViewModel(ManageAccountViewModel, model => {
        model.drawer = drawer
    })
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
                        <ul className="accounts-management__list">
                            {vm.linkedKeys.map(key => (
                                <li key={key.publicKey}>
                                    <div
                                        className="accounts-management__list-item"
                                        onClick={() => vm.onManageDerivedKey(key)}
                                    >
                                        <img src={EverKey} alt="" className="accounts-management__list-item-logo" />
                                        <div className="accounts-management__list-item-title" title={key.name}>
                                            {key.name}
                                        </div>
                                        <img className="accounts-management__list-item-arrow" src={Arrow} alt="" />
                                    </div>
                                </li>
                            ))}
                        </ul>
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
