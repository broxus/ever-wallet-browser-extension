import { memo, ReactNode } from 'react'
import { useIntl } from 'react-intl'

import { Button, ButtonGroup } from '../Button'
import { Container, Content, Footer, Header } from '../layout'

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
            <Header>
                <h2 className="confirmation__title">{title}</h2>
            </Header>
            <Content className="confirmation__content">
                {body}
            </Content>
            <Footer>
                <ButtonGroup>
                    <Button group="small" design="secondary" onClick={onCancel}>
                        {cancelBtnText ?? intl.formatMessage({ id: 'CANCEL_BTN_TEXT' })}
                    </Button>
                    <Button design="error" onClick={onConfirm}>
                        {confirmBtnText ?? intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
