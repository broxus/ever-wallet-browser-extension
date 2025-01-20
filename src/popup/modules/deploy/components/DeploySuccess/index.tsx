import React from 'react'
import { useIntl } from 'react-intl'

import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { Button, Container, Footer, Space } from '@app/popup/modules/shared'
import settingsSvg from '@app/popup/assets/img/settings.svg'

import styles from './DeploySuccess.module.scss'

type DeploySuccessProps = {
    onSuccess: () => void;
};

export const DeploySuccess = ({ onSuccess }: DeploySuccessProps) => {
    const intl = useIntl()
    return (
        <Container className={styles.container}>
            <Space direction="column" gap="l" className={styles.content}>
                <img
                    src={settingsSvg} width={64} height={64}
                    alt="settings"
                />
                <h2>{intl.formatMessage({ id: 'DEPLOY_WALLET_IN_PROGRESS' })}</h2>
            </Space>
            <Footer className={styles.footer}>
                <FooterAction>
                    <Button key="next" design="accent" onClick={onSuccess}>
                        {intl.formatMessage({ id: 'OK_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
}
