import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Virtuoso } from 'react-virtuoso'
import { useCallback, useState } from 'react'

import { Container, Content, Header, Input, useSearch, useViewModel } from '@app/popup/modules/shared'

import { ChangeAccountViewModel } from './ChangeAccountViewModel'
import { AccountItem } from './AccountItem'

import './ChangeAccount.scss'

export const ChangeAccount = observer((): JSX.Element => {
    const vm = useViewModel(ChangeAccountViewModel)
    const search = useSearch(vm.items, vm.filter)
    const intl = useIntl()

    const [customScrollParent, setCustomScrollParent] = useState<HTMLElement | null>(null)
    const handleRef = useCallback((element: HTMLElement | null) => {
        if (element) {
            const container = element.closest<HTMLElement>('.sliding-panel__content')
            if (!container) throw new Error('Scrolling container not found')
            setCustomScrollParent(container)
        }
    }, [])

    return (
        <Container className="change-account" ref={handleRef}>
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
                    {customScrollParent && (
                        <Virtuoso
                            customScrollParent={customScrollParent}
                            fixedItemHeight={54}
                            data={search.list}
                            computeItemKey={(_, account) => account.address}
                            itemContent={(_, account) => (
                                <AccountItem
                                    address={account.address}
                                    name={account.name}
                                    seed={account.seed}
                                    onClick={vm.handleSelectAccount}
                                />
                            )}
                        />
                    )}
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
