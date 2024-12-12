import * as React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, Card, Container, Content, Footer, Header, Icon, Input, Navbar, RadioButton } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import styles from './index.module.scss'

export const AccountForm: React.FC = () => {
    const intl = useIntl()
    const navigate = useNavigate()
    const [deprecatedVisible, setDeprecatedVisible] = React.useState(false)

    return (
        <Container>
            <Header>
                <Navbar back={() => navigate(-1)}>
                    {intl.formatMessage({ id: 'NEW_ACCOUNT' })}
                </Navbar>
            </Header>
            <Content className={styles.content}>
                <Input
                    size="xs"
                    placeholder={intl.formatMessage({
                        id: 'ACCOUNT_NAME',
                    })}
                />
                <Card size="s" bg="layer-1" className={styles.card}>
                    <RadioButton
                        checked
                        value="1"
                        onChange={() => 1}
                        labelPosition="before"
                        className={styles.item}
                    >
                        <div className={styles.title}>Default</div>
                        <div className={styles.desc}>Recommened</div>
                    </RadioButton>
                    <RadioButton
                        checked={false}
                        value="1"
                        onChange={() => 1}
                        labelPosition="before"
                        className={styles.item}
                    >
                        <div className={styles.title}>Multisignature</div>
                        <div className={styles.desc}>For experienced users</div>
                    </RadioButton>
                </Card>

                <button
                    onClick={() => setDeprecatedVisible(!deprecatedVisible)}
                    className={styles.toggler}
                >
                    <div className={styles.title}>
                        Show deprecated type
                        <Icon icon={deprecatedVisible ? 'chevronUp' : 'chevronDown'} />
                    </div>
                    <div className={styles.desc}>
                        We do not recommend using deprecated contract types for new accounts.
                    </div>
                </button>
                {deprecatedVisible && (
                    <Card size="s" bg="layer-1" className={styles.card}>
                        <RadioButton
                            checked
                            value="1"
                            onChange={() => 1}
                            labelPosition="before"
                            className={styles.item}
                        >
                            <div className={styles.title}>Surf wallet</div>
                            <div className={styles.desc}>Wallet contract used in Surf. Requires deployment.</div>
                        </RadioButton>
                        <RadioButton
                            checked={false}
                            value="1"
                            onChange={() => 1}
                            labelPosition="before"
                            className={styles.item}
                        >
                            <div className={styles.title}>Wallet V3</div>
                            <div className={styles.desc}>
                                Small legacy contract with one custodian. Deploys automatically.
                            </div>
                        </RadioButton>
                    </Card>
                )}
            </Content>
            <Footer layer>
                <FooterAction
                    buttons={[
                        <Button design="accent">
                            {intl.formatMessage({ id: 'ADD_ACCOUNT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
}
