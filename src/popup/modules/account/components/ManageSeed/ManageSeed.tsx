import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import SeedImg from '@app/popup/assets/img/seed.svg'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'
import KeyIcon from '@app/popup/assets/icons/key.svg'
import PlusIcon from '@app/popup/assets/icons/plus.svg'
import ExternalIcon from '@app/popup/assets/icons/external.svg'
import EditIcon from '@app/popup/assets/icons/edit.svg'
import LockIcon from '@app/popup/assets/icons/lock.svg'
import {
    Button,
    Container,
    Content,
    DropdownMenu,
    Footer,
    Header, Notification,
    SlidingPanel,
    useViewModel,
} from '@app/popup/modules/shared'
import { ENVIRONMENT_TYPE_POPUP } from '@app/shared'

import { ExportSeed } from '../ExportSeed'
import { DeleteSeed } from '../DeleteSeed'
import { List } from '../List'
import { ChangePassword } from '../ChangePassword'
import { ManageSeedViewModel, Step } from './ManageSeedViewModel'

const deleteIcon = <DeleteIcon />
const keyIcon = <KeyIcon />
const externalIcon = <ExternalIcon />
const editIcon = <EditIcon />
const lockIcon = <LockIcon />

export const ManageSeed = observer((): JSX.Element => {
    const vm = useViewModel(ManageSeedViewModel)
    const intl = useIntl()

    return (
        <>
            {vm.step.is(Step.Index) && (
                <Container className="accounts-management">
                    <Header className="accounts-management__header">
                        <img className="accounts-management__header-img" src={SeedImg} alt="" />
                        <h2 className="accounts-management__header-title">
                            {intl.formatMessage({ id: 'MANAGE_SEED_PANEL_HEADER' })}
                            &nbsp;
                            <span>
                                {vm.seedName}
                            </span>
                        </h2>
                        {vm.activeTab?.type !== ENVIRONMENT_TYPE_POPUP && (
                            <DropdownMenu className="accounts-management__header-menu">
                                {vm.signerName !== 'ledger_key' && (
                                    <DropdownMenu.Item icon={externalIcon} onClick={vm.step.callback(Step.ExportSeed)}>
                                        {intl.formatMessage({ id: 'EXPORT_SEED_BTN_TEXT' })}
                                    </DropdownMenu.Item>
                                )}
                                {/* <DropdownMenu.Item icon={editIcon} onClick={() => console.log('TODO')}>
                                    {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                                </DropdownMenu.Item> */}
                                {vm.signerName !== 'ledger_key' && (
                                    <DropdownMenu.Item icon={lockIcon} onClick={vm.openChangePassword}>
                                        {intl.formatMessage({ id: 'CHANGE_PASSWORD_BTN_TEXT' })}
                                    </DropdownMenu.Item>
                                )}
                                <DropdownMenu.Item
                                    danger
                                    icon={deleteIcon}
                                    disabled={vm.isCurrentSeed}
                                    onClick={vm.step.callback(Step.DeleteSeed)}
                                >
                                    {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                                </DropdownMenu.Item>
                            </DropdownMenu>
                        )}
                    </Header>

                    <Content>
                        {/* <div className="accounts-management__content-header">
                            {intl.formatMessage({ id: 'MANAGE_SEED_FIELD_NAME_LABEL' })}
                        </div>

                        <Input
                            type="text"
                            placeholder={intl.formatMessage({ id: 'ENTER_SEED_FIELD_PLACEHOLDER' })}
                            value={vm.name}
                            suffix={vm.isSaveVisible && (
                                <button
                                    type="button" className="accounts-management__name-button" onClick={vm.saveName}
                                >
                                    {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
                                </button>
                            )}
                            onChange={vm.onNameChange}
                        /> */}

                        <div className="accounts-management__content-header">
                            {intl.formatMessage({ id: 'MANAGE_SEED_LIST_KEYS_HEADING' })}
                        </div>

                        <List>
                            {vm.derivedKeys.map(key => (
                                <List.Item
                                    key={key.publicKey}
                                    active={vm.currentDerivedKeyPubKey === key.publicKey}
                                    icon={keyIcon}
                                    onClick={() => vm.onManageDerivedKey(key)}
                                >
                                    <span title={key.name}>{key.name}</span>
                                </List.Item>
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
            )}

            <SlidingPanel active={vm.changePassword} onClose={vm.closeChangePassword}>
                {vm.currentMasterKey && (
                    <ChangePassword keyEntry={vm.currentMasterKey} onResult={vm.handlePasswordChanged} />
                )}
            </SlidingPanel>

            <Notification
                position="bottom-offset"
                opened={vm.changePasswordNotification}
                timeout={3000}
                showClose={false}
                onClose={vm.closeChangePasswordNotification}
            >
                {intl.formatMessage({ id: 'PWD_CHANGE_SUCCESS_NOTIFICATION' })}
            </Notification>

            {vm.step.is(Step.ExportSeed) && <ExportSeed onBack={vm.step.callback(Step.Index)} />}
            {vm.step.is(Step.DeleteSeed) && <DeleteSeed onBack={vm.step.callback(Step.Index)} onDelete={vm.onBack} />}
        </>
    )
})
