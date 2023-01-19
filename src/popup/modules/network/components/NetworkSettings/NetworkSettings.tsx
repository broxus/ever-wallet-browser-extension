import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { Button, Container, Content, Footer, Header } from '@app/popup/modules/shared'
import ArrowIcon from '@app/popup/assets/icons/arrow-right.svg'
import LockIcon from '@app/popup/assets/icons/lock.svg'
import CheckIcon from '@app/popup/assets/icons/check.svg'
import { ConnectionDataItem } from '@app/models'

import './NetworkSettings.scss'

interface Props {
    networks: ConnectionDataItem[];
    current: ConnectionDataItem;
    onEdit(network: ConnectionDataItem): void;
    onAdd(): void;
}

export const NetworkSettings = observer(({ networks, current, onEdit, onAdd }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <Container className="network-settings">
            <Header>
                <h2>{intl.formatMessage({ id: 'NETWORK_HEADER' })}</h2>
            </Header>

            <Content>
                <ul className="network-settings__list">
                    {networks.map((network) => {
                        const isActive = current.connectionId === network.connectionId
                        const isMainnet = network.group === 'mainnet'

                        return (
                            <li className="network-settings__list-item" key={network.connectionId}>
                                <button
                                    type="button"
                                    className={classNames('network-settings__list-item-btn', {
                                        _locked: isMainnet || isActive,
                                    })}
                                    title={network.name}
                                    onClick={(isMainnet || isActive) ? undefined : () => onEdit(network)}
                                >
                                    {network.name}
                                </button>
                                {isActive && (
                                    <CheckIcon className="network-settings__list-item-icon _check" />
                                )}
                                {!isActive && !isMainnet && (
                                    <ArrowIcon className="network-settings__list-item-icon" />
                                )}
                                {!isActive && isMainnet && (
                                    <LockIcon className="network-settings__list-item-icon" />
                                )}
                            </li>
                        )
                    })}
                </ul>
            </Content>

            <Footer>
                <Button design="secondary" onClick={onAdd}>
                    {intl.formatMessage({ id: 'NETWORK_ADD_CUSTOM_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
