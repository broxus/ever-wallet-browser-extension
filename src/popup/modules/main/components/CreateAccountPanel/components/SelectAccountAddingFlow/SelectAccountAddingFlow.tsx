import { memo } from 'react'
import { useIntl } from 'react-intl'

import { Card, Container, Content, Icon } from '@app/popup/modules/shared'
import { AddAccountFlow } from '@app/popup/modules/account'

import styles from './SelectAccountAddingFlow.module.scss'

interface Props {
    // keyEntry: nt.KeyStoreEntry;
    // keyEntries: nt.KeyStoreEntry[];
    // onChangeDerivedKey(derivedKey: nt.KeyStoreEntry): void;
    onFlow(flow: AddAccountFlow): void
}

export const SelectAccountAddingFlow = memo(({ onFlow }: Props): JSX.Element => {
    const intl = useIntl()

    // TODO: could be returned, remove later
    // const derivedKeysOptions = useMemo(
    //     () => keyEntries.map(key => ({ label: key.name, value: key.publicKey })),
    //     [keyEntries],
    // )
    //
    // const handleChangeDerivedKey = useCallback((value: string) => {
    //     const derivedKey = keyEntries.find(({ publicKey }) => publicKey === value)
    //
    //     if (derivedKey) {
    //         onChangeDerivedKey(derivedKey)
    //     }
    // }, [keyEntries, onChangeDerivedKey])

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_HEADER' })}</h2>
                {/* {derivedKeysOptions.length > 1 && (
                    <Select
                        options={derivedKeysOptions}
                        value={keyEntry?.publicKey}
                        onChange={handleChangeDerivedKey}
                    />
                )} */}
                <Card className={styles.pane}>
                    <button className={styles.btn} onClick={() => onFlow(AddAccountFlow.CREATE)}>
                        <Icon icon="plus" className={styles.icon} />
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_LABEL' })}
                        <Icon icon="chevronRight" className={styles.chevron} />
                    </button>

                    <button className={styles.btn} onClick={() => onFlow(AddAccountFlow.IMPORT)}>
                        <Icon icon="import" className={styles.icon} />
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_ADD_EXTERNAL_LABEL' })}
                        <Icon icon="chevronRight" className={styles.chevron} />
                    </button>
                </Card>
            </Content>
        </Container>
    )
})
