import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, Container, Content, CopyButton, EnterPassword, Footer, useViewModel } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'
import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { Data } from '@app/popup/modules/shared/components/Data'

import { ShowPrivateKeyViewModel } from './ShowPrivateKeyViewModel'

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
                onClose={vm.handle.close}
            />
        )
    }

    return (
        <>
            <SlidingPanelHeader
                onClose={vm.handle.close}
                title={intl.formatMessage(
                    { id: 'PRIVATE_KEY_TITLE_TEXT' },
                    { seed: keyEntry.name || convertPublicKey(keyEntry.publicKey) },
                )}
            />
            <Container>
                <Content>
                    <Data
                        dir="v"
                        label={intl.formatMessage({ id: 'PRIVATE_KEY' })}
                        value={vm.keyPair.secret}
                    />
                </Content>

                <Footer>
                    <FooterAction
                        buttons={[
                            <CopyButton text={vm.keyPair.secret}>
                                <Button design="accent">
                                    {intl.formatMessage({ id: 'COPY_PRIVATE_KEY_BTN_TEXT' })}
                                </Button>
                            </CopyButton>,
                        ]}
                    />
                </Footer>
            </Container>
        </>
    )
})
