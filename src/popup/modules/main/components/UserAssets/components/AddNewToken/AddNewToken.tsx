import { TokenWalletsToUpdate } from '@app/models';
import { Loader, Tabs, TokensManifest, TokensManifestItem } from '@app/popup/modules/shared';
import { parseError } from '@app/popup/utils';
import type nt from '@wallet/nekoton-wasm';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { CustomToken } from './components/CustomToken';
import { SearchToken } from './components/SearchToken';

import './AddNewToken.scss';

interface Props {
  tokensManifest: TokensManifest | undefined;
  tokensMeta:Record<string, TokensManifestItem> | undefined;
  tokenWallets: nt.TokenWalletAsset[];
  knownTokens: { [rootTokenContract: string]: nt.Symbol };
  onSubmit: (params: TokenWalletsToUpdate) => Promise<void>;
  onBack: () => void;
}

enum Tab {
  Predefined,
  Custom,
}

export const AddNewToken = observer((props: Props): JSX.Element => {
  const {
    tokensManifest,
    tokenWallets,
    tokensMeta,
    knownTokens,
    onSubmit,
    onBack,
  } = props;

  const intl = useIntl();
  const [activeTab, setActiveTab] = useState(Tab.Predefined);
  const [loading, setInProcess] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = useCallback(async (params: TokenWalletsToUpdate) => {
    setInProcess(true);
    try {
      await onSubmit(params);
      onBack();
    } catch (e: any) {
      setError(parseError(e));
      setInProcess(false);
    }
  }, []);

  const existingTokens: TokenWalletsToUpdate = {};
  const tokens = tokensManifest?.tokens?.map((token) => ({
    name: token.symbol,
    fullName: token.name,
    rootTokenContract: token.address,
    old: !!token.version && token.version < 5,
  })) ?? [];

  for (const token of tokenWallets) {
    existingTokens[token.rootTokenContract] = true;

    if (!tokensMeta?.[token.rootTokenContract]) {
      const symbol = knownTokens[token.rootTokenContract];
      if (!symbol) {
        continue;
      }

      tokens.push({
        name: symbol.name,
        fullName: symbol.fullName,
        rootTokenContract: symbol.rootTokenContract,
        old: symbol.version !== 'Tip3',
      });
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

        {activeTab === Tab.Predefined &&
          (tokensManifest?.tokens?.length ? (
            <SearchToken
              existingTokens={existingTokens}
              tokens={tokens}
              disabled={loading}
              onSubmit={handleSubmit}
              onBack={onBack}
            />
          ) : (
            <div className="add-new-token__loader">
              <Loader />
            </div>
          ))}
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
  );
});
