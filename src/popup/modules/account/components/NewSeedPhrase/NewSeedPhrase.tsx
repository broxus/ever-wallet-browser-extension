import { Button, ButtonGroup, Container, Content, Footer, Header } from '@app/popup/modules/shared';
import React, { memo } from 'react';
import { useIntl } from 'react-intl';

interface Props {
  seedWords: string[];
  onNext(): void;
  onBack(): void;
}

export const NewSeedPhrase = memo(({ seedWords, onNext, onBack }: Props): JSX.Element => {
  const intl = useIntl();

  return (
    <Container className="accounts-management">
      <Header>
        <h2>
          {intl.formatMessage({ id: 'ADD_SEED_PANEL_SAVE_HEADER' })}
        </h2>
      </Header>

      <Content>
        <ol>
          {seedWords?.map((word) => (
            <li key={word} className="accounts-management__content-word">
              {word.toLowerCase()}
            </li>
          ))}
        </ol>
      </Content>

      <Footer>
        <ButtonGroup>
          <Button group="small" design="secondary" onClick={onBack}>
            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
          </Button>
          <Button onClick={onNext}>
            {intl.formatMessage({ id: 'WROTE_ON_PAPER_BTN_TEXT' })}
          </Button>
        </ButtonGroup>
      </Footer>
    </Container>
  );
});
