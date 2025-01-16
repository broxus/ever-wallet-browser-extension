import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'

import { Button, Container, Content, Footer, useResolve } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import successSvg from '@app/popup/assets/img/success.svg'
import { CreateSuccessViewModel } from '@app/popup/modules/account/components/CreateAccountPage/CreateSuccess/CreateSuccessViewModel'

import styles from './CreateSuccess.module.scss'

export const CreateSuccess: React.FC = observer(() => {
    const intl = useIntl()
    const vm = useResolve(CreateSuccessViewModel)
    const params = useParams()

    return (
        <Container>
            <Content className={styles.content}>
                <img className={styles.img} src={successSvg} alt="" />
                <div className={styles.title}>
                    {intl.formatMessage({
                        id: 'NEW_ACCOUNT_TITLE',
                    })}
                </div>
                <div className={styles.desc}>
                    {intl.formatMessage({
                        id: 'NEW_ACCOUNT_DESC',
                    })}
                </div>
            </Content>
            <Footer layer>
                <FooterAction dir="column">
                    <Button
                        key="switch"
                        design="accent"
                        loading={vm.loading}
                        onClick={() => vm.switch(params.address!)}
                    >
                        {intl.formatMessage({
                            id: 'NEW_ACCOUNT_SWITCH',
                        })}
                    </Button>
                    <Button
                        key="close"
                        design="neutral"
                        onClick={vm.close}
                    >
                        {intl.formatMessage({
                            id: 'NEW_ACCOUNT_CONTINUE',
                        })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
