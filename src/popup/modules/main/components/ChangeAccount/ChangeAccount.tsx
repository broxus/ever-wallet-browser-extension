import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Virtuoso } from 'react-virtuoso'
import { useCallback, useState } from 'react'

import { Container, Content, EmptyPlaceholder, Scroller, SearchInput, useSearch, useViewModel } from '@app/popup/modules/shared'

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
            <Content>
                <SearchInput
                    placeholder={intl.formatMessage({ id: 'CHANGE_ACCOUNT_SEARCH_PLACEHOLDER' })}
                    {...search.props}
                />
                <h2 className="change-account__title">
                    {intl.formatMessage({ id: 'CHANGE_ACCOUNT_TITLE' })}
                </h2>


                <div className="change-account__list">
                    {customScrollParent && (
                        <Virtuoso
                            components={{ EmptyPlaceholder, Scroller }}
                            customScrollParent={customScrollParent}
                            fixedItemHeight={72}
                            data={search.list}
                            computeItemKey={(_, account) => account.address}
                            itemContent={(_, account) => (
                                <AccountItem
                                    {...account}
                                    active={account.address === vm.selectedAccountAddress}
                                    onClick={vm.handleSelectAccount}
                                />
                            )}
                        />
                    )}
                </div>
            </Content>
        </Container>
    )
})
