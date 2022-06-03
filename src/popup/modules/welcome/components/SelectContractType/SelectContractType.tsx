import { Button, RadioButton } from '@app/popup/modules/shared';
import type { ContractType } from 'nekoton-wasm';
import React, { memo, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import './SelectContractType.scss';

// TODO: duplicate
const CONTRACT_TYPES: { [K in ContractType]: string } = {
  SafeMultisigWallet: 'SafeMultisig (default)',
  SafeMultisigWallet24h: 'SafeMultisig24',
  BridgeMultisigWallet: 'BridgeMultisigWallet',
  SurfWallet: 'Surf',
  WalletV3: 'WalletV3',
  SetcodeMultisigWallet: 'SetcodeMultisigWallet',
};

const CONTRACT_TYPES_KEYS = Object.keys(CONTRACT_TYPES) as ContractType[];

type Props = {
  onSubmit: (contractType: ContractType) => void;
  onBack?: () => void;
  onSkip?: () => void;
  excludedContracts?: ContractType[];
};

export const SelectContractType = memo(({ onSubmit, onBack, onSkip, excludedContracts }: Props) => {
  const intl = useIntl();
  const [walletType, updateWalletType] = useState<ContractType>('SafeMultisigWallet');

  const activeTypes = useMemo(
    () => CONTRACT_TYPES_KEYS.filter(
      (key) => !excludedContracts?.includes(key),
    ),
    [excludedContracts],
  );

  return (
    <div className="select-wallet">
      <div className="select-wallet__options">
        <h2 className="select-wallet__options-title">
          {intl.formatMessage({
            id: 'SELECT_WALLET_TYPE',
          })}
        </h2>

        {activeTypes.map((type) => (
          <RadioButton<ContractType>
            key={type}
            id={type}
            checked={walletType === type}
            value={type}
            onChange={updateWalletType}
          >
            {CONTRACT_TYPES[type]}
          </RadioButton>
        ))}
      </div>
      <div className="select-wallet__buttons">
        <Button onClick={() => onSubmit(walletType)}>
          {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
        </Button>
        {onBack && (
          <Button design="secondary" onClick={onBack}>
            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
          </Button>
        )}
        {onSkip && (
          <Button design="secondary" onClick={onSkip}>
            {intl.formatMessage({ id: 'SKIP_BTN_TEXT' })}
          </Button>
        )}
      </div>
    </div>
  );
});
