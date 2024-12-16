import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { Button, Container, Content, Footer, useResolve } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import successSvg from '@app/popup/assets/img/success.svg'
import { CreateSuccessViewModel } from '@app/popup/modules/account/components/CreateAccountPage/CreateSuccess/CreateSuccessViewModel'

import styles from './index.module.scss'

export const CreateSuccess: React.FC = observer(() => {
    const vm = useResolve(CreateSuccessViewModel)

    return (
        <Container>
            <Content className={styles.content}>
                <img className={styles.img} src={successSvg} alt="" />
                <div className={styles.title}>
                    New account has been added successfully
                </div>
                <div className={styles.desc}>
                    When adding a new account, a new public key was also added. They were connected with each other.
                </div>
            </Content>
            <Footer layer>
                <FooterAction
                    dir="column"
                    buttons={[
                        <Button
                            key="switch"
                            design="accent"
                            loading={vm.loading}
                            onClick={vm.switch}
                        >
                            Switch to new account
                        </Button>,
                        <Button
                            key="close"
                            design="neutral"
                            onClick={vm.close}
                        >
                            Continue without switching
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
})
