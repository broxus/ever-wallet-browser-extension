import React from 'react';

import { RadioButton } from '@app/popup/modules/shared';
import { type UserMnemonic } from '@app/models';

import s from './EnterSeed.module.scss';

interface WalletTypeSelectorProps {
    wordsCount: number;
    userMnemonic: UserMnemonic;
    onChangeUserMnemonic: (value: UserMnemonic) => void;
}

export const WalletTypeSelector: React.FC<WalletTypeSelectorProps> = ({
    wordsCount,
    userMnemonic,
    onChangeUserMnemonic,
}) => {
    if (wordsCount === 24) {
        return (
            <div className={s.walletType}>
                Seed phrase format:
                <RadioButton
                    labelPosition="after"
                    value="TONStandard"
                    checked={userMnemonic === 'TONStandard'}
                    onChange={() => onChangeUserMnemonic('TONStandard')}
                >
                    TON Standard
                </RadioButton>
                <RadioButton
                    labelPosition="after"
                    value="TONBip39"
                    checked={userMnemonic === 'TONBip39'}
                    onChange={() => onChangeUserMnemonic('TONBip39')}
                >
                    TON Bip39
                </RadioButton>
            </div>
        );
    }

    return (
        <div className={s.walletType}>
            Your seed phrase from:
            <RadioButton
                labelPosition="after"
                value="SparXWallet"
                checked={userMnemonic === 'SparXWallet'}
                onChange={() => onChangeUserMnemonic('SparXWallet')}
            >
                SparX wallet
            </RadioButton>
            <RadioButton
                labelPosition="after"
                value="TONTypesWallet"
                checked={userMnemonic === 'TONTypesWallet'}
                onChange={() => onChangeUserMnemonic('TONTypesWallet')}
            >
                TON types wallet
            </RadioButton>
        </div>
    );
};
