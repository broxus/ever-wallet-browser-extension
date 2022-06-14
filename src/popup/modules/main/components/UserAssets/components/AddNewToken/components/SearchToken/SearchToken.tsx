import { TokenWalletsToUpdate } from '@app/models';
import { Button, ButtonGroup } from '@app/popup/modules/shared';
import React, { memo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Token } from '../Token';

import './SearchToken.scss';

interface Props {
  tokens: { name: string; fullName: string; rootTokenContract: string; old: boolean }[];
  existingTokens: TokenWalletsToUpdate;
  disabled?: boolean;
  onSubmit: (params: TokenWalletsToUpdate) => void;
  onBack: () => void;
}

// TODO: refactor
export const SearchToken = memo(({ tokens, existingTokens, disabled, onSubmit, onBack }: Props): JSX.Element => {
  const intl = useIntl();
  const [result, setResult] = useState<TokenWalletsToUpdate>({});

  const hasChanges = Object.keys(result).length > 0;

  return (
    <div className="search-token">
      <div className="search-token__tokens">
        {tokens.map(({ name, fullName, rootTokenContract, old }) => {
          const address = rootTokenContract;

          const existing = existingTokens[address] ?? false;
          const enabled = result[address] == null ? existing : result[address];

          const handleToggle = (enabled: boolean) => {
            const newResult = { ...result };

            if (!existing && enabled) {
              newResult[address] = true;
            } else if (existing && !enabled) {
              newResult[address] = false;
            } else {
              delete newResult[address];
            }

            setResult(newResult);
          };

          return (
            <Token
              key={address}
              name={name}
              fullName={fullName}
              rootTokenContract={address}
              enabled={enabled}
              old={old}
              onToggle={handleToggle}
            />
          );
        })}
      </div>

      <ButtonGroup className="search-token__buttons">
        <Button group="small" design="secondary" onClick={onBack}>
          {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
        </Button>
        <Button disabled={disabled || !hasChanges} onClick={() => onSubmit(result)}>
          {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
        </Button>
      </ButtonGroup>
    </div>
  );
});
