import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Container, Content, Header, Navbar, Select, Space } from '@app/popup/modules/shared'

import { AddAccountFlow } from '../../models'
import styles from './SelectAccountAddingFlow.module.scss'

interface Props {
    derivedKey: nt.KeyStoreEntry;
    derivedKeys: nt.KeyStoreEntry[];
    onChangeDerivedKey(derivedKey: nt.KeyStoreEntry): void;
    onFlow(flow: AddAccountFlow): void
}

export const SelectAccountAddingFlow = memo((props: Props): JSX.Element => {
    const { derivedKey, derivedKeys, onChangeDerivedKey, onFlow } = props
    const intl = useIntl()

    const derivedKeysOptions = useMemo(
        () => derivedKeys.map(key => ({ label: key.name, value: key.publicKey })),
        [derivedKeys],
    )

    const handleChangeDerivedKey = useCallback((value: string) => {
        const derivedKey = derivedKeys.find(({ publicKey }) => publicKey === value)

        if (derivedKey) {
            onChangeDerivedKey(derivedKey)
        }
    }, [derivedKeys, onChangeDerivedKey])

    return (
        <Container>
            <Header>
                <Navbar back="..">
                    {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_HEADER' })}
                </Navbar>
            </Header>

            <Content>
                <Space direction="column" gap="l">
                    {derivedKeysOptions.length > 1 && (
                        <Select
                            options={derivedKeysOptions}
                            value={derivedKey?.publicKey}
                            onChange={handleChangeDerivedKey}
                        />
                    )}

                    <button className={styles.btn} onClick={() => onFlow(AddAccountFlow.CREATE)}>
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_LABEL' })}
                        {Icons.chevronRight}
                    </button>

                    <button className={styles.btn} onClick={() => onFlow(AddAccountFlow.IMPORT)}>
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_ADD_EXTERNAL_LABEL' })}
                        {Icons.chevronRight}
                    </button>
                </Space>
            </Content>
        </Container>
    )
})
