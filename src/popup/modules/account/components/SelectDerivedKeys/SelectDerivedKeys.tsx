import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, Card, Container, Content, ErrorMessage, Footer, Header, Navbar, Pagination, Space } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { AccountSelector } from '../AccountSelector'
import styles from './SelectDerivedKeys.module.scss'

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
}

export const SelectDerivedKeys = observer((props: Props): JSX.Element => {
    const {
        publicKeys,
        preselectedKey,
        derivedKeys,
        storedKeys,
        error,
        loading,
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

    return (
        <Container>
            <Header>
                <Navbar back="..">
                    {intl.formatMessage({ id: 'SELECT_DERIVED_KEYS_PANEL_HEADER' })}
                </Navbar>
            </Header>

            <Content>
                <Space direction="column" gap="xl">
                    <Space direction="column" gap="l">
                        <Card bg="layer-1" size="xs" className={styles.list}>
                            {visiblePublicKeys.map((publicKey, index) => (
                                <AccountSelector
                                    key={publicKey}
                                    publicKey={publicKey}
                                    keyName={storedKeys[publicKey]?.name}
                                    checked={selectedKeys.has(publicKey)}
                                    setChecked={checked => onCheck(checked, publicKey)}
                                    index={`${startIndex + index + 1}`}
                                    preselected={publicKey === preselectedKey}
                                />
                            ))}
                        </Card>
                        <ErrorMessage>{error}</ErrorMessage>
                    </Space>

                    <Pagination
                        page={currentPage}
                        totalPages={pagesCount}
                        onChange={setCurrentPage}
                    />
                </Space>
            </Content>

            <Footer layer>
                <FooterAction>
                    <Button
                        key="select" design="accent" disabled={selectedKeys.size === 0}
                        loading={loading} onClick={onSelect}
                    >
                        {intl.formatMessage({ id: 'SELECT_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
