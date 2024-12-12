import * as React from 'react'

import { Button, Container, Content, Footer } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import successSvg from '@app/popup/assets/img/success.svg'

import styles from './index.module.scss'

export const CreateSuccess: React.FC = () => (
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
                    <Button design="accent">
                        Switch to new account
                    </Button>,
                    <Button design="neutral">
                        Continue without switching
                    </Button>,
                ]}
            />
        </Footer>
    </Container>
)
