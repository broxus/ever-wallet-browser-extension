import { memo, useState } from 'react'
import { useIntl } from 'react-intl'

import { TokenWalletsToUpdate } from '@app/models'
import { Button, Content, Footer } from '@app/popup/modules/shared'

import { TokenItem } from '../TokenItem'

interface Props {
    tokens: { name: string; fullName: string; rootTokenContract: string; old: boolean }[];
    existingTokens: TokenWalletsToUpdate;
    loading?: boolean;
    onSubmit: (params: TokenWalletsToUpdate) => void;
}

export const SearchToken = memo(({ tokens, existingTokens, loading, onSubmit }: Props): JSX.Element => {
    const intl = useIntl()
    const [result, setResult] = useState<TokenWalletsToUpdate>({})

    return (
        <>
            <Content>
                {tokens.map(({ name, fullName, rootTokenContract, old }) => {
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
            </Content>

            <Footer>
                <Button loading={loading} onClick={() => onSubmit(result)}>
                    {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
                </Button>
            </Footer>
        </>
    )
})
