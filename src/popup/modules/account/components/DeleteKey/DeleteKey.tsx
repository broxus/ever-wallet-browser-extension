import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import {
    Button,
    Card,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Icon,
    Space,
    useViewModel,
} from '@app/popup/modules/shared'
import { convertAddress } from '@app/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { Jdenticon } from '@app/popup/modules/shared/components/Jdenticon'

import { DeleteKeyViewModel } from './DeleteKeyViewModel'
import styles from './DeleteKey.module.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    onDeleted?(): void;
}

export const DeleteKey = observer(({ keyEntry, onDeleted }: Props): JSX.Element => {
    const vm = useViewModel(DeleteKeyViewModel, (model) => {
        model.keyEntry = keyEntry
        model.onDeleted = onDeleted
    })
    const intl = useIntl()

    return (
        <Container>
            <Content className={styles.content}>
                <Space direction="column" gap="l">
                    <Space direction="column" gap="l">
                        <div className={styles.text}>
                            {intl.formatMessage({ id: 'DELETE_KEY_MESSAGE' })}
                        </div>

                        <div className={styles.title}>
                            {intl.formatMessage({ id: 'DELETE_KEY_LIST_HEADING' })}
                        </div>

                        <Card size="xs" bg="layer-2" className={styles.card}>
                            <div className={styles.item}>
                                <Icon icon="key" width={20} height={20} />
                                <div className={styles.itemContent}>
                                    <div className={styles.itemName} title={vm.name}>
                                        {vm.name}
                                    </div>
                                    <div className={styles.itemInfo}>
                                        {intl.formatMessage(
                                            { id: 'ACCOUNTS_PLURAL' },
                                            { count: vm.accountsByPublicKey[vm.keyEntry.publicKey] ?? 0 },
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Space>

                    <Space direction="column" gap="m">
                        <div className={styles.title}>
                            {intl.formatMessage({ id: 'DELETE_KEY_LIST_ACCOUNTS_HEADING' })}
                        </div>

                        <Card size="xs" bg="layer-2" className={styles.card}>
                            {vm.accounts.map((account) => (
                                <div key={account.tonWallet.address} className={styles.item}>
                                    <Jdenticon value={account.tonWallet.address} />
                                    <div className={styles.itemContent}>
                                        <div className={styles.itemName} title={account.name}>
                                            {account.name}
                                        </div>
                                        <div className={styles.itemInfo} title={account.tonWallet.address}>
                                            {convertAddress(account.tonWallet.address)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Card>
                    </Space>
                </Space>

                <ErrorMessage>
                    {vm.error}
                </ErrorMessage>
            </Content>


            <Footer layer>
                <FooterAction
                    buttons={[
                        <Button design="neutral" onClick={vm.handle.close}>
                            {intl.formatMessage({ id: 'CANCEL_BTN_TEXT' })}
                        </Button>,
                        <Button
                            design="destructive"
                            loading={vm.loading}
                            onClick={vm.deleteKey}
                        >
                            {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
})
