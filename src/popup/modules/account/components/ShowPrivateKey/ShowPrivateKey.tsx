import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Button, Container, Content, CopyButton, EnterPassword, useViewModel } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

import { ShowPrivateKeyViewModel } from './ShowPrivateKeyViewModel'
import styles from './ShowPrivateKey.module.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
}

export const ShowPrivateKey = observer(({ keyEntry }: Props): JSX.Element => {
    const vm = useViewModel(ShowPrivateKeyViewModel, (model) => {
        model.keyEntry = keyEntry
    })
    const intl = useIntl()

    if (!vm.keyPair) {
        return (
            <EnterPassword
                keyEntry={keyEntry}
                loading={vm.loading}
                error={vm.error}
                allowCache={false}
                onSubmit={vm.onSubmit}
            />
        )
    }

    return (
        <Container>
            <Content>
                <h2 className={styles.header}>
                    {intl.formatMessage(
                        { id: 'PRIVATE_KEY_TITLE_TEXT' },
                        { seed: keyEntry.name || convertPublicKey(keyEntry.publicKey) },
                    )}
                </h2>

                <div className={styles.pane}>
                    <div className={styles.label}>
                        {intl.formatMessage({ id: 'PRIVATE_KEY' })}
                    </div>
                    <div className={styles.value}>
                        {vm.keyPair.secret}
                    </div>
                    <CopyButton text={vm.keyPair.secret}>
                        <Button design="contrast" size="s" className={styles.btn}>
                            {Icons.copy}
                            {intl.formatMessage({ id: 'COPY_BTN_TEXT' })}
                        </Button>
                    </CopyButton>
                </div>
            </Content>
        </Container>
    )
})
