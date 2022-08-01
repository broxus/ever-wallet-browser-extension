import { memo } from 'react'
import { useIntl } from 'react-intl'

import {
    Button, ButtonGroup, Container, Content, Footer, Header, SeedList,
} from '@app/popup/modules/shared'

interface Props {
    seedWords: string[];

    onNext(): void;

    onBack(): void;
}

export const NewSeedPhrase = memo(({ seedWords, onNext, onBack }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <Container className="accounts-management">
            <Header>
                <h2>{intl.formatMessage({ id: 'ADD_SEED_PANEL_SAVE_HEADER' })}</h2>
            </Header>

            <Content>
                <SeedList words={seedWords} />
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
    )
})
