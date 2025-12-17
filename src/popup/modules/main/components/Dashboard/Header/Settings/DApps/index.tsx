import React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import { Button, Card, Container, Content, Footer, Icon, useSlidingPanel, useViewModel } from '@app/popup/modules/shared'
import sparxSrc from '@app/popup/assets/img/networks/sparx.svg'
import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'

import styles from './index.module.scss'
import { DappsViewModel } from './DAppsViewModel'
import { DisconnectAll } from './DisconnectAll'

type LogOutProps = {
    onClose: () => void;
}

export const DApps = observer(({ onClose }: LogOutProps) => {
    const intl = useIntl()
    const vm = useViewModel(DappsViewModel)

    const panel = useSlidingPanel()


    const handleDisconnectAll = () => {
        panel.open({
            showClose: false,
            render: () => <DisconnectAll onClose={panel.close} />,
        })
    }

    if (!vm.connections.length) {
        return (
            <>
                <SlidingPanelHeader
                    onClose={onClose}
title={(
                        <Icon
                            icon="unplug"
width={56}
height={56}
                            className={styles.unplug}
                        />
                    )}
                />
                <Container>
                    <Content className={styles.card}>
                        <span className={styles.title}>{intl.formatMessage({ id: 'NO_CONNECTED_DAPPS' })}</span>
                    </Content>
                    <Footer layer>
                        <Button design="neutral" onClick={onClose}>
                            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                        </Button>
                    </Footer>
                </Container>
            </>
        )
    }

    return (
        <>
            <SlidingPanelHeader onClose={onClose} title={intl.formatMessage({ id: 'CONNECTED_DAPPS' })} />

            <Container>
                <Card bg="layer-2" size="xs" className={styles.list}>
                    {vm.connections.map((origin, index) => {
                        const item = vm.connectedDAaps.get(origin) || { origin }
                        return (
                            <div
                                key={item.origin}
                                className={classNames(styles.item, { [styles.border]: index !== 0 })}
                            >
                                <div className={styles.info}>
                                    <img
                                        src={item.iconUrl ?? sparxSrc}
alt="logo"
width={24}
                                        height={24}
className={styles.img}
                                    />
                                    <div className={styles.block}>
                                        <span className={styles.name} title={item.name}>
                                            {item.name}
                                        </span>
                                        <span className={styles.origin} title={item.origin}>
                                            {item.origin}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    design="secondary"
disabled={vm.loading.has(item.origin)}
className={styles.button}
                                    size="s"
onClick={() => vm.disconnect([item.origin])}
                                >
                                    Disconnect
                                </Button>
                            </div>
                        )
                    })}
                </Card>

                <Footer layer>
                    <Button design="destructive" onClick={handleDisconnectAll}>
                        {intl.formatMessage({ id: 'DISCONNECT_ALL' })}
                    </Button>
                </Footer>
            </Container>
        </>
    )
})
