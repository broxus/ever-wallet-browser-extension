import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { CSSProperties, ReactNode } from 'react'

import SeedImg from '@app/popup/assets/img/seed.svg'
import KeyIcon from '@app/popup/assets/icons/key.svg'
import CopyIcon from '@app/popup/assets/icons/copy.svg'
import {
    Button,
    ButtonGroup,
    Container,
    Content,
    CopyText,
    Footer,
    Header,
    IconButton,
    Input,
    useSearch,
    useViewModel,
} from '@app/popup/modules/shared'
import { convertPublicKey, ENVIRONMENT_TYPE_POPUP } from '@app/shared'

import { List } from '../List'
import { SeedDropdownMenu } from '../SeedDropdownMenu'
import { ManageSeedViewModel } from './ManageSeedViewModel'

const keyIcon = <KeyIcon />
const copyIcon = <CopyIcon />

const tooltipStyle: CSSProperties = {
    fontSize: '12px',
    lineHeight: '16px',
    padding: '8px',
    zIndex: 102,
}

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
                    {search.list.map((key) => {
                        let name: ReactNode = key.name
                        const active = vm.currentDerivedKeyPubKey === key.publicKey

                        if (active) {
                            name = (
                                <>
                                    <span>{name}</span>
                                    <small>{intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ITEM_CURRENT' })}</small>
                                </>
                            )
                        }

                        return (
                            <List.Item
                                key={key.publicKey}
                                active={vm.currentDerivedKeyPubKey === key.publicKey}
                                icon={keyIcon}
                                name={name}
                                info={
                                    <>
                                        {convertPublicKey(key.publicKey)}
                                        <span>&nbsp;•&nbsp;</span>
                                        {intl.formatMessage(
                                            { id: 'ACCOUNTS_PLURAL' },
                                            { count: vm.accountsByKey[key.publicKey] ?? 0 },
                                        )}
                                    </>
                                }
                                addon={(
                                    <CopyText
                                        noArrow
                                        text={key.publicKey}
                                        tooltipText={intl.formatMessage({ id: 'COPY_DERIVED_KEY_BTN_TEXT' })}
                                        style={tooltipStyle}
                                    >
                                        <IconButton icon={copyIcon} />
                                    </CopyText>
                                )}
                                onClick={() => vm.onManageDerivedKey(key)}
                            />
                        )
                    })}
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
