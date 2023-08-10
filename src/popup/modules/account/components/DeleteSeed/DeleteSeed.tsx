import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Button, Container, Content, ErrorMessage, Footer, RoundedIcon, Space, useViewModel } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

import { DeleteSeedViewModel } from './DeleteSeedViewModel'
import styles from './DeleteSeed.module.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
}

export const DeleteSeed = observer(({ keyEntry }: Props): JSX.Element => {
    const vm = useViewModel(DeleteSeedViewModel, (model) => {
        model.keyEntry = keyEntry
    }, [keyEntry])
    const intl = useIntl()

    return (
        <Container>
            <Content>
                <h2>
                    {vm.isLast
                        ? intl.formatMessage({ id: 'DELETE_ONLY_SEED_HEADER' })
                        : intl.formatMessage({ id: 'DELETE_SEED_HEADER' })}
                </h2>

                <div className={styles.text}>
                    {vm.isLast
                        ? intl.formatMessage({ id: 'DELETE_ONLY_SEED_MESSAGE' })
                        : intl.formatMessage({ id: 'DELETE_SEED_MESSAGE' })}
                </div>

                <div className={styles.pane}>
                    <h2>{intl.formatMessage({ id: 'DELETE_SEED_LIST_HEADING' })}</h2>
                    <div className={styles.list}>
                        <div className={styles.item}>
                            <RoundedIcon icon={Icons.seed} />
                            <div className={styles.itemContent}>
                                <div className={styles.itemName} title={vm.name}>
                                    {vm.name}
                                </div>
                                <div className={styles.itemInfo}>
                                    {intl.formatMessage(
                                        { id: 'PUBLIC_KEYS_PLURAL' },
                                        { count: vm.derivedKeys.length },
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2>{intl.formatMessage({ id: 'DELETE_SEED_LIST_KEYS_HEADING' })}</h2>
                    <div className={styles.list}>
                        {vm.derivedKeys.map(key => (
                            <div key={key.publicKey} className={styles.item}>
                                <RoundedIcon icon={Icons.seed} />
                                <div className={styles.itemContent}>
                                    <div className={styles.itemName} title={key.name}>
                                        {key.name}
                                    </div>
                                    <div className={styles.itemInfo} title={key.publicKey}>
                                        {convertPublicKey(key.publicKey)}
                                        <span>&nbsp;•&nbsp;</span>
                                        <span className="list-item__info-accounts">
                                            {intl.formatMessage(
                                                { id: 'ACCOUNTS_PLURAL' },
                                                { count: vm.accountsByPublicKey[key.publicKey] ?? 0 },
                                            )}
                                        </span>
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
                    <Button
                        design="secondary"
                        className={styles.delete}
                        loading={vm.loading}
                        onClick={vm.isLast ? vm.logOut : vm.deleteSeed}
                    >
                        {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                    </Button>
                    <Button design="secondary" onClick={() => vm.handle.close()}>
                        {intl.formatMessage({ id: 'CANCEL_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
