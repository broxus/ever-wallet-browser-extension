import * as React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Container, Content, Header, Icon, Navbar } from '@app/popup/modules/shared'

import styles from './AccountCreateType.module.scss'

export const AccountCreateType: React.FC = () => {
    const intl = useIntl()
    const navigate = useNavigate()

    return (
        <Container>
            <Header>
                <Navbar close="window">
                    {intl.formatMessage({ id: 'NEW_ACCOUNT' })}
                </Navbar>
            </Header>
            <Content>
                <button
                    className={styles.item}
                    onClick={() => navigate('/create')}
                >
                    <Icon icon="plus" className={styles.icon} />
                    <div className={styles.title}>
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_LABEL' })}
                    </div>
                    <div className={styles.desc}>
                        {intl.formatMessage({ id: 'CREATE_NEW_ACC_DESC' })}
                    </div>
                </button>
                <button className={styles.item}>
                    <Icon icon="import" className={styles.icon} />
                    <div className={styles.title}>
                        {intl.formatMessage({ id: 'ADD_EXTERNAL_ACCOUNT' })}
                    </div>
                    <div className={styles.desc}>
                        {intl.formatMessage({ id: 'ADD_EXTERNAL_ACC_DESC' })}
                    </div>
                </button>
            </Content>
        </Container>
    )
}
