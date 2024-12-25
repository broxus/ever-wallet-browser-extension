import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'

import { parseError } from '@app/popup/utils'
import { Loader, Tabs, Token, TokensManifest } from '@app/popup/modules/shared'
import { type JettonSymbol, TokenWalletsToUpdate } from '@app/models'
import { isTokenSymbol } from '@app/shared'

import { CustomToken } from './components/CustomToken'
import { SearchToken } from './components/SearchToken'
import './AddNewToken.scss'

interface Props {
    manifestLoading: boolean;
    tokensManifest: TokensManifest | undefined;
    tokensMeta: Record<string, Token | undefined> | undefined;
    tokenWallets: nt.TokenWalletAsset[];
    knownTokens: { [rootTokenContract: string]: nt.Symbol | JettonSymbol };
    onSubmit: (params: TokenWalletsToUpdate) => Promise<void>;
    onBack: () => void;
}

enum Tab {
    Predefined,
    Custom,
}

export const AddNewToken = observer((props: Props): JSX.Element => {
    const {
        manifestLoading,
        tokensManifest,
        tokenWallets,
        tokensMeta,
        knownTokens,
        onSubmit,
        onBack,
    } = props

    const intl = useIntl()
    const [activeTab, setActiveTab] = useState(Tab.Predefined)
    const [loading, setInProcess] = useState(false)
    const [error, setError] = useState<string>()

    const handleSubmit = useCallback(async (params: TokenWalletsToUpdate) => {
        setInProcess(true)
        try {
            await onSubmit(params)
            onBack()
        }
        catch (e: any) {
            setError(parseError(e))
            setInProcess(false)
        }
    }, [])

    const existingTokens: TokenWalletsToUpdate = {}
    const tokens = tokensManifest?.tokens?.map(token => ({
        name: token.symbol,
        fullName: token.name,
        rootTokenContract: token.address,
        old: !!token.version && token.version < 5 && !tokensManifest?.name?.startsWith('TON'),
    })) ?? []

    for (const token of tokenWallets) {
        existingTokens[token.rootTokenContract] = true

        if (!tokensMeta?.[token.rootTokenContract]) {
            const symbol = knownTokens[token.rootTokenContract]
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

    return (
        <div className="add-new-token">
            <h2 className="add-new-token__header">
                {intl.formatMessage({ id: 'USER_ASSETS_SELECT_ASSETS_HEADER' })}
            </h2>
            <div className="add-new-token__content">
                <Tabs className="add-new-token__tabs" tab={activeTab} onChange={setActiveTab}>
                    <Tabs.Tab id={Tab.Predefined}>
                        {intl.formatMessage({ id: 'USER_ASSETS_SELECT_ASSETS_TAB_SEARCH_LABEL' })}
                    </Tabs.Tab>
                    <Tabs.Tab id={Tab.Custom}>
                        {intl.formatMessage({ id: 'USER_ASSETS_SELECT_ASSETS_TAB_CUSTOM_TOKEN_LABEL' })}
                    </Tabs.Tab>
                </Tabs>

                {activeTab === Tab.Predefined && (
                    <>
                        {manifestLoading && (
                            <div className="add-new-token__loader">
                                <Loader />
                            </div>
                        )}
                        {!manifestLoading && (
                            <SearchToken
                                existingTokens={existingTokens}
                                tokens={tokens}
                                disabled={loading}
                                onSubmit={handleSubmit}
                                onBack={onBack}
                            />
                        )}
                    </>
                )}
                {activeTab === Tab.Custom && (
                    <CustomToken
                        disabled={loading}
                        error={error}
                        onBack={onBack}
                        onSubmit={handleSubmit}
                    />
                )}
            </div>
        </div>
    )
})
