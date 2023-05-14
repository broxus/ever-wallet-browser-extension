import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import KeyIcon from '@app/popup/assets/icons/key.svg'
import SeedSrc from '@app/popup/assets/img/seed.svg'
import {
    Button,
    ButtonGroup,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header,
    useViewModel,
} from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

import { DeleteSeedViewModel } from './DeleteSeedViewModel'

import './DeleteSeed.scss'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    onClose: () => void;
}

export const DeleteSeed = observer(({ keyEntry, onClose }: Props): JSX.Element => {
    const vm = useViewModel(DeleteSeedViewModel, (model) => {
        model.keyEntry = keyEntry
        model.onClose = onClose
    }, [keyEntry, onClose])
    const intl = useIntl()

    return (
        <Container className="delete-seed">
            <Header>
                <h2 className="delete-seed__title">
                    {vm.isLast
                        ? intl.formatMessage({ id: 'DELETE_ONLY_SEED_HEADER' })
                        : intl.formatMessage({ id: 'DELETE_SEED_HEADER' })}
                </h2>
            </Header>

            <Content>
                <div className="delete-seed__message">
                    {vm.isLast
                        ? intl.formatMessage({ id: 'DELETE_ONLY_SEED_MESSAGE' })
                        : intl.formatMessage({ id: 'DELETE_SEED_MESSAGE' })}
                </div>

                <div className="delete-seed__list">
                    <div className="delete-seed__list-title">
                        {intl.formatMessage({ id: 'DELETE_SEED_LIST_HEADING' })}
                    </div>
                    <div className="list-item">
                        <img className="list-item__img" src={SeedSrc} alt="" />
                        <div className="list-item__content">
                            <div className="list-item__name" title={vm.name}>
                                {vm.name}
                            </div>
                            <div className="list-item__info">
                                {intl.formatMessage(
                                    { id: 'PUBLIC_KEYS_PLURAL' },
                                    { count: vm.derivedKeys.length },
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="delete-seed__list">
                    <div className="delete-seed__list-title">
                        {intl.formatMessage({ id: 'DELETE_SEED_LIST_KEYS_HEADING' })}
                    </div>
                    {vm.derivedKeys.map(key => (
                        <div key={key.publicKey} className="list-item">
                            <KeyIcon className="list-item__img" />
                            <div className="list-item__content">
                                <div className="list-item__name" title={key.name}>
                                    {key.name}
                                </div>
                                <div className="list-item__info" title={key.publicKey}>
                                    {convertPublicKey(key.publicKey)}
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

                <ErrorMessage>
                    {vm.error}
                </ErrorMessage>

            </Content>

            <Footer>
                <ButtonGroup>
                    <Button group="small" design="secondary" onClick={onClose}>
                        {intl.formatMessage({ id: 'CANCEL_BTN_TEXT' })}
                    </Button>
                    <Button design="error" disabled={vm.loading} onClick={vm.isLast ? vm.logOut : vm.deleteSeed}>
                        {intl.formatMessage({ id: 'DELETE_SEED_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
