import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, Container, Content, CopyButton, EnterPassword, Footer, ParamsPanel, useViewModel } from '@app/popup/modules/shared'
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
                onSubmit={vm.onSubmit}
            />
        )
    }

    return (
        <Container>
            <Content>
                <h2>
                    {intl.formatMessage(
                        { id: 'PRIVATE_KEY_TITLE_TEXT' },
                        { seed: keyEntry.name || convertPublicKey(keyEntry.publicKey) },
                    )}
                </h2>

                <ParamsPanel className={styles.pane}>
                    <ParamsPanel.Param label={intl.formatMessage({ id: 'PRIVATE_KEY' })}>
                        <div className={styles.value}>
                            {vm.keyPair.secret}
                        </div>
                    </ParamsPanel.Param>
                </ParamsPanel>
            </Content>

            <Footer>
                <CopyButton text={vm.keyPair.secret}>
                    <Button>
                        {intl.formatMessage({ id: 'COPY_PRIVATE_KEY_BTN_TEXT' })}
                    </Button>
                </CopyButton>
            </Footer>
        </Container>
    )
})
