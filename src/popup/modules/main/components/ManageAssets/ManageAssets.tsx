/* eslint-disable no-nested-ternary */
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'

import {
    Button,
    Container,
    Content,
    Empty,
    ErrorMessage,
    Footer,
    FormControl,
    Input,
    Loader,
    useSearch,
    useViewModel,
} from '@app/popup/modules/shared'
import { TokenWalletsToUpdate } from '@app/models'
import { TokenItem } from '@app/popup/modules/main/components/ManageAssets/components/TokenItem'
import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'
import { isTokenSymbol } from '@app/shared'

import { ManageAssetsViewModel } from './ManageAssetsViewModel'
import styles from './ManageAssets.module.scss'

type SearchItem = {
    name: string;
    fullName: string;
    rootTokenContract: string;
    old: boolean;
};

export const ManageAssets = observer((): JSX.Element => {
    const vm = useViewModel(ManageAssetsViewModel)
    const intl = useIntl()
    const [result, setResult] = useState<TokenWalletsToUpdate>({})

    const { tokens, existingTokens } = React.useMemo(() => {
        const tokens = vm.tokensManifest?.tokens?.map((token) => ({
            name: token.symbol,
            fullName: token.name,
            rootTokenContract: token.address,
            old: !!token.version && token.version < 5 && !vm.tokensManifest?.name?.startsWith('TON'),
        })) ?? []

        const existingTokens: TokenWalletsToUpdate = {}
        for (const token of vm.tokenWalletAssets) {
            existingTokens[token.rootTokenContract] = true

            if (!vm.tokens?.[token.rootTokenContract]) {
                const symbol = vm.knownTokens[token.rootTokenContract]
                if (!symbol) {
                    continue
                }

                tokens.push({
                    name: symbol.name,
                    fullName: symbol.fullName,
                    rootTokenContract: symbol.rootTokenContract,
                    old: isTokenSymbol(symbol) && symbol.version === 'OldTip3v4',
                })
            }
        }

        return { existingTokens, tokens }
    }, [vm.tokenWalletAssets, vm.tokens, vm.knownTokens, vm.tokensManifest?.tokens])

    const search = useSearch(tokens, filter)

    const isTokenAddress = React.useMemo(
        () => /^(?:-1|0):[0-9a-fA-F]{64}$/.test(search.props.value),
        [search.props.value],
    )

    const isTokenAddressValid = React.useMemo(
        () => isTokenAddress && vm.checkAddress(search.props.value),
        [search.props.value, isTokenAddress],
    )

    // const selectAll = () => {
    //     const newResult: TokenWalletsToUpdate = {}
    //     search.list.forEach((item) => {
    //         newResult[item.rootTokenContract] = true
    //     })
    //     setResult(newResult)
    // }

    React.useEffect(() => {
        vm.clearError()
    }, [search.props.value])

    return (
        <>
            <SlidingPanelHeader
                title={intl.formatMessage({ id: 'ASSETS_MANAGEMENT' })}
                onClose={vm.close}
            />

            <Container>
                {vm.manifestLoading ? (
                    <div className={styles.loader}>
                        <Loader size={24} />
                    </div>
                ) : (
                    <Content>
                        <FormControl>
                            <Input
                                {...search.props}
                                invalid={!!vm.error}
                                size="xs"
                                showReset
                                type="search"
                                placeholder={intl.formatMessage({ id: 'SEARCH_NAME_ROOT_ADDRESS' })}
                                className={styles.input}
                            />

                            <ErrorMessage>
                                {vm.error
                                    ? vm.error
                                    : isTokenAddress && !isTokenAddressValid
                                        ? intl.formatMessage({ id: 'ERROR_INVALID_ADDRESS' })
                                        : undefined}
                            </ErrorMessage>
                        </FormControl>

                        {search.list.length > 0 && (
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
                                            disabled={vm.loading}
                                            onToggle={handleToggle}
                                        />
                                    )
                                })}
                            </div>
                        )}

                        {!search.list.length && !isTokenAddress && (
                            <div className={styles.empty}>
                                <Empty />
                            </div>
                        )}
                    </Content>
                )}

                <Footer className={styles.footer}>
                    {isTokenAddress ? (
                        <Button
                            design="accent"
                            loading={vm.loading}
                            onClick={() => vm.submit({ [search.props.value]: true })}
                        >
                            {intl.formatMessage({ id: 'ADD_BTN_TEXT' })}
                        </Button>
                    ) : (
                        <Button
                            design="accent"
                            disabled={Object.values(result).length === 0}
                            loading={vm.loading}
                            onClick={() => vm.submit(result)}
                        >
                            {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
                        </Button>
                    )}
                </Footer>
            </Container>
        </>
    )
})

function filter(list: SearchItem[], search: string): SearchItem[] {
    return list.filter(
        ({ name, fullName }) => name.toLowerCase().includes(search) || fullName.toLowerCase().includes(search),
    )
}
