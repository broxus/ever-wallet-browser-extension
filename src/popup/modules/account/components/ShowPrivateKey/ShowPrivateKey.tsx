import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import CopyIcon from '@app/popup/assets/icons/copy.svg'
import {
    Button,
    Container,
    Content,
    CopyText,
    EnterPassword,
    Footer,
    Header,
    useViewModel,
} from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

import { ShowPrivateKeyViewModel } from './ShowPrivateKeyViewModel'
import './ShowPrivateKey.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    onClose(): void;
}

export const ShowPrivateKey = observer(({ keyEntry, onClose }: Props): JSX.Element => {
    const vm = useViewModel(ShowPrivateKeyViewModel, (model) => {
        model.keyEntry = keyEntry
    })
    const intl = useIntl()

    if (!vm.keyPair) {
        return (
            <EnterPassword
                keyEntry={keyEntry}
                disabled={vm.loading}
                error={vm.error}
                allowCache={false}
                onSubmit={vm.onSubmit}
                onBack={onClose}
            />
        )
    }

    return (
        <Container className="private-key">
            <Header>
                <h2>
                    {intl.formatMessage(
                        { id: 'PRIVATE_KEY_TITLE_TEXT' },
                        { seed: keyEntry.name || convertPublicKey(keyEntry.publicKey) },
                    )}
                </h2>
            </Header>

            <Content>
                <CopyText text={vm.keyPair.secret} style={{ zIndex: 101 }}>
                    <div className="private-key__secret">
                        <div className="private-key__secret-text">{vm.keyPair.secret}</div>
                        <CopyIcon className="private-key__secret-icon" />
                    </div>
                </CopyText>
            </Content>

            <Footer>
                <Button onClick={onClose}>
                    {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
