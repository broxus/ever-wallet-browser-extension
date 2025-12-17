/* eslint-disable no-nested-ternary */
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { repackAddress } from '@broxus/ever-wallet-wasm'

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
import { type TokenWalletsToUpdate } from '@app/models'
import { TokenItem } from '@app/popup/modules/main/components/ManageAssets/components/TokenItem'
import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'

import { ManageAssetsViewModel } from './ManageAssetsViewModel'
import styles from './ManageAssets.module.scss'
import { useGetTokens } from './lib/useGetTokens'

type SearchItem = {
    name: string;
    fullName: string;
    rootTokenContract: string;
    old: boolean;
}

export const ManageAssets = observer(() => {
    const vm = useViewModel(ManageAssetsViewModel)
    const intl = useIntl()
    const [result, setResult] = useState<TokenWalletsToUpdate>({})

    const { tokens, existingTokens } = useGetTokens(vm)

    const search = useSearch(tokens, filter)

    const tokenAddress = React.useMemo(() => {
        if (/^(?:-1|0):[0-9a-fA-F]{64}$/.test(search.props.value)) {
            return search.props.value
        }

        try {
            return repackAddress(search.props.value)
        }
        catch (error) {
            return ''
        }
    }, [search.props.value])

    const isTokenAddressValid = React.useMemo(
        () => tokenAddress && vm.checkAddress(tokenAddress),
        [tokenAddress],
    )

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
                                    : tokenAddress && !isTokenAddressValid
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

                        {!search.list.length && !tokenAddress && (
                            <div className={styles.empty}>
                                <Empty />
                            </div>
                        )}
                    </Content>
                )}

                <Footer className={styles.footer}>
                    {tokenAddress ? (
                        <Button
                            design="accent"
                            loading={vm.loading}
                            onClick={() => vm.submit({ [tokenAddress]: true })}
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
