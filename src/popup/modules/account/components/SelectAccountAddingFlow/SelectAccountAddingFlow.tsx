import { memo } from 'react'
import { useIntl } from 'react-intl'

import { Card, Container, Content, Icon, SlidingPanelHandle, useResolve } from '@app/popup/modules/shared'

import { AddAccountFlow } from '../../models'
import styles from './SelectAccountAddingFlow.module.scss'

interface Props {
    onFlow(flow: AddAccountFlow): void
}

export const SelectAccountAddingFlow = memo(({ onFlow }: Props): JSX.Element => {
    const handle = useResolve(SlidingPanelHandle)
    const intl = useIntl()

    const handleClick = (flow: AddAccountFlow) => () => {
        handle.close()
        onFlow(flow)
    }

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_LISTS_ACCOUNTS_ADD_NEW_BTN_TEXT' })}</h2>

                <Card className={styles.card}>
                    <button className={styles.btn} onClick={handleClick(AddAccountFlow.CREATE)}>
                        <Icon icon="plus" className={styles.icon} />
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_LABEL' })}
                        <Icon icon="chevronRight" className={styles.chevron} />
                    </button>

                    <button className={styles.btn} onClick={handleClick(AddAccountFlow.IMPORT)}>
                        <Icon icon="import" className={styles.icon} />
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_ADD_EXTERNAL_LABEL' })}
                        <Icon icon="chevronRight" className={styles.chevron} />
                    </button>
                </Card>
            </Content>
        </Container>
    )
})
