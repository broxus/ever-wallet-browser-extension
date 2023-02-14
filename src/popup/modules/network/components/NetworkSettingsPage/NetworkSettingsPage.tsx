import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { UndoNotification, useViewModel } from '@app/popup/modules/shared'

import { NetworkSettingsPageViewModel, Step } from './NetworkSettingsPageViewModel'
import { NetworkSettings } from '../NetworkSettings'
import { NetworkForm } from '../NetworkForm'
import { NetworkResult } from '../NetworkResult'

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
                    canDelete={vm.canDelete}
                    onSubmit={vm.handleSubmit}
                    onDelete={vm.handleDelete}
                    onReset={vm.handleReset}
                    onCancel={vm.handleBack}
                />
            )}
            {vm.step.is(Step.Result) && vm.result && (
                <NetworkResult
                    type={vm.result.type}
                    canSwitch={vm.canSwitch}
                    onClose={vm.handleClose}
                />
            )}

            <UndoNotification
                position="bottom-offset"
                opened={vm.notificationVisible}
                onClose={vm.hideNotification}
                onUndo={vm.handleUndo}
            >
                {intl.formatMessage({ id: 'NETWORK_DELETED_MESSAGE_TEXT' })}
            </UndoNotification>
        </>
    )
})
