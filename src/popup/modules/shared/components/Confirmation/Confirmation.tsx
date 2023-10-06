import { memo, ReactNode } from 'react'
import { useIntl } from 'react-intl'

import { Button } from '../Button'
import { Space } from '../Space'
import { Container, Content, Footer } from '../layout'
import styles from './Confirmation.module.scss'

interface Props {
    title: ReactNode;
    body: ReactNode;
    cancelBtnText?: string;
    confirmBtnText?: string;
    onConfirm(): void;
    onCancel(): void;
}

export type ConfirmationProps = Props

export const Confirmation = memo((props: Props): JSX.Element => {
    const { title, body, cancelBtnText, confirmBtnText, onConfirm, onCancel } = props
    const intl = useIntl()

    return (
        <Container>
            <Content>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.body}>{body}</p>
            </Content>
            <Footer>
                <Space direction="column" gap="s">
                    <Button design="primary" onClick={onCancel}>
                        {cancelBtnText ?? intl.formatMessage({ id: 'CANCEL_BTN_TEXT' })}
                    </Button>
                    <Button design="secondary" onClick={onConfirm}>
                        {confirmBtnText ?? intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
