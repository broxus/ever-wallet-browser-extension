import React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button, Container, Content, Footer, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import Alert from '@app/popup/assets/img/alert.svg'
import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'

import styles from './index.module.scss'
import { DappsViewModel } from './DAppsViewModel'

type DisconnectAllProps = {
    onClose: () => void;
}

export const DisconnectAll = observer(({ onClose }: DisconnectAllProps) => {
    const intl = useIntl()
    const vm = useViewModel(DappsViewModel)


    const handleDisconnectAll = async () => {
        await vm.disconnectAll()
        onClose()
    }

    return (
        <>
            <SlidingPanelHeader
                onClose={onClose}
title={(
                    <img
                        src={Alert}
width={56}
height={56}
                        className={styles.alert}
                        alt="icon"
                    />
                )}
            />
            <Container>
                <Content className={styles.card}>
                    <span className={styles.title}>{intl.formatMessage({ id: 'DISCONNECT_ALL_CONFIRM' })}</span>
                </Content>
                <Footer layer>
                    <FooterAction>
                        <Button design="neutral" onClick={onClose}>
                            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                        </Button>
                        <Button design="destructive" onClick={handleDisconnectAll} disabled={!!vm.loading.size}>
                            {intl.formatMessage({ id: 'DISCONNECT_ALL' })}
                        </Button>
                    </FooterAction>
                </Footer>
            </Container>
        </>
    )
})
