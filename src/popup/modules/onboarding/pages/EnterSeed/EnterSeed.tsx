import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { FormProvider } from 'react-hook-form';

import { Button, ErrorMessage, Space, useSlidingPanel, useViewModel } from '@app/popup/modules/shared';
import { NetworksViewModel } from '@app/popup/modules/network/components/Networks/NetworksViewModel';

import s from './EnterSeed.module.scss';
import { NavigationBar } from '../../components/NavigationBar';
import { ClearModal } from './ClearModal';
import { WordsCountToggle } from './WordsCountToggle';
import { WalletTypeSelector } from './WalletTypeSelector';
import { SeedPhraseFormFields } from './SeedPhraseFormFields';
import { useEnterSeedForm } from './useEnterSeedForm';

export const EnterSeed = observer(() => {
    const intl = useIntl();
    const network = useViewModel(NetworksViewModel);
    const blockchain = network.config.blockchainsByGroup[network.selectedConnection.group];
    const isMultiple = blockchain.seedPhraseWordsCount.length === 2;

    const {
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
    } = useEnterSeedForm(Math.min(...blockchain.seedPhraseWordsCount));

    const panel = useSlidingPanel();

    const handleOpenClearModal = () =>
        panel.open({
            render: () => (
                <ClearModal
                    onCancel={() => panel.close()}
                    onClear={() => {
                        clearForm();
                        panel.close();
                    }}
                />
            ),
            onClose: () => {
                panel.close();
            },
            variant: 'modal',
            title: intl.formatMessage({ id: 'CLEAR_ALL_INPUT_FIELDS' }),
        });

    return (
        <FormProvider {...form}>
            <div className={classNames(s.container, wordsCount === 12 ? s.enterSeed12 : s.enterSeed24)}>
                <div>
                    <div className={s.header}>
                        <Space direction="column" gap="l">
                            <h2 className={s.title}>{intl.formatMessage({ id: 'ENTER_SEED_PHRASE' })}</h2>
                            <p className={s.text} />
                        </Space>
                    </div>
                    <div>
                        {isMultiple && (
                            <WordsCountToggle wordsCount={wordsCount} onChangeWordsCount={handleChangeWordsCount} />
                        )}

                        <div>
                            <SeedPhraseFormFields wordsCount={wordsCount} onPaste={onPaste} onFormInput={onFormInput} />
                        </div>

                        <div className={s.footer}>
                            {isTonOrHamster && (
                                <WalletTypeSelector
                                    wordsCount={wordsCount}
                                    userMnemonic={userMnemonic}
                                    onChangeUserMnemonic={setUserMnemonic}
                                />
                            )}

                            <Button
                                design="ghost"
                                disabled={isEmpty}
                                className={s.clearButton}
                                onClick={handleOpenClearModal}
                            >
                                {intl.formatMessage({ id: 'CLEAR_ALL' })}
                            </Button>
                        </div>

                        <ErrorMessage className={s.errors}>{error}</ErrorMessage>
                    </div>
                </div>
                <NavigationBar onNext={handleCheckPhrase} onBack={handleBack} disabled={!form.formState.isValid} />
            </div>
        </FormProvider>
    );
});
