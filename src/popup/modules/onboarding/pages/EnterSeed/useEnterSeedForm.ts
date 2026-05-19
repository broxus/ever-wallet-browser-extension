import type * as nt from '@broxus/ever-wallet-wasm';
import { type ClipboardEventHandler, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import { type UserMnemonic } from '@app/models';
import { isFirefox, useResolve } from '@app/popup/modules/shared';

import { appRoutes } from '../../appRoutes';
import { ImportAccountStore } from '../../modules/ImportAccount/ImportAccountStore';

const makeMnemonicType = (wordsCount: number, userMnemonic?: UserMnemonic): nt.MnemonicType =>
    wordsCount === 12
        ? userMnemonic === 'TONTypesWallet'
            ? { type: 'bip39', data: { accountId: 0, path: 'ton', entropy: 'bits128' } }
            : { type: 'bip39', data: { accountId: 0, path: 'ever', entropy: 'bits128' } }
        : userMnemonic === 'TONBip39'
          ? { type: 'bip39', data: { accountId: 0, path: 'ton', entropy: 'bits256' } }
          : { type: 'legacy' };

// TODO refator this after write tests
export const useEnterSeedForm = (initialWordsCount: number) => {
    const navigate = useNavigate();
    const intl = useIntl();
    const form = useForm({ mode: 'all' });
    const vm = useResolve(ImportAccountStore);

    const [wordsCount, setWordsCount] = useState(initialWordsCount);
    const [userMnemonic, setUserMnemonic] = useState<UserMnemonic>('TONTypesWallet');
    const [error, setError] = useState<string>();

    const isTonOrHamster = useMemo(
        () => vm.networkType === 'ton' || vm.networkGroup === 'hmstr_mainnet',
        [vm.networkType, vm.networkGroup],
    );

    const values = form.watch();
    const isEmpty = Object.values(values).every((value) => !value || value.trim() === '');
    const isValid = form.formState.isValid;

    const isBip39 = useMemo(() => {
        if (!isTonOrHamster && !isValid) {
            return false;
        }

        const words = Object.values(values).slice(0, wordsCount);

        if (words.filter(Boolean).length !== wordsCount) return false;

        try {
            vm.validateMnemonic(words, {
                type: 'bip39',
                data: { accountId: 0, path: 'ton', entropy: 'bits256' },
            });
            return true;
        } catch (e) {
            console.warn(e);
            return false;
        }
    }, [isTonOrHamster, values, isValid, wordsCount, vm]);

    const addSeedPhrase = useCallback(
        (seedPhrase: string) => {
            try {
                const cleanedPhrase = seedPhrase
                    .toLowerCase()
                    .replace(/[^a-zA-Z]+/g, ' ')
                    .trim()
                    .replace(/\s+/g, ' ');

                const words = cleanedPhrase.split(' ').slice(0, wordsCount);

                if (words.length > 0 && words.length <= wordsCount) {
                    setTimeout(() => {
                        words.forEach((word, idx) => {
                            form.setValue(`word${idx}`, word, {
                                shouldValidate: true,
                                shouldDirty: true,
                                shouldTouch: true,
                            });
                        });
                    }, 0);
                }
            } catch (e: any) {
                console.error(e.message);
            }
        },
        [wordsCount, form],
    );

    const onPaste: ClipboardEventHandler<HTMLFormElement | HTMLInputElement> = useCallback(
        (event) => {
            const seedPhrase = event.clipboardData.getData('text/plain');
            addSeedPhrase(seedPhrase);
        },
        [addSeedPhrase],
    );

    const onFormInput = useCallback(
        (event: React.ChangeEvent<HTMLFormElement>) => {
            if (!isFirefox) return;
            addSeedPhrase(event.target.value);
        },
        [addSeedPhrase],
    );

    const submit = useCallback(
        async (data: Record<string, string>) => {
            try {
                if (form.formState.isValid) {
                    const words = Object.values(data).slice(0, wordsCount);
                    vm.submitSeed(
                        words,
                        makeMnemonicType(wordsCount, userMnemonic),
                        isTonOrHamster ? userMnemonic : undefined,
                    );
                    navigate(`${appRoutes.importAccount.path}/${appRoutes.createPassword.path}`);
                }
            } catch (e) {
                console.warn(e);
                setError(
                    intl.formatMessage({
                        id: 'THE_SEED_WRONG',
                    }),
                );
            }
        },
        [form.formState.isValid, wordsCount, userMnemonic, isTonOrHamster, vm, navigate, intl],
    );

    const handleCheckPhrase = useCallback(() => {
        submit(form.getValues());
    }, [submit, form]);

    const handleChangeWordsCount = useCallback(
        (value: number) => {
            setWordsCount(value);
            form.reset();
        },
        [form],
    );

    const handleBack = useCallback(() => {
        navigate(`${appRoutes.importAccount.path}/${appRoutes.selectNetwork.path}`);
    }, [navigate]);

    const clearForm = useCallback(() => {
        form.reset();
    }, [form]);

    // Auto-detect BIP39 for 24 words in TON
    useEffect(() => {
        if (isTonOrHamster && wordsCount === 24) {
            setUserMnemonic(isBip39 ? 'TONBip39' : 'TONStandard');
        }
    }, [isBip39, wordsCount, isTonOrHamster]);

    // Reset error and set default mnemonic type on words count change
    useEffect(() => {
        setError(undefined);
        if (wordsCount === 12) {
            setUserMnemonic('TONTypesWallet');
        } else if (wordsCount === 24) {
            setUserMnemonic('TONStandard');
        }
    }, [wordsCount]);

    return {
        form,
        wordsCount,
        userMnemonic,
        error,
        isEmpty,
        isTonOrHamster,
        onPaste,
        onFormInput,
        handleCheckPhrase,
        handleChangeWordsCount,
        handleBack,
        clearForm,
        setUserMnemonic,
    };
};
