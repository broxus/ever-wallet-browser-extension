import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { convertAddress } from '@app/shared'
import { Container, Content, Header, Input, UserAvatar, useViewModel } from '@app/popup/modules/shared'

import { ChangeAccountViewModel } from './ChangeAccountViewModel'

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
                    {vm.accounts.map((account) => (
                        <div
                            className="change-account__account"
                            key={account.tonWallet.address}
                            onClick={() => vm.handleSelectAccount(account)}
                        >
                            <UserAvatar className="change-account__account-avatar" address={account.tonWallet.address} small />
                            <div className="change-account__account-content">
                                <div className="change-account__account-name" title={account.name}>
                                    {account.name}
                                </div>
                                <div className="change-account__account-address">
                                    {convertAddress(account.tonWallet.address)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!vm.accounts.length && (
                    <div className="change-account__empty">
                        {intl.formatMessage({ id: 'CHANGE_ACCOUNT_EMPTY_SEARCH_HINT' })}
                    </div>
                )}
            </Content>
        </Container>
    )
})
