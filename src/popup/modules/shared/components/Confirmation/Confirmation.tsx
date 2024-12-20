import { memo, ReactNode } from 'react'
import { useIntl } from 'react-intl'

import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { Button } from '../Button'
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
            <Content className={styles.content}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.body}>{body}</p>
            </Content>
            <Footer>
                <FooterAction
                    buttons={[
                        <Button design="neutral" onClick={onCancel}>
                            {cancelBtnText ?? intl.formatMessage({ id: 'CANCEL_BTN_TEXT' })}
                        </Button>,
                        <Button design="accent" onClick={onConfirm}>
                            {confirmBtnText ?? intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
})
