import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Container, Content, Header, Input, useSearch, useViewModel } from '@app/popup/modules/shared'

import { ChangeAccountViewModel } from './ChangeAccountViewModel'
import { AccountItem } from './AccountItem'

import './ChangeAccount.scss'

export const ChangeAccount = observer((): JSX.Element => {
    const vm = useViewModel(ChangeAccountViewModel)
    const search = useSearch(vm.items, vm.filter)
    const intl = useIntl()

    return (
        <Container className="change-account">
            <Header>
                <h2>{intl.formatMessage({ id: 'CHANGE_ACCOUNT_TITLE' })}</h2>
                <Input
                    className="change-account__search"
                    size="s"
                    placeholder={intl.formatMessage({ id: 'CHANGE_ACCOUNT_SEARCH_PLACEHOLDER' })}
                    {...search.props}
                />
            </Header>

            <Content>
                <div className="change-account__list">
                    {search.list.map(({ address, name, seed }) => (
                        <AccountItem
                            key={address}
                            address={address}
                            name={name}
                            seed={seed}
                            onClick={vm.handleSelectAccount}
                        />
                    ))}
                </div>

                {!search.list.length && (
                    <div className="change-account__empty">
                        {intl.formatMessage({ id: 'CHANGE_ACCOUNT_EMPTY_SEARCH_HINT' })}
                    </div>
                )}
            </Content>
        </Container>
    )
})
