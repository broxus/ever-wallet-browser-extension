import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Notification, useViewModel } from '@app/popup/modules/shared'

import { NetworkSettingsPageViewModel, Step } from './NetworkSettingsPageViewModel'
import { NetworkSettings } from '../NetworkSettings'
import { NetworkForm } from '../NetworkForm'
import { NetworkResult } from '../NetworkResult'
import './NetworkSettingsPage.scss'

export const NetworkSettingsPage = observer((): JSX.Element => {
    const vm = useViewModel(NetworkSettingsPageViewModel)
    const intl = useIntl()

    return (
        <>
            {vm.step.is(Step.Settings) && (
                <NetworkSettings
                    networks={vm.networks}
                    current={vm.selectedConnection}
                    onEdit={vm.handleEdit}
                    onAdd={vm.handleAdd}
                />
            )}
            {vm.step.is(Step.Edit) && (
                <NetworkForm
                    network={vm.network}
                    onSubmit={vm.handleSubmit}
                    onDelete={vm.handleDelete}
                    onReset={vm.handleReset}
                    onCancel={vm.handleBack}
                />
            )}
            {vm.step.is(Step.Result) && vm.result && (
                <NetworkResult
                    type={vm.result.type}
                    onClose={vm.handleClose}
                />
            )}

            <Notification
                className="network-notification"
                position="bottom"
                timeout={3000}
                opened={vm.notificationVisible}
                onClose={vm.hideNotification}
            >
                <div className="network-notification__content">
                    {intl.formatMessage({ id: 'NETWORK_DELETED_MESSAGE_TEXT' })}
                    <button className="network-notification__undo" type="button" onClick={vm.handleUndo}>
                        {intl.formatMessage({ id: 'UNDO_BTN_TEXT' })}
                    </button>
                </div>
            </Notification>
        </>
    )
})
