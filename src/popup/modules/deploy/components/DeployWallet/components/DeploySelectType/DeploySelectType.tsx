import { memo, useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Button, Checkbox, Container, Content, Footer } from '@app/popup/modules/shared'

import { WalletType } from '../../models'
import styles from './DeploySelectType.module.scss'

interface OptionType {
    value: WalletType;
    label: string;
}

interface Props {
    value: WalletType;
    onChange(value: WalletType): void;
    onNext(): void;
}

export const DeploySelectType = memo(({ value, onChange, onNext }: Props): JSX.Element | null => {
    const intl = useIntl()

    const walletTypesOptions = useMemo<OptionType[]>(() => [
        {
            label: intl.formatMessage({ id: 'DEPLOY_WALLET_SELECT_WALLET_STANDARD' }),
            value: WalletType.Standard,
        },
        {
            label: intl.formatMessage({ id: 'DEPLOY_WALLET_SELECT_WALLET_MULTISIG' }),
            value: WalletType.Multisig,
        },
    ], [])

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'DEPLOY_WALLET_SELECT_TYPE_HEADER' })}</h2>

                <div className={styles.pane}>
                    {walletTypesOptions.map((option) => (
                        <Checkbox
                            labelPosition="before"
                            key={option.value}
                            className={styles.checkbox}
                            checked={option.value === value}
                            onChange={() => onChange(option.value)}
                        >
                            {option.label}
                        </Checkbox>
                    ))}
                </div>
            </Content>

            <Footer>
                <Button onClick={onNext}>
                    {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
