import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, Card, Container, Content, Footer, PasswordForm, Space, usePasswordForm, UserInfo } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'

import styles from './PreparedMessage.module.scss'
import { DeploySuccess } from '../DeploySuccess'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    account: nt.AssetsList;
    fees?: string;
    error?: string;
    loading?: boolean;
    onSubmit(password?: string): Promise<boolean>;
    onClose(): void;
}

export const Confirm = memo((props: Props): JSX.Element => {
    const { keyEntry, account, loading, error, fees, onClose, onSubmit } = props

    const intl = useIntl()
    const { form, isValid, handleSubmit } = usePasswordForm(keyEntry)

    const [isDeployed, setIsDeployed] = useState(false)

    const handleConfirm = async (password?: string) => {
        const isSuccess = await onSubmit(password)

        if (isSuccess) {
            setIsDeployed(true)
        }
    }

    if (isDeployed) {
        return <DeploySuccess onSuccess={onClose} />
    }

    return (
        <>
            <SlidingPanelHeader title={intl.formatMessage({ id: 'DEPLOY_WALLET_HEADER' })} onClose={onClose} />
            <Container>
                <Content>
                    <Space direction="column" gap="m">
                        <Card size="s" bg="layer-3" className={styles.card}>
                            <UserInfo account={account} />
                        </Card>

                        <PasswordForm
                            form={form} error={error} keyEntry={keyEntry}
                            onSubmit={handleSubmit(handleConfirm)}
                        />
                    </Space>
                </Content>

                <Footer>
                    <FooterAction>
                        <Button
                            disabled={!fees || !isValid} loading={loading}
                            onClick={handleSubmit(handleConfirm)}
                        >
                            {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                        </Button>
                    </FooterAction>
                </Footer>
            </Container>
        </>
    )
})
