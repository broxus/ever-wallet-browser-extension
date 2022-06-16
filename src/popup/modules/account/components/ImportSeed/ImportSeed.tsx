import { Button, ButtonGroup, Container, Content, ErrorMessage, Footer, Header } from '@app/popup/modules/shared';
import React, { memo, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { ImportSeedInput } from './ImportSeedInput';

interface Props {
  error?: string;
  wordsCount: number;
  getBip39Hints: (word: string) => string[];
  onSubmit(words: string[]): void;
  onBack(): void;
}

export const ImportSeed = memo(({ error, wordsCount, getBip39Hints, onSubmit, onBack }: Props): JSX.Element => {
  const intl = useIntl();
  const form = useForm({ mode: 'all' });

  const numbers = React.useMemo(
    () => new Array(wordsCount).fill(1).map((_, i) => i + 1),
    [wordsCount],
  );

  const onPaste: React.ClipboardEventHandler<HTMLFormElement | HTMLInputElement> = useCallback((event) => {
    try {
      const seedPhrase = event.clipboardData.getData('text/plain');
      const words = seedPhrase
        .replace(/\r\n|\r|\n/g, ' ')
        .replace(/\s\s+/g, ' ')
        .split(' ')
        .slice(0, wordsCount);

      if (words.length > 0 && words.length <= wordsCount) {
        setTimeout(() => {
          words.forEach((word, idx) => {
            form.setValue(`word${idx + 1}`, word);
          });
        }, 0);
      }
    } catch (e: any) {
      console.log(e.message);
    }
  }, [form]);

  const submit = useCallback((data: Record<string, string>) => onSubmit(Object.values(data)), [onSubmit]);

  console.log(form);

  return (
    <Container className="accounts-management">
      <Header>
        <h2>{intl.formatMessage({ id: 'IMPORT_SEED_PANEL_HEADER' })}</h2>
      </Header>

      <Content>
        <FormProvider {...form}>
          <form
            id="words"
            className="accounts-management__content-form"
            onSubmit={form.handleSubmit(submit)}
            onPaste={onPaste}
          >
            <div className="accounts-management__seed-columns">
              <div className="accounts-management__seed-column">
                {numbers.slice(0, wordsCount / 2).map((number) => (
                  <ImportSeedInput key={number} name={`word${number}`} getBip39Hints={getBip39Hints} />
                ))}
              </div>
              <div className="accounts-management__seed-column">
                {numbers.slice(wordsCount / 2, wordsCount).map((number) => (
                  <ImportSeedInput key={number} name={`word${number}`} getBip39Hints={getBip39Hints} />
                ))}
              </div>
            </div>

            <ErrorMessage>{error}</ErrorMessage>
          </form>
        </FormProvider>
      </Content>

      <Footer>
        <ButtonGroup>
          <Button group="small" design="secondary" onClick={onBack}>
            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
          </Button>
          <Button form="words" type="submit" disabled={!form.formState.isValid}>
            {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
          </Button>
        </ButtonGroup>
      </Footer>
    </Container>
  );
});
