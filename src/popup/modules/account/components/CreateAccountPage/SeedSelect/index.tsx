import * as React from 'react'
import { useNavigate } from 'react-router'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, Header, Navbar, RadioButton } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import styles from './index.module.scss'

export const SeedSelect: React.FC = () => {
    const intl = useIntl()
    const navigate = useNavigate()

    return (
        <Container>
            <Header>
                <Navbar back={() => navigate(-1)}>
                    {intl.formatMessage({ id: 'NEW_ACCOUNT' })}
                </Navbar>
            </Header>
            <Content>
                <RadioButton
                    value="1"
                    className={styles.item}
                    onChange={() => 1}
                    labelPosition="before"
                    checked
                >
                    Seed 1
                </RadioButton>
                <RadioButton
                    value="1"
                    className={styles.item}
                    onChange={() => 1}
                    labelPosition="before"
                    checked={false}
                >
                    Seed 2
                </RadioButton>
                <RadioButton
                    value="1"
                    className={styles.item}
                    onChange={() => 1}
                    labelPosition="before"
                    checked={false}
                >
                    Seed 3
                </RadioButton>
            </Content>
            <Footer layer>
                <FooterAction
                    buttons={[
                        <Button design="accent">
                            {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
}
