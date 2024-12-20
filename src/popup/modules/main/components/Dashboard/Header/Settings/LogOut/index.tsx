import React from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Footer, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { SettingsViewModel } from '../SettingsViewModel'
import styles from './index.module.scss'

type LogOutProps = {
    onClose: () => void;
};

export const LogOut = ({ onClose }: LogOutProps) => {
    const intl = useIntl()
    const vm = useViewModel(SettingsViewModel)

    return (
        <Container>
            <p className={styles.description}>{intl.formatMessage({ id: 'ACCOUNT_LOGOUT_DESCRIPTION_TEXT' })}</p>
            <Footer layer>
                <FooterAction
                    buttons={[
                        <Button design="neutral" onClick={onClose}>
                            {intl.formatMessage({ id: 'CANCEL_BTN_TEXT' })}
                        </Button>,
                        <Button design="destructive" onClick={() => vm.logOut()}>
                            {intl.formatMessage({ id: 'ACCOUNT_LOGOUT_BTN_TEXT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
}
