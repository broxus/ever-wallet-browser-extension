import React from 'react';
import { useIntl } from 'react-intl';

import { Button, Space } from '@app/popup/modules/shared';

import s from './EnterSeed.module.scss';

interface WordsCountToggleProps {
    wordsCount: number;
    onChangeWordsCount: (value: number) => void;
}

export const WordsCountToggle: React.FC<WordsCountToggleProps> = ({ wordsCount, onChangeWordsCount }) => {
    const intl = useIntl();

    return (
        <div className={s.tabs}>
            <Space direction="row" gap="s">
                <Button design={wordsCount === 12 ? 'accent' : 'neutral'} onClick={() => onChangeWordsCount(12)}>
                    {intl.formatMessage({ id: '12_WORDS' })}
                </Button>
                <Button design={wordsCount === 24 ? 'accent' : 'neutral'} onClick={() => onChangeWordsCount(24)}>
                    {intl.formatMessage({ id: '24_WORDS' })}
                </Button>
            </Space>
        </div>
    );
};
