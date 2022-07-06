import {
  Button,
  ButtonGroup,
  CheckSeedInput,
  Container,
  Content,
  ErrorMessage,
  Footer,
  Header,
} from '@app/popup/modules/shared';
import { shuffleArray } from '@app/shared';
import React, { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

interface Props {
  words: string[];
  onSubmit(): void;
  onBack(): void;
}

const generateRandomNumbers = (length: number) => shuffleArray(new Array(length).fill(1).map((_, i) => i + 1))
  .slice(0, 4)
  .sort((a, b) => a - b);

export function CheckNewSeedPhrase({ words, onSubmit, onBack }: Props) {
  const intl = useIntl();
  const { register, handleSubmit, formState } = useForm();

  const numbers = useMemo(() => generateRandomNumbers(words.length), [words]);
  const validateWord = useCallback((word: string, position: number) => words?.[position - 1] === word, [words]);

  return (
    <Container className="accounts-management">
      <Header>
        <h2>{intl.formatMessage({ id: 'CHECK_THE_SEED_PHRASE' })}</h2>
      </Header>

      <Content>
        <form
          id="words"
          className="accounts-management__content-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          {numbers.map((item, idx) => (
            <CheckSeedInput
              key={item}
              number={item}
              autoFocus={idx === 0}
              {...register(`word${idx}`, {
                required: true,
                validate: (word: string) => validateWord(word, item),
              })}
            />
          ))}
          {(formState.errors.word0 ||
            formState.errors.word1 ||
            formState.errors.word2 ||
            formState.errors.word3) && (
            <ErrorMessage>
              {intl.formatMessage({ id: 'ERROR_SEED_DOES_NOT_MATCH' })}
            </ErrorMessage>
          )}
        </form>
      </Content>

      <Footer>
        <ButtonGroup>
          <Button group="small" design="secondary" onClick={onBack}>
            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
          </Button>
          <Button type="submit" form="words">
            {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
          </Button>
        </ButtonGroup>
      </Footer>
    </Container>
  );
}
