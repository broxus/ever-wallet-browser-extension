/* eslint-disable react/no-array-index-key */
import { Button, CheckSeedInput } from '@app/popup/modules/shared';
import { shuffleArray } from '@app/shared';
import React, { memo, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import './CheckSeed.scss';

interface Props {
  onSubmit: () => void;
  onBack: () => void;
  seed: string;
}

const generateRandomNumbers = (length: number) => shuffleArray(new Array(length).fill(1).map((_, i) => i + 1))
  .slice(0, 4)
  .sort((a, b) => a - b);

// TODO: seed/shared module?
export const CheckSeed = memo(({ onSubmit, onBack, seed }: Props) => {
  const intl = useIntl();
  const { register, handleSubmit, formState } = useForm();

  const words = useMemo(() => seed.split(' '), [seed]);
  const numbers = useMemo(() => generateRandomNumbers(words.length), [words]);

  const validateWord = (word: string, position: number) => words?.[position - 1] === word;

  return (
    <div className="check-seed">
      <h2 className="check-seed__title">
        {intl.formatMessage({ id: 'CHECK_THE_SEED_PHRASE' })}
      </h2>
      <form id="words" className="check-seed__form" onSubmit={handleSubmit(onSubmit)}>
        {numbers.map((item: number, i: number) => (
          <CheckSeedInput
            key={i}
            number={item}
            autoFocus={i === 0}
            {...register(`word${i}`, {
              required: true,
              validate: (word: string) => validateWord(word, item),
            })}
          />
        ))}
        {(formState.errors.word0 ||
          formState.errors.word1 ||
          formState.errors.word2 ||
          formState.errors.word3) && (
          <div className="check-seed__error">
            {intl.formatMessage({ id: 'ERROR_SEED_DOES_NOT_MATCH' })}
          </div>
        )}
      </form>
      <div className="check-seed__buttons">
        <Button form="words" onClick={handleSubmit(onSubmit)}>
          {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
        </Button>
        <Button design="secondary" onClick={onBack}>
          {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
        </Button>
      </div>
    </div>
  );
});
