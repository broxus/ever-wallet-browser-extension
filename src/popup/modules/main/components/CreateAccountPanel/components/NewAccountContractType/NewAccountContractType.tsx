import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, RadioButton, Space } from '@app/popup/modules/shared'
import { DEFAULT_MS_WALLET_TYPE, DEFAULT_WALLET_TYPE } from '@app/shared'

import styles from './NewAccountContractType.module.scss'

interface Props {
    loading?: boolean;
    onSubmit(type: nt.ContractType): void;
    onBack(): void;
}

export const NewAccountContractType = memo(({ loading, onSubmit, onBack }: Props): JSX.Element => {
    const intl = useIntl()
    const [contractType, setContractType] = useState(DEFAULT_WALLET_TYPE)

    const handleSubmit = () => onSubmit(contractType)

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'CONTRACT_TYPE_PANEL_HEADER' })}</h2>
                <div className={styles.pane}>
                    <RadioButton<nt.ContractType>
                        labelPosition="before"
                        className={styles.item}
                        checked={DEFAULT_WALLET_TYPE === contractType}
                        value={DEFAULT_WALLET_TYPE}
                        onChange={() => setContractType(DEFAULT_WALLET_TYPE)}
                    >
                        <div className={styles.name}>
                            {intl.formatMessage({ id: 'CREATE_ACCOUNT_DEFAULT' })}
                        </div>
                        <div className={styles.desc}>
                            {intl.formatMessage({ id: 'CREATE_ACCOUNT_DEFAULT_HINT' })}
                        </div>
                    </RadioButton>
                    <RadioButton<nt.ContractType>
                        labelPosition="before"
                        className={styles.item}
                        checked={DEFAULT_MS_WALLET_TYPE === contractType}
                        value={DEFAULT_MS_WALLET_TYPE}
                        onChange={() => setContractType(DEFAULT_MS_WALLET_TYPE)}
                    >
                        <div className={styles.name}>
                            {intl.formatMessage({ id: 'CREATE_ACCOUNT_MULTISIGNATURE' })}
                        </div>
                    </RadioButton>
                </div>
            </Content>

            <Footer>
                <Space direction="row" gap="s">
                    <Button design="secondary" onClick={onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button loading={loading} onClick={handleSubmit}>
                        {intl.formatMessage({ id: 'CREATE_ACCOUNT_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
