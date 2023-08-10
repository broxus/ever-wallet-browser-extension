import { memo, ReactNode } from 'react'
import { useIntl } from 'react-intl'

import { Button } from '../Button'
import { Space } from '../Space'
import { Container, Content, Footer } from '../layout'

import './Confirmation.scss'

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
        <Container className="confirmation">
            <Content>
                <h2 className="confirmation__title">{title}</h2>
                <p className="confirmation__body">{body}</p>
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
