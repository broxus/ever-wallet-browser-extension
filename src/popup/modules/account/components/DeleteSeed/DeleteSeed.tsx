import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useEffect } from 'react'

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
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { convertPublicKey } from '@app/shared'

import { DeleteSeedViewModel } from './DeleteSeedViewModel'
import styles from './DeleteSeed.module.scss'


interface Props {
    keyEntry: nt.KeyStoreEntry;
    onDeleted?(): void;
}

export const DeleteSeed = observer(({ keyEntry, onDeleted }: Props): JSX.Element => {
    const vm = useViewModel(DeleteSeedViewModel, (model) => {
        model.keyEntry = keyEntry
        model.onDeleted = onDeleted
    })
    const intl = useIntl()

    useEffect(() => {
        vm.handle.update({
            title: vm.isLast
                ? intl.formatMessage({ id: 'DELETE_ONLY_SEED_HEADER' })
                : intl.formatMessage({ id: 'DELETE_SEED_HEADER' }),
        })
    }, [vm.isLast])

    return (
        <Container>
            <Content className={styles.content}>
                <Space direction="column" gap="l">
                    <div className={styles.text}>
                        {vm.isLast
                            ? intl.formatMessage({ id: 'DELETE_ONLY_SEED_MESSAGE' })
                            : intl.formatMessage({ id: 'DELETE_SEED_MESSAGE' })}
                    </div>

                    <Space direction="column" gap="m">
                        <div className={styles.title}>
                            {intl.formatMessage({ id: 'DELETE_SEED_LIST_HEADING' })}
                        </div>

                        <Card size="xs" bg="layer-2" className={styles.card}>
                            <div className={styles.item}>
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
                        </Card>
                    </Space>

                    <Space direction="column" gap="m">
                        <div className={styles.title}>
                            {intl.formatMessage({ id: 'PUBLIC_KEYS' })}
                        </div>

                        <Card size="xs" bg="layer-2" className={styles.card}>
                            {vm.derivedKeys.map(key => (
                                <div key={key.publicKey} className={styles.item}>
                                    <Icon icon="key" width={20} height={20} />
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
                        </Card>
                    </Space>
                </Space>

                <ErrorMessage>
                    {vm.error}
                </ErrorMessage>
            </Content>

            <Footer layer>
                <FooterAction>
                    <Button design="neutral" onClick={vm.handle.close}>
                        {intl.formatMessage({ id: 'CANCEL_BTN_TEXT' })}
                    </Button>
                    <Button
                        design="destructive"
                        loading={vm.loading}
                        onClick={vm.isLast ? vm.logOut : vm.deleteSeed}
                    >
                        {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
