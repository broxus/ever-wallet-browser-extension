import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Button, Container, Content, ErrorMessage, Footer, RoundedIcon, Space, UserAvatar, useViewModel } from '@app/popup/modules/shared'
import { convertAddress } from '@app/shared'

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
            <Content>
                <h2>
                    {intl.formatMessage({ id: 'DELETE_KEY_HEADER' })}
                </h2>

                <div className={styles.text}>
                    {intl.formatMessage({ id: 'DELETE_KEY_MESSAGE' })}
                </div>

                <div className={styles.pane}>
                    <h2>{intl.formatMessage({ id: 'DELETE_KEY_LIST_HEADING' })}</h2>
                    <div className={styles.list}>
                        <div className={styles.item}>
                            <RoundedIcon icon={Icons.key} />
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
                    </div>

                    <h2>{intl.formatMessage({ id: 'DELETE_KEY_LIST_ACCOUNTS_HEADING' })}</h2>
                    <div className={styles.list}>
                        {vm.accounts.map((account) => (
                            <div key={account.tonWallet.address} className={styles.item}>
                                <UserAvatar address={account.tonWallet.address} />
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
                    </div>
                </div>

                <ErrorMessage>
                    {vm.error}
                </ErrorMessage>
            </Content>

            <Footer>
                <Space direction="column" gap="s">
                    <Button design="primary" onClick={() => vm.handle.close()}>
                        {intl.formatMessage({ id: 'CANCEL_BTN_TEXT' })}
                    </Button>
                    <Button
                        design="secondary"
                        className={styles.delete}
                        loading={vm.loading}
                        onClick={vm.deleteKey}
                    >
                        {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
