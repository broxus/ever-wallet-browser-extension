import { memo, useState } from 'react'
import { useIntl } from 'react-intl'

import { TokenWalletsToUpdate } from '@app/models'
import { Button, Content, Empty, Footer, SearchInput, useSearch } from '@app/popup/modules/shared'

import { TokenItem } from '../TokenItem'
import styles from './SearchToken.module.scss'

interface Props {
    tokens: Token[];
    existingTokens: TokenWalletsToUpdate;
    loading?: boolean;
    onSubmit: (params: TokenWalletsToUpdate) => void;
}

type Token = { name: string; fullName: string; rootTokenContract: string; old: boolean }

export const SearchToken = memo(({ tokens, existingTokens, loading, onSubmit }: Props): JSX.Element => {
    const intl = useIntl()
    const [result, setResult] = useState<TokenWalletsToUpdate>({})
    const search = useSearch(tokens, filter)

    return (
        <>
            <Content>
                <SearchInput {...search.props} />

                <div className={styles.list}>
                    {search.list.map(({ name, fullName, rootTokenContract, old }) => {
                        const address = rootTokenContract
                        const existing = existingTokens[address] ?? false
                        const enabled = result[address] == null ? existing : result[address]

                        const handleToggle = (enabled: boolean) => {
                            const newResult = { ...result }

                            if (!existing && enabled) {
                                newResult[address] = true
                            }
                            else if (existing && !enabled) {
                                newResult[address] = false
                            }
                            else {
                                delete newResult[address]
                            }

                            setResult(newResult)
                        }

                        return (
                            <TokenItem
                                key={address}
                                name={name}
                                fullName={fullName}
                                rootTokenContract={address}
                                enabled={enabled}
                                old={old}
                                onToggle={handleToggle}
                            />
                        )
                    })}
                </div>

                {!search.list.length && (
                    <div className={styles.empty}>
                        <Empty />
                    </div>
                )}
            </Content>

            <Footer>
                <Button loading={loading} onClick={() => onSubmit(result)}>
                    {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
                </Button>
            </Footer>
        </>
    )
})

function filter(list: Token[], search: string): Token[] {
    return list.filter(
        ({ name, fullName }) => name.toLowerCase().includes(search) || fullName.toLowerCase().includes(search),
    )
}
