import React, { memo, useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Autocomplete, Button, DatasetItem, TagInput } from '@app/popup/modules/shared';

import './EnterSeed.scss';

interface Props {
  wordCount: number;
  getBip39Hints: (word: string) => string[];
  onSubmit: (words: string[]) => void;
  onBack: () => void;
}

export const EnterSeed = memo(({ wordCount, getBip39Hints, onSubmit, onBack }: Props) => {
  const intl = useIntl();
  const [words, setWords] = useState<string[]>([]);
  const [dataset, setDataset] = useState<DatasetItem[]>([]);

  const validator = useMemo(() => {
    const all = new Set(getBip39Hints(''));
    return (value: string) => all.has(value);
  }, []);

  const handleSearch = useCallback((value: string) => {
    if (value) {
      const dataset: DatasetItem[] = getBip39Hints(value).map((word) => ({
        id: word,
        label: word,
      }));

      setDataset(dataset);
    } else {
      setDataset([]);
    }
  }, []);

  const handleSelect = useCallback((item: DatasetItem) => setWords(
    (words) => [...words, item.id],
  ), []);

  return (
    <div className="enter-seed">
      <div className="enter-seed__form">
        <h2 className="enter-seed__title">
          {intl.formatMessage({ id: 'ENTER_SEED_PHRASE' })}
        </h2>
        <Autocomplete dataset={dataset} onSearch={handleSearch} onSelect={handleSelect}>
          {({ onChange, ...props }) => (
            <TagInput
              {...props}
              validator={validator}
              value={words}
              onChange={setWords}
              onInputChange={onChange}
            />
          )}
        </Autocomplete>
        <div className="enter-seed__words-count">
          {intl.formatMessage(
            { id: 'ENTER_SEED_PHRASE_WORDS_COUNTER' },
            {
              value: words.length,
              limit: wordCount,
            },
          )}
        </div>
      </div>
      <div className="enter-seed__buttons">
        <Button disabled={words.length !== wordCount} onClick={() => onSubmit(words)}>
          {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
        </Button>
        <Button design="secondary" onClick={onBack}>
          {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
        </Button>
      </div>
    </div>
  );
});
