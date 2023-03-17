import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Virtuoso } from 'react-virtuoso'

import SeedImg from '@app/popup/assets/img/seed.svg'
import {
    Button,
    ButtonGroup,
    Container,
    Content,
    Footer,
    Header,
    Input,
    useSearch,
    useViewModel,
} from '@app/popup/modules/shared'
import { ENVIRONMENT_TYPE_POPUP } from '@app/shared'

import { List } from '../List'
import { SeedDropdownMenu } from '../SeedDropdownMenu'
import { ManageSeedViewModel } from './ManageSeedViewModel'
import { KeyListItem } from './KeyListItem'

export const ManageSeed = observer((): JSX.Element => {
    const vm = useViewModel(ManageSeedViewModel)
    const search = useSearch(vm.derivedKeys, vm.filter)
    const intl = useIntl()

    return (
        <Container className="accounts-management">
            <Header>
                <div className="accounts-management__header">
                    <img className="accounts-management__header-img" src={SeedImg} alt="" />
                    <h2 className="accounts-management__header-title">
                        {vm.seedName}
                    </h2>
                    {vm.activeTab?.type !== ENVIRONMENT_TYPE_POPUP && vm.currentMasterKey && (
                        <SeedDropdownMenu keyEntry={vm.currentMasterKey} />
                    )}
                </div>

                <Input
                    className="accounts-management__search"
                    size="s"
                    placeholder={intl.formatMessage({ id: 'MANAGE_SEEDS_SEARCH_PLACEHOLDER' })}
                    {...search.props}
                />
            </Header>

            <Content className="accounts-management__content">
                <List className="accounts-management__keys">
                    <Virtuoso
                        useWindowScroll
                        fixedItemHeight={54}
                        data={search.list}
                        computeItemKey={(_, key) => key.publicKey}
                        itemContent={(_, key) => (
                            <KeyListItem
                                keyEntry={key}
                                active={vm.currentDerivedKeyPubKey === key.publicKey}
                                accounts={vm.accountsByKey[key.publicKey] ?? 0}
                                onClick={vm.onManageDerivedKey}
                            />
                        )}
                    />
                </List>
            </Content>

            <Footer>
                <ButtonGroup>
                    {vm.activeTab?.type !== ENVIRONMENT_TYPE_POPUP && (
                        <Button group="small" design="secondary" onClick={vm.onBack}>
                            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                        </Button>
                    )}
                    <Button disabled={vm.signerName === 'encrypted_key'} onClick={vm.addKey}>
                        {intl.formatMessage({ id: 'MANAGE_SEED_LIST_KEYS_ADD_NEW_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
