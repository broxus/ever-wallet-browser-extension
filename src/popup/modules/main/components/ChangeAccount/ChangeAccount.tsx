import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Container, Content, Header, Input, useViewModel } from '@app/popup/modules/shared'

import { ChangeAccountViewModel } from './ChangeAccountViewModel'
import { AccountItem } from './AccountItem'

import './ChangeAccount.scss'

export const ChangeAccount = observer((): JSX.Element => {
    const vm = useViewModel(ChangeAccountViewModel)
    const intl = useIntl()

    return (
        <Container className="change-account">
            <Header>
                <h2>{intl.formatMessage({ id: 'CHANGE_ACCOUNT_TITLE' })}</h2>
                <Input
                    className="change-account__search"
                    size="s"
                    placeholder={intl.formatMessage({ id: 'CHANGE_ACCOUNT_SEARCH_PLACEHOLDER' })}
                    value={vm.search}
                    onChange={vm.handleSearch}
                />
            </Header>

            <Content>
                <div className="change-account__list">
                    {vm.items.map(({ address, name, seed }) => (
                        <AccountItem
                            key={address}
                            address={address}
                            name={name}
                            seed={seed}
                            onClick={vm.handleSelectAccount}
                        />
                    ))}
                </div>

                {!vm.items.length && (
                    <div className="change-account__empty">
                        {intl.formatMessage({ id: 'CHANGE_ACCOUNT_EMPTY_SEARCH_HINT' })}
                    </div>
                )}
            </Content>
        </Container>
    )
})
