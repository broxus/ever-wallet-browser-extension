/* eslint-disable max-len */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { SettingsMenu, SlidingPanelHandle, useResolve, useViewModel } from '@app/popup/modules/shared'
import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'
import { Icons } from '@app/popup/icons'

import { NftCollectionInfoViewModel } from './NftCollectionInfoViewModel'
import styles from './NftCollectionInfo.module.scss'

export const NftCollectionInfoSettings: React.FC = observer(() => {
    const intl = useIntl()
    const vm = useViewModel(NftCollectionInfoViewModel)
    const handle = useResolve(SlidingPanelHandle)


    return (
        <>
            <SlidingPanelHeader
                showClose
                className={styles.header}
                onClose={handle.close}
                title={intl.formatMessage({
                    id: 'NFT_COLLECTION_SETTINGS',
                })}
            />

            <SettingsMenu>
                <SettingsMenu.Item icon={Icons.planet} onClick={vm.openCollectionInExplorer}>
                    {intl.formatMessage({ id: 'OPEN_IN_EXPLORER_BTN_TEXT' })}
                </SettingsMenu.Item>
                <SettingsMenu.Item icon={Icons.eyeOff} onClick={vm.hideCollection} danger>
                    {intl.formatMessage({ id: 'NFT_HIDE_COLLECTION_BTN_TEXT' })}
                </SettingsMenu.Item>
            </SettingsMenu>
        </>
    )
})
