import React from 'react'
import { useIntl } from 'react-intl'

import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { Button, Container, Footer, Space } from '@app/popup/modules/shared'
import { DeployAnimation } from '@app/popup/modules/shared/components/RiveAnimation/Animations/DeployAnimation'

import styles from './DeploySuccess.module.scss'

type DeploySuccessProps = {
    onSuccess: () => void;
}

export const DeploySuccess = ({ onSuccess }: DeploySuccessProps) => {
    const intl = useIntl()
    return (
        <Container className={styles.container}>
            <Space direction="column" gap="l" className={styles.content}>
                <DeployAnimation />
                <h2>{intl.formatMessage({ id: 'DEPLOY_WALLET_IN_PROGRESS' })}</h2>
            </Space>
            <Footer className={styles.footer}>
                <FooterAction>
                    <Button key="next" design="neutral" onClick={onSuccess}>
                        {intl.formatMessage({ id: 'OK_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
}
