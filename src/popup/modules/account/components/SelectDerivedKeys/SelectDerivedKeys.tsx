import type nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useIntl } from 'react-intl'

import {
    Button, ButtonGroup, Container, Content, ErrorMessage, Footer, Header, Nav,
} from '@app/popup/modules/shared'

import { AccountSelector } from '../AccountSelector'

const PAGE_LENGTH = 5

type PublicKeys = Map<string, number>;

interface Props {
    publicKeys: PublicKeys;
    preselectedKey: string;
    storedKeys: Record<string, nt.KeyStoreEntry>;
    derivedKeys: nt.KeyStoreEntry[];
    loading?: boolean;
    error?: string;
    onSubmit: (publicKeys: PublicKeys) => void;
    onBack: () => void;
}

export const SelectDerivedKeys = observer((props: Props): JSX.Element => {
    const {
        publicKeys,
        preselectedKey,
        derivedKeys,
        storedKeys,
        error,
        loading,
        onBack,
        onSubmit,
    } = props

    const intl = useIntl()
    const [selectedKeys, setSelectedKeys] = useState<PublicKeys>(
        () => new Map(derivedKeys.map(({ publicKey, accountId }) => [publicKey, accountId])),
    )
    const [currentPage, setCurrentPage] = useState<number>(0)

    const pagesCount = Math.ceil(publicKeys.size / PAGE_LENGTH)
    const startIndex = currentPage * PAGE_LENGTH
    const endIndex = startIndex + PAGE_LENGTH
    const visiblePublicKeys = [...publicKeys.keys()].slice(startIndex, endIndex)

    const onSelect = () => onSubmit(selectedKeys)

    const onCheck = (checked: boolean, publicKey: string) => {
        setSelectedKeys(selectedKeys => {
            const accountId = publicKeys.get(publicKey)

            if (checked && accountId !== undefined) {
                selectedKeys.set(publicKey, accountId)
            }
            else if (!checked) {
                selectedKeys.delete(publicKey)
            }

            return new Map([...selectedKeys])
        })
    }

    const onClickNext = () => {
        setCurrentPage(page => (page < pagesCount - 1 ? (page + 1) : page))
    }

    const onClickPrev = () => {
        setCurrentPage(page => (page > 0 ? (page - 1) : page))
    }

    return (
        <Container className="accounts-management">
            <Header>
                <h2>{intl.formatMessage({ id: 'SELECT_DERIVED_KEYS_PANEL_HEADER' })}</h2>
            </Header>

            <Content>
                <Nav
                    showNext
                    showPrev
                    hint={intl.formatMessage(
                        { id: 'SELECT_DERIVED_KEYS_NAV_HINT' },
                        { value: currentPage + 1, limit: pagesCount },
                    )}
                    title={intl.formatMessage({ id: 'SELECT_DERIVED_KEYS_NAV_TITLE' })}
                    onClickNext={onClickNext}
                    onClickPrev={onClickPrev}
                />

                {visiblePublicKeys.map((publicKey, index) => (
                    <AccountSelector
                        key={publicKey}
                        publicKey={publicKey}
                        keyName={storedKeys[publicKey]?.name}
                        checked={selectedKeys.has(publicKey)}
                        setChecked={checked => onCheck(checked, publicKey)}
                        index={`${startIndex + index + 1}`}
                        preselected={publicKey === preselectedKey}
                        disabled={loading}
                    />
                ))}
                <ErrorMessage>{error}</ErrorMessage>
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button
                        group="small" design="secondary" disabled={loading}
                        onClick={onBack}
                    >
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>

                    <Button disabled={loading} onClick={onSelect}>
                        {intl.formatMessage({ id: 'SELECT_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
