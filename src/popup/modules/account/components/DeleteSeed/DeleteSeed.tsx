import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import EverKey from '@app/popup/assets/img/ever-key.svg'
import EverLogo from '@app/popup/assets/img/ever-logo.svg'
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
    onDelete: () => void;
    onBack: () => void;
}

export const DeleteSeed = observer(({ onDelete, onBack }: Props): JSX.Element => {
    const vm = useViewModel(DeleteSeedViewModel, (model) => {
        model.onDelete = onDelete
    })
    const intl = useIntl()

    return (
        <Container className="delete-seed">
            <Header>
                <h2>{intl.formatMessage({ id: 'DELETE_SEED_HEADER' })}</h2>
            </Header>

            <Content>
                <div className="delete-seed__message">
                    {intl.formatMessage({ id: 'DELETE_SEED_MESSAGE' })}
                </div>

                <div className="delete-seed__list">
                    <div className="delete-seed__list-title">
                        {intl.formatMessage({ id: 'DELETE_SEED_LIST_HEADING' })}
                    </div>
                    <div className="list-item">
                        <img className="list-item__img" src={EverLogo} alt="" />
                        <div className="list-item__content">
                            <div className="list-item__name" title={vm.name}>
                                {vm.name}
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
                            <img className="list-item__img" src={EverKey} alt="" />
                            <div className="list-item__content">
                                <div className="list-item__name" title={key.name}>
                                    {key.name}
                                </div>
                                <div className="list-item__info" title={key.publicKey}>
                                    {convertPublicKey(key.publicKey)}
                                    <span className="list-item__info-accounts">
                                        {intl.formatMessage(
                                            { id: 'DELETE_SEED_ACCOUNTS_PLURAL' },
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
                    <Button group="small" design="secondary" onClick={onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button design="error" disabled={vm.loading} onClick={vm.deleteSeed}>
                        {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
